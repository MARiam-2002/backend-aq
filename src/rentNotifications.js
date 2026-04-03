/**
 * Derives alert items from tenant rows (same rules as frontend rentStatus.ts).
 */

const CONTRACT_WARN_DAYS = 60;

function parseLocalDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function isContractEnded(contractEndDate) {
  const end = parseLocalDate(contractEndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end < today;
}

function getRentStatus(t) {
  if (isContractEnded(t.contractEndDate)) return "Contract ended";
  if (t.currentMonthPaid) return "Paid";
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  if (t.lastPaidDate) {
    const last = parseLocalDate(t.lastPaidDate);
    if (last.getFullYear() === y && last.getMonth() === m) return "Paid";
  }
  const day = now.getDate();
  if (day > 5) return "Overdue";
  return "Due";
}

function daysUntilContractEnd(contractEndDate) {
  const end = parseLocalDate(contractEndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

export function rowToTenant(row) {
  return {
    id: String(row.id),
    name: row.name,
    whatsapp: row.whatsapp,
    rentAmount: Number(row.rent_amount),
    rentSchedule: row.rent_schedule,
    contractEndDate: row.contract_end_date,
    lastPaidDate: row.last_paid_date,
    currentMonthPaid: Boolean(row.current_month_paid),
  };
}

/**
 * @param {object[]} rows - Supabase `tenants` rows
 * @returns {object[]} notification DTOs for the API
 */
export function buildNotificationsFromRows(rows) {
  const createdAt = new Date().toISOString();
  const out = [];

  for (const row of rows) {
    const t = rowToTenant(row);
    const tid = t.id;

    if (isContractEnded(t.contractEndDate)) {
      out.push({
        id: `${tid}-contract-ended`,
        type: "contract_ended",
        messageKey: "notifications.contractEnded",
        params: { name: t.name },
        tenantId: tid,
        createdAt,
      });
      continue;
    }

    const daysLeft = daysUntilContractEnd(t.contractEndDate);
    if (daysLeft > 0 && daysLeft <= CONTRACT_WARN_DAYS) {
      out.push({
        id: `${tid}-contract-soon`,
        type: "contract_ending",
        messageKey: "notifications.contractEnding",
        params: { name: t.name, days: daysLeft },
        tenantId: tid,
        createdAt,
      });
    }

    const status = getRentStatus(t);
    if (status === "Overdue") {
      out.push({
        id: `${tid}-rent-overdue`,
        type: "rent_overdue",
        messageKey: "notifications.rentOverdue",
        params: { name: t.name },
        tenantId: tid,
        createdAt,
      });
    } else if (status === "Due") {
      out.push({
        id: `${tid}-rent-due`,
        type: "rent_due",
        messageKey: "notifications.rentDue",
        params: { name: t.name },
        tenantId: tid,
        createdAt,
      });
    }
  }

  return out;
}
