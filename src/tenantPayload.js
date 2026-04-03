/**
 * Map client JSON (camelCase) to Supabase `tenants` columns (snake_case).
 */

export function insertBodyFromClient(body) {
  const out = {};
  if (body.id) out.id = body.id;
  if (body.name != null) out.name = body.name;
  if (body.whatsapp != null) out.whatsapp = body.whatsapp;
  if (body.rentAmount != null || body.rent_amount != null) {
    out.rent_amount = Number(body.rentAmount ?? body.rent_amount);
  }
  if (body.rentSchedule != null || body.rent_schedule != null) {
    out.rent_schedule = body.rentSchedule ?? body.rent_schedule;
  }
  if (body.contractEndDate != null || body.contract_end_date != null) {
    out.contract_end_date = body.contractEndDate ?? body.contract_end_date;
  }
  if (body.lastPaidDate !== undefined || body.last_paid_date !== undefined) {
    out.last_paid_date = body.lastPaidDate ?? body.last_paid_date ?? null;
  }
  if (body.currentMonthPaid !== undefined || body.current_month_paid !== undefined) {
    out.current_month_paid = Boolean(body.currentMonthPaid ?? body.current_month_paid);
  }
  return out;
}

export function patchBodyFromClient(body) {
  const out = {};
  if (body.name != null) out.name = body.name;
  if (body.whatsapp != null) out.whatsapp = body.whatsapp;
  if (body.rentAmount != null || body.rent_amount != null) {
    out.rent_amount = Number(body.rentAmount ?? body.rent_amount);
  }
  if (body.rentSchedule != null || body.rent_schedule != null) {
    out.rent_schedule = body.rentSchedule ?? body.rent_schedule;
  }
  if (body.contractEndDate != null || body.contract_end_date != null) {
    out.contract_end_date = body.contractEndDate ?? body.contract_end_date;
  }
  if (body.lastPaidDate !== undefined || body.last_paid_date !== undefined) {
    out.last_paid_date = body.lastPaidDate ?? body.last_paid_date ?? null;
  }
  if (body.currentMonthPaid !== undefined || body.current_month_paid !== undefined) {
    out.current_month_paid = Boolean(body.currentMonthPaid ?? body.current_month_paid);
  }
  return out;
}
