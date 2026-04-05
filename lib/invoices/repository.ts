import { supabase } from "@/lib/supabase"
import type { InvoiceFilters, InvoiceRecord } from "@/lib/invoices/types"
import { normalizePagination, toPaginatedResult } from "@/lib/utils"

const BASE_SELECT = "id, subscription_id, invoice_number, amount, status, issue_date, due_date, paid_at, created_at, subscription:subscriptions(id, status, service:services(id, name, project:projects(id, name, client:clients(id, name))))"

export async function listInvoices(filters: InvoiceFilters = {}) {
  const { page, pageSize, from, to } = normalizePagination(filters)
  let query = supabase.from("invoices").select(BASE_SELECT, { count: "exact" }).order("created_at", { ascending: false }).range(from, to)

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  const { data, error, count } = await query
  if (error) throw error
  return toPaginatedResult((data ?? []) as unknown as InvoiceRecord[], count ?? 0, page, pageSize)
}

export async function markInvoiceStatus(invoiceId: string, status: InvoiceRecord["status"]) {
  const payload = status === "paid" ? { status, paid_at: new Date().toISOString() } : { status }
  const { data, error } = await supabase.from("invoices").update(payload).eq("id", invoiceId).select(BASE_SELECT).single()
  if (error) throw error
  return data as unknown as InvoiceRecord
}


