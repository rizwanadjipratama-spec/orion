import { supabase } from "@/lib/supabase"
import type { ProjectFilters, ProjectMutationInput, ProjectRecord } from "@/lib/projects/types"
import { normalizePagination, toPaginatedResult } from "@/lib/utils"

const BASE_SELECT = "id, client_id, name, type, domain, status, access_blocked, created_at, updated_at, client:clients(id, name, company_name)"

export async function listProjects(filters: ProjectFilters = {}) {
  const { page, pageSize, from, to } = normalizePagination(filters)
  let query = supabase.from("projects").select(BASE_SELECT, { count: "exact" }).order("created_at", { ascending: false }).range(from, to)

  if (filters.clientId) {
    query = query.eq("client_id", filters.clientId)
  }

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  if (filters.search?.trim()) {
    const term = filters.search.trim()
    query = query.or(`name.ilike.%${term}%,domain.ilike.%${term}%`)
  }

  const { data, error, count } = await query
  if (error) throw error
  return toPaginatedResult((data ?? []) as unknown as ProjectRecord[], count ?? 0, page, pageSize)
}

export async function createProject(input: ProjectMutationInput) {
  const { data, error } = await supabase.from("projects").insert(input).select(BASE_SELECT).single()
  if (error) throw error
  return data as unknown as ProjectRecord
}

export async function updateProject(id: string, input: Partial<ProjectMutationInput> & { access_blocked?: boolean }) {
  const { data, error } = await supabase.from("projects").update(input).eq("id", id).select(BASE_SELECT).single()
  if (error) throw error
  return data as unknown as ProjectRecord
}

export async function canAccessProject(projectId: string) {
  const { data, error } = await supabase.rpc("can_access_project", { p_project_id: projectId })
  if (error) throw error
  return Boolean(data)
}


