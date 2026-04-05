import { supabase } from "@/lib/supabase"
import type { ClientFilters, ClientMutationInput, ClientRecord } from "@/lib/clients/types"
import { normalizePagination, toPaginatedResult } from "@/lib/utils"

const BASE_SELECT = "id, name, email, company_name, phone, category, description, link, status, notes, sort_order, is_featured, created_at, updated_at"

export async function listClients(filters: ClientFilters = {}) {
  const { page, pageSize, from, to } = normalizePagination(filters)
  let query = supabase.from("clients").select(BASE_SELECT, { count: "exact" }).order("created_at", { ascending: false }).range(from, to)

  if (!filters.includeArchived) {
    query = query.neq("status", "archived")
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim()
    query = query.or(`name.ilike.%${term}%,company_name.ilike.%${term}%,email.ilike.%${term}%,category.ilike.%${term}%`)
  }

  const { data, error, count } = await query

  if (error) {
    throw error
  }

  return toPaginatedResult((data ?? []) as ClientRecord[], count ?? 0, page, pageSize)
}

export async function createClient(input: ClientMutationInput) {
  const { data, error } = await supabase.from("clients").insert(input).select(BASE_SELECT).single()

  if (error) {
    throw error
  }

  return data as ClientRecord
}

export async function updateClient(id: string, input: Partial<ClientMutationInput>) {
  const { data, error } = await supabase.from("clients").update(input).eq("id", id).select(BASE_SELECT).single()

  if (error) {
    throw error
  }

  return data as ClientRecord
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from("clients").delete().eq("id", id)

  if (error) {
    throw error
  }
}
