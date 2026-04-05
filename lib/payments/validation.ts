import type { PaymentMutationInput } from "@/lib/payments/types"
import { asPositiveAmount, asTrimmedNullable, asTrimmedRequired } from "@/lib/utils"

export function validatePaymentInput(input: PaymentMutationInput) {
  return {
    invoice_id: asTrimmedRequired(input.invoice_id, "Invoice"),
    amount: asPositiveAmount(input.amount, "Payment amount"),
    payment_method: asTrimmedNullable(input.payment_method),
    payment_gateway: asTrimmedNullable(input.payment_gateway),
    payment_reference: asTrimmedNullable(input.payment_reference),
    status: input.status ?? "paid",
    paid_at: input.paid_at || new Date().toISOString(),
  }
}
