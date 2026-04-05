import { supabase } from "@/lib/supabase"
import { listPayments } from "@/lib/payments/repository"
import type { PaymentFilters, PaymentMutationInput } from "@/lib/payments/types"
import { validatePaymentInput } from "@/lib/payments/validation"

export async function getPayments(filters: PaymentFilters = {}) {
  return listPayments(filters)
}

export async function recordPayment(input: PaymentMutationInput) {
  const payload = validatePaymentInput(input)
  const { data, error } = await supabase.rpc("record_payment_and_sync", {
    p_invoice_id: payload.invoice_id,
    p_amount: payload.amount,
    p_payment_method: payload.payment_method,
    p_payment_gateway: payload.payment_gateway,
    p_payment_reference: payload.payment_reference,
    p_paid_at: payload.paid_at,
  })

  if (error) {
    throw error
  }

  return data
}
