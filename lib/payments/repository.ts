import { supabase } from "@/lib/supabase"
import type { PaymentFilters, PaymentRecord } from "@/lib/payments/types"
import { normalizePagination, toPaginatedResult } from "@/lib/utils"

const BASE_SELECT = "id, invoice_id, amount, payment_method, payment_gateway, payment_reference, status, paid_at, created_at, invoice:invoices(id, invoice_number, amount, status)"

export async function listPayments(filters: PaymentFilters = {}) {
  const { page, pageSize, from, to } = normalizePagination(filters)
  let query = supabase.from("payments").select(BASE_SELECT, { count: "exact" }).order("created_at", { ascending: false }).range(from, to)

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  const { data, error, count } = await query
  if (error) throw error
  return toPaginatedResult((data ?? []) as unknown as PaymentRecord[], count ?? 0, page, pageSize)
}


