import { supabase } from "@/lib/supabase"
import type { ServiceFilters, ServiceMutationInput, ServiceRecord } from "@/lib/services/types"
import { normalizePagination, toPaginatedResult } from "@/lib/utils"

const BASE_SELECT = "id, project_id, name, description, price, billing_interval, is_recurring, is_active, created_at, project:projects(id, name, client_id, client:clients(id, name))"

export async function listServices(filters: ServiceFilters = {}) {
  const { page, pageSize, from, to } = normalizePagination(filters)
  let query = supabase.from("services").select(BASE_SELECT, { count: "exact" }).order("created_at", { ascending: false }).range(from, to)

  if (filters.projectId) {
    query = query.eq("project_id", filters.projectId)
  }

  if (typeof filters.isActive === "boolean") {
    query = query.eq("is_active", filters.isActive)
  }

  const { data, error, count } = await query
  if (error) throw error
  return toPaginatedResult((data ?? []) as unknown as ServiceRecord[], count ?? 0, page, pageSize)
}

export async function createService(input: ServiceMutationInput) {
  const { data, error } = await supabase.from("services").insert(input).select(BASE_SELECT).single()
  if (error) throw error
  return data as unknown as ServiceRecord
}

export async function updateService(id: string, input: Partial<ServiceMutationInput>) {
  const { data, error } = await supabase.from("services").update(input).eq("id", id).select(BASE_SELECT).single()
  if (error) throw error
  return data as unknown as ServiceRecord
}


