/**
 * Derives alert items from tenant rows (same rules as frontend rentStatus.ts).
 * Uses server calendar date via getTodayYmd() — not the client device clock.
 */

import { getTodayYmd } from "./serverTime.js";

const CONTRACT_WARN_DAYS = 60;

function parseLocalDate(iso) {
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function isContractEnded(contractEndDate, todayYmd) {
  return contractEndDate < todayYmd;
}

function getRentStatus(t, todayYmd) {
  if (isContractEnded(t.contractEndDate, todayYmd)) return "Contract ended";
  if (t.currentMonthPaid) return "Paid";
  const [y, m, d] = todayYmd.split("-").map(Number);
  const monthIndex = m - 1;
  if (t.lastPaidDate) {
    const last = parseLocalDate(t.lastPaidDate);
    if (last.getFullYear() === y && last.getMonth() === monthIndex) return "Paid";
  }
  if (d > 5) return "Overdue";
  return "Due";
}

function daysUntilContractEnd(contractEndDate, todayYmd) {
  const end = parseLocalDate(contractEndDate);
  const today = parseLocalDate(todayYmd);
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
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
  const todayYmd = getTodayYmd();
  const createdAt = new Date().toISOString();
  const out = [];

  for (const row of rows) {
    const t = rowToTenant(row);
    const tid = t.id;

    if (isContractEnded(t.contractEndDate, todayYmd)) {
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

    const daysLeft = daysUntilContractEnd(t.contractEndDate, todayYmd);
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

    const status = getRentStatus(t, todayYmd);
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
