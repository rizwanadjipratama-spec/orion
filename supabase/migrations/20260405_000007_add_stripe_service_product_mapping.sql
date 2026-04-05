begin;

alter table if exists public.services
  add column if not exists stripe_product_id text;

create unique index if not exists services_stripe_product_id_unique_idx
  on public.services (stripe_product_id)
  where stripe_product_id is not null;

commit;
