export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export interface PaymentRecord {
  id: string
  invoice_id: string
  amount: number
  payment_method: string | null
  payment_gateway: string | null
  payment_reference: string | null
  status: PaymentStatus
  paid_at: string | null
  created_at: string
  invoice?: {
    id: string
    invoice_number: string
    amount: number
    status: string
  } | null
}

export interface PaymentFilters {
  status?: PaymentStatus
  page?: number
  pageSize?: number
}

export interface PaymentMutationInput {
  invoice_id: string
  amount: number
  payment_method?: string | null
  payment_gateway?: string | null
  payment_reference?: string | null
  status?: PaymentStatus
  paid_at?: string | null
}
