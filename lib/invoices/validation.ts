import type { InvoiceMutationInput } from "@/lib/invoices/types"
import { asPositiveAmount, asTrimmedRequired } from "@/lib/utils"

export function validateInvoiceInput(input: InvoiceMutationInput) {
  return {
    subscription_id: asTrimmedRequired(input.subscription_id, "Subscription"),
    amount: asPositiveAmount(input.amount, "Invoice amount"),
    issue_date: asTrimmedRequired(input.issue_date, "Issue date"),
    due_date: asTrimmedRequired(input.due_date, "Due date"),
    status: input.status ?? "issued",
  }
}
