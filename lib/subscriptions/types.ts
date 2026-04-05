import type { BillingInterval } from "@/lib/services/types"

export type SubscriptionStatus = "active" | "past_due" | "suspended" | "cancelled"

export interface SubscriptionRecord {
  id: string
  service_id: string
  status: SubscriptionStatus
  price: number
  billing_interval: BillingInterval
  current_period_start: string | null
  current_period_end: string | null
  next_billing_date: string
  grace_period_days: number
  suspended_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  service?: {
    id: string
    name: string
    project_id: string
    project?: {
      id: string
      name: string
      client?: {
        id: string
        name: string
      } | null
    } | null
  } | null
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus
  page?: number
  pageSize?: number
}

export interface SubscriptionMutationInput {
  service_id: string
  status: SubscriptionStatus
  price: number
  billing_interval: BillingInterval
  current_period_start?: string | null
  current_period_end?: string | null
  next_billing_date: string
  grace_period_days?: number
}
