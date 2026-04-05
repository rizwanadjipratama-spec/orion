export type ClientStatus = "live" | "beta" | "private" | "archived"

export interface ClientRecord {
  id: string
  name: string
  email: string | null
  company_name: string | null
  phone: string | null
  category: string | null
  description: string | null
  link: string
  status: ClientStatus
  notes: string | null
  sort_order: number
  is_featured: boolean
  created_at: string
  updated_at?: string
}

export interface ClientSummary {
  total: number
  live: number
  beta: number
  private: number
  archived: number
}

export interface ClientFilters {
  includeArchived?: boolean
  search?: string
  page?: number
  pageSize?: number
}

export interface ClientMutationInput {
  name: string
  email?: string | null
  company_name?: string | null
  phone?: string | null
  category?: string | null
  description?: string | null
  link: string
  status: ClientStatus
  notes?: string | null
  sort_order?: number
  is_featured?: boolean
}
