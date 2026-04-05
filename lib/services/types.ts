export type BillingInterval = "monthly" | "yearly" | "one_time"

export interface ServiceRecord {
  id: string
  project_id: string
  name: string
  description: string | null
  price: number
  billing_interval: BillingInterval
  is_recurring: boolean
  is_active: boolean
  created_at: string
  project?: {
    id: string
    name: string
    client_id: string
    client?: {
      id: string
      name: string
    } | null
  } | null
}

export interface ServiceFilters {
  projectId?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface ServiceMutationInput {
  project_id: string
  name: string
  description?: string | null
  price: number
  billing_interval: BillingInterval
  is_recurring: boolean
  is_active?: boolean
}
