begin;

alter table if exists public.clients
  add column if not exists stripe_customer_id text;

alter table if exists public.subscriptions
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_price_id text;

alter table if exists public.invoices
  add column if not exists stripe_invoice_id text,
  add column if not exists stripe_checkout_session_id text;

alter table if exists public.payments
  add column if not exists stripe_payment_intent_id text,
  add column if not exists stripe_charge_id text,
  add column if not exists stripe_event_id text;

create unique index if not exists clients_stripe_customer_id_unique_idx
  on public.clients (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists subscriptions_stripe_subscription_id_unique_idx
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

create unique index if not exists invoices_stripe_invoice_id_unique_idx
  on public.invoices (stripe_invoice_id)
  where stripe_invoice_id is not null;

create index if not exists invoices_stripe_checkout_session_id_idx
  on public.invoices (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create unique index if not exists payments_stripe_payment_intent_id_unique_idx
  on public.payments (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create unique index if not exists payments_stripe_charge_id_unique_idx
  on public.payments (stripe_charge_id)
  where stripe_charge_id is not null;

create unique index if not exists payments_stripe_event_id_unique_idx
  on public.payments (stripe_event_id)
  where stripe_event_id is not null;

commit;
