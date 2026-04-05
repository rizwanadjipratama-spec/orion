export type ProjectType = "website" | "erp" | "system"
export type ProjectStatus = "active" | "suspended" | "archived"

export interface ProjectRecord {
  id: string
  client_id: string
  name: string
  type: ProjectType
  domain: string | null
  status: ProjectStatus
  access_blocked: boolean
  created_at: string
  updated_at: string
  client?: {
    id: string
    name: string
    company_name: string | null
  } | null
}

export interface ProjectFilters {
  clientId?: string
  status?: ProjectStatus
  search?: string
  page?: number
  pageSize?: number
}

export interface ProjectMutationInput {
  client_id: string
  name: string
  type: ProjectType
  domain?: string | null
  status: ProjectStatus
}
