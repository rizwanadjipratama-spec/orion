import { supabase } from "@/lib/supabase"
import { listInvoices, markInvoiceStatus } from "@/lib/invoices/repository"
import type { InvoiceFilters, InvoiceMutationInput } from "@/lib/invoices/types"
import { validateInvoiceInput } from "@/lib/invoices/validation"

export async function getInvoices(filters: InvoiceFilters = {}) {
  return listInvoices(filters)
}

export async function generateInvoiceManually(input: InvoiceMutationInput) {
  const payload = validateInvoiceInput(input)
  const { data, error } = await supabase.rpc("create_manual_invoice", {
    p_subscription_id: payload.subscription_id,
    p_amount: payload.amount,
    p_issue_date: payload.issue_date,
    p_due_date: payload.due_date,
  })

  if (error) {
    throw error
  }

  return data
}

export async function markInvoicePaid(invoiceId: string) {
  return markInvoiceStatus(invoiceId, "paid")
}

export async function voidInvoice(invoiceId: string) {
  return markInvoiceStatus(invoiceId, "void")
}
