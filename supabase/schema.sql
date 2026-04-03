-- Run in Supabase SQL editor. Adjust RLS policies for your auth model.

create extension if not exists "uuid-ossp";

create table if not exists public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  whatsapp text not null,
  rent_amount numeric not null check (rent_amount >= 0),
  rent_schedule text not null check (rent_schedule in ('monthly', 'quarterly', 'yearly')),
  contract_end_date date not null,
  last_paid_date date,
  current_month_paid boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  amount numeric not null,
  paid_at date not null default (current_date),
  period_label text,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_tenant on public.payments (tenant_id);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tenants enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

-- Example: allow anon read/write for prototyping only — replace with authenticated policies.
create policy "dev_all_tenants" on public.tenants for all using (true) with check (true);
create policy "dev_all_payments" on public.payments for all using (true) with check (true);
create policy "dev_all_notifications" on public.notifications for all using (true) with check (true);
