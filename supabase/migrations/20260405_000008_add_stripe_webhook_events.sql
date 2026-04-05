begin;

create table if not exists public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  livemode boolean not null default false,
  api_version text,
  processing_status text not null default 'processing' check (processing_status in ('processing', 'processed', 'failed')),
  payload jsonb not null,
  error_message text,
  received_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists stripe_webhook_events_status_received_idx
  on public.stripe_webhook_events (processing_status, received_at desc);

create index if not exists stripe_webhook_events_type_received_idx
  on public.stripe_webhook_events (event_type, received_at desc);

alter table public.stripe_webhook_events enable row level security;

drop policy if exists "stripe_webhook_events_admin_manage" on public.stripe_webhook_events;
create policy "stripe_webhook_events_admin_manage"
on public.stripe_webhook_events
for all
to authenticated
using (public.is_saintce_admin())
with check (public.is_saintce_admin());

drop trigger if exists stripe_webhook_events_audit_trigger on public.stripe_webhook_events;
create trigger stripe_webhook_events_audit_trigger
after insert or update or delete on public.stripe_webhook_events
for each row execute function public.write_audit_log();

commit;
