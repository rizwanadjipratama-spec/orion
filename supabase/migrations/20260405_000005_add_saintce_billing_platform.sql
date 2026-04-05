begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

alter table if exists public.clients
  add column if not exists email citext,
  add column if not exists company_name text,
  add column if not exists phone text,
  add column if not exists notes text;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_type' and typnamespace = 'public'::regnamespace) then
    create type public.project_type as enum ('website', 'erp', 'system');
  end if;

  if not exists (select 1 from pg_type where typname = 'project_status' and typnamespace = 'public'::regnamespace) then
    create type public.project_status as enum ('active', 'suspended', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'billing_interval' and typnamespace = 'public'::regnamespace) then
    create type public.billing_interval as enum ('monthly', 'yearly', 'one_time');
  end if;

  if not exists (select 1 from pg_type where typname = 'subscription_status' and typnamespace = 'public'::regnamespace) then
    create type public.subscription_status as enum ('active', 'past_due', 'suspended', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'invoice_status' and typnamespace = 'public'::regnamespace) then
    create type public.invoice_status as enum ('draft', 'issued', 'paid', 'overdue', 'void');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status' and typnamespace = 'public'::regnamespace) then
    create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
  end if;
end
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  type public.project_type not null,
  domain text,
  status public.project_status not null default 'active',
  access_blocked boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  description text,
  price numeric(12, 2) not null default 0,
  billing_interval public.billing_interval not null,
  is_recurring boolean not null default true,
  is_active boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null unique references public.services (id) on delete cascade,
  status public.subscription_status not null default 'active',
  price numeric(12, 2) not null,
  billing_interval public.billing_interval not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_billing_date timestamptz not null,
  grace_period_days integer not null default 7,
  suspended_at timestamptz,
  cancelled_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions (id) on delete cascade,
  invoice_number text not null unique,
  amount numeric(12, 2) not null,
  status public.invoice_status not null default 'issued',
  issue_date date not null,
  due_date date not null,
  paid_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  amount numeric(12, 2) not null,
  payment_method text,
  payment_gateway text,
  payment_reference text,
  status public.payment_status not null default 'paid',
  paid_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists clients_email_idx on public.clients (email);
create index if not exists clients_company_name_idx on public.clients (company_name);
create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_access_blocked_idx on public.projects (access_blocked);
create index if not exists services_project_id_idx on public.services (project_id);
create index if not exists services_active_idx on public.services (is_active);
create index if not exists subscriptions_service_id_idx on public.subscriptions (service_id);
create index if not exists subscriptions_status_next_billing_idx on public.subscriptions (status, next_billing_date);
create index if not exists invoices_subscription_id_idx on public.invoices (subscription_id);
create index if not exists invoices_status_due_date_idx on public.invoices (status, due_date);
create index if not exists invoices_issue_date_idx on public.invoices (issue_date);
create index if not exists payments_invoice_id_idx on public.payments (invoice_id);
create index if not exists payments_status_paid_at_idx on public.payments (status, paid_at desc);
create unique index if not exists payments_reference_unique_idx on public.payments (payment_reference) where payment_reference is not null;

create or replace function public.get_next_invoice_number(p_issue_date date)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year text := to_char(p_issue_date, 'YYYY');
  v_sequence integer;
begin
  perform pg_advisory_xact_lock(hashtext('saintce_invoice_number_' || v_year));

  select coalesce(count(*), 0) + 1
  into v_sequence
  from public.invoices
  where to_char(issue_date, 'YYYY') = v_year;

  return format('INV-%s-%s', v_year, lpad(v_sequence::text, 4, '0'));
end;
$$;

create or replace function public.sync_project_and_service_access(p_subscription_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service_id uuid;
  v_project_id uuid;
  v_has_active boolean;
  v_subscription_status public.subscription_status;
begin
  select sub.service_id, svc.project_id, sub.status
  into v_service_id, v_project_id, v_subscription_status
  from public.subscriptions sub
  join public.services svc on svc.id = sub.service_id
  where sub.id = p_subscription_id;

  if v_service_id is null or v_project_id is null then
    return;
  end if;

  update public.services
  set is_active = case when v_subscription_status = 'active' then true else false end,
      updated_at = timezone('utc', now())
  where id = v_service_id;

  select exists (
    select 1
    from public.services svc
    join public.subscriptions sub on sub.service_id = svc.id
    where svc.project_id = v_project_id
      and sub.status = 'active'
  ) into v_has_active;

  update public.projects
  set access_blocked = not v_has_active,
      status = case
        when status = 'archived' then status
        when v_has_active then 'active'::public.project_status
        else 'suspended'::public.project_status
      end,
      updated_at = timezone('utc', now())
  where id = v_project_id;
end;
$$;

create or replace function public.can_access_project(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    join public.services svc on svc.project_id = p.id
    join public.subscriptions sub on sub.service_id = svc.id
    where p.id = p_project_id
      and p.status = 'active'
      and p.access_blocked = false
      and svc.is_active = true
      and sub.status = 'active'
  );
$$;

create or replace function public.create_manual_invoice(
  p_subscription_id uuid,
  p_amount numeric,
  p_issue_date date,
  p_due_date date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice_id uuid;
  v_invoice_number text;
begin
  if p_due_date < p_issue_date then
    raise exception 'Due date cannot be before issue date.';
  end if;

  v_invoice_number := public.get_next_invoice_number(p_issue_date);

  insert into public.invoices (
    subscription_id,
    invoice_number,
    amount,
    status,
    issue_date,
    due_date,
    created_by
  ) values (
    p_subscription_id,
    v_invoice_number,
    p_amount,
    'issued',
    p_issue_date,
    p_due_date,
    auth.uid()
  )
  returning id into v_invoice_id;

  return v_invoice_id;
end;
$$;

create or replace function public.record_payment_and_sync(
  p_invoice_id uuid,
  p_amount numeric,
  p_payment_method text,
  p_payment_gateway text,
  p_payment_reference text,
  p_paid_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id uuid;
  v_subscription_id uuid;
begin
  select subscription_id
  into v_subscription_id
  from public.invoices
  where id = p_invoice_id
  for update;

  if v_subscription_id is null then
    raise exception 'Invoice not found.';
  end if;

  insert into public.payments (
    invoice_id,
    amount,
    payment_method,
    payment_gateway,
    payment_reference,
    status,
    paid_at,
    created_by
  ) values (
    p_invoice_id,
    p_amount,
    p_payment_method,
    p_payment_gateway,
    p_payment_reference,
    'paid',
    coalesce(p_paid_at, timezone('utc', now())),
    auth.uid()
  )
  returning id into v_payment_id;

  update public.invoices
  set status = 'paid',
      paid_at = coalesce(p_paid_at, timezone('utc', now()))
  where id = p_invoice_id;

  update public.subscriptions
  set status = 'active',
      suspended_at = null,
      cancelled_at = null,
      updated_at = timezone('utc', now())
  where id = v_subscription_id;

  perform public.sync_project_and_service_access(v_subscription_id);

  return v_payment_id;
end;
$$;

create or replace function public.run_billing_automation(p_run_at timestamptz default timezone('utc', now()))
returns table (
  invoices_generated integer,
  invoices_overdue integer,
  subscriptions_suspended integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subscription record;
  v_generated integer := 0;
  v_overdue integer := 0;
  v_suspended integer := 0;
  v_next_period_end timestamptz;
  v_existing_invoice uuid;
begin
  for v_subscription in
    select id, price, billing_interval, next_billing_date, current_period_end
    from public.subscriptions
    where status in ('active', 'past_due')
      and next_billing_date <= p_run_at
    order by next_billing_date asc
  loop
    select id
    into v_existing_invoice
    from public.invoices
    where subscription_id = v_subscription.id
      and issue_date = (p_run_at at time zone 'utc')::date
      and status <> 'void'
    limit 1;

    if v_existing_invoice is null then
      perform public.create_manual_invoice(
        v_subscription.id,
        v_subscription.price,
        (p_run_at at time zone 'utc')::date,
        ((p_run_at + interval '7 days') at time zone 'utc')::date
      );
      v_generated := v_generated + 1;
    end if;

    v_next_period_end := case
      when v_subscription.billing_interval = 'monthly' then coalesce(v_subscription.current_period_end, v_subscription.next_billing_date) + interval '1 month'
      when v_subscription.billing_interval = 'yearly' then coalesce(v_subscription.current_period_end, v_subscription.next_billing_date) + interval '1 year'
      else coalesce(v_subscription.current_period_end, v_subscription.next_billing_date)
    end;

    update public.subscriptions
    set current_period_start = coalesce(current_period_end, next_billing_date),
        current_period_end = v_next_period_end,
        next_billing_date = v_next_period_end,
        updated_at = timezone('utc', now())
    where id = v_subscription.id;
  end loop;

  update public.invoices
  set status = 'overdue'
  where status in ('draft', 'issued')
    and due_date < (p_run_at at time zone 'utc')::date;
  get diagnostics v_overdue = row_count;

  update public.subscriptions sub
  set status = 'past_due',
      updated_at = timezone('utc', now())
  where sub.status = 'active'
    and exists (
      select 1
      from public.invoices inv
      where inv.subscription_id = sub.id
        and inv.status = 'overdue'
    );

  update public.subscriptions sub
  set status = 'suspended',
      suspended_at = coalesce(sub.suspended_at, timezone('utc', now())),
      updated_at = timezone('utc', now())
  where sub.status in ('active', 'past_due')
    and exists (
      select 1
      from public.invoices inv
      where inv.subscription_id = sub.id
        and inv.status = 'overdue'
        and inv.due_date + sub.grace_period_days < (p_run_at at time zone 'utc')::date
    );
  get diagnostics v_suspended = row_count;

  for v_subscription in
    select id
    from public.subscriptions
    where status = 'suspended'
  loop
    perform public.sync_project_and_service_access(v_subscription.id);
  end loop;

  return query select v_generated, v_overdue, v_suspended;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_current_timestamp_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_current_timestamp_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_current_timestamp_updated_at();

drop trigger if exists projects_audit_trigger on public.projects;
create trigger projects_audit_trigger
after insert or update or delete on public.projects
for each row execute function public.write_audit_log();

drop trigger if exists services_audit_trigger on public.services;
create trigger services_audit_trigger
after insert or update or delete on public.services
for each row execute function public.write_audit_log();

drop trigger if exists subscriptions_audit_trigger on public.subscriptions;
create trigger subscriptions_audit_trigger
after insert or update or delete on public.subscriptions
for each row execute function public.write_audit_log();

drop trigger if exists invoices_audit_trigger on public.invoices;
create trigger invoices_audit_trigger
after insert or update or delete on public.invoices
for each row execute function public.write_audit_log();

drop trigger if exists payments_audit_trigger on public.payments;
create trigger payments_audit_trigger
after insert or update or delete on public.payments
for each row execute function public.write_audit_log();

alter table public.projects enable row level security;
alter table public.services enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

drop policy if exists "projects_admin_manage" on public.projects;
create policy "projects_admin_manage"
on public.projects
for all
to authenticated
using (public.is_saintce_admin())
with check (public.is_saintce_admin());

drop policy if exists "services_admin_manage" on public.services;
create policy "services_admin_manage"
on public.services
for all
to authenticated
using (public.is_saintce_admin())
with check (public.is_saintce_admin());

drop policy if exists "subscriptions_admin_manage" on public.subscriptions;
create policy "subscriptions_admin_manage"
on public.subscriptions
for all
to authenticated
using (public.is_saintce_admin())
with check (public.is_saintce_admin());

drop policy if exists "invoices_admin_manage" on public.invoices;
create policy "invoices_admin_manage"
on public.invoices
for all
to authenticated
using (public.is_saintce_admin())
with check (public.is_saintce_admin());

drop policy if exists "payments_admin_manage" on public.payments;
create policy "payments_admin_manage"
on public.payments
for all
to authenticated
using (public.is_saintce_admin())
with check (public.is_saintce_admin());

commit;
