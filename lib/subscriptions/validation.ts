import type { SubscriptionMutationInput } from "@/lib/subscriptions/types"
import { asPositiveAmount, asTrimmedRequired } from "@/lib/utils"

export function validateSubscriptionInput(input: SubscriptionMutationInput) {
  return {
    service_id: asTrimmedRequired(input.service_id, "Service"),
    status: input.status,
    price: asPositiveAmount(input.price, "Subscription price"),
    billing_interval: input.billing_interval,
    current_period_start: input.current_period_start || null,
    current_period_end: input.current_period_end || null,
    next_billing_date: asTrimmedRequired(input.next_billing_date, "Next billing date"),
    grace_period_days: Number.isFinite(input.grace_period_days) ? Math.max(0, Math.trunc(input.grace_period_days as number)) : 7,
  }
}
