import { supabase } from "@/lib/supabase"
import type { SubscriptionFilters, SubscriptionMutationInput, SubscriptionRecord } from "@/lib/subscriptions/types"
import { normalizePagination, toPaginatedResult } from "@/lib/utils"

const BASE_SELECT = "id, service_id, status, price, billing_interval, current_period_start, current_period_end, next_billing_date, grace_period_days, suspended_at, cancelled_at, created_at, updated_at, service:services(id, name, project_id, project:projects(id, name, client:clients(id, name)))"

export async function listSubscriptions(filters: SubscriptionFilters = {}) {
  const { page, pageSize, from, to } = normalizePagination(filters)
  let query = supabase.from("subscriptions").select(BASE_SELECT, { count: "exact" }).order("created_at", { ascending: false }).range(from, to)

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  const { data, error, count } = await query
  if (error) throw error
  return toPaginatedResult((data ?? []) as unknown as SubscriptionRecord[], count ?? 0, page, pageSize)
}

export async function createSubscription(input: SubscriptionMutationInput) {
  const { data, error } = await supabase.from("subscriptions").insert(input).select(BASE_SELECT).single()
  if (error) throw error
  return data as unknown as SubscriptionRecord
}

export async function updateSubscription(id: string, input: Partial<SubscriptionMutationInput> & { status?: SubscriptionRecord["status"] }) {
  const { data, error } = await supabase.from("subscriptions").update(input).eq("id", id).select(BASE_SELECT).single()
  if (error) throw error
  return data as unknown as SubscriptionRecord
}


