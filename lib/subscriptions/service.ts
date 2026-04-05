import { createSubscription, listSubscriptions, updateSubscription } from "@/lib/subscriptions/repository"
import type { SubscriptionFilters, SubscriptionMutationInput, SubscriptionStatus } from "@/lib/subscriptions/types"
import { validateSubscriptionInput } from "@/lib/subscriptions/validation"

export async function getSubscriptions(filters: SubscriptionFilters = {}) {
  return listSubscriptions(filters)
}

export async function saveSubscriptionRecord(input: SubscriptionMutationInput, subscriptionId?: string | null) {
  const payload = validateSubscriptionInput(input)
  return subscriptionId ? updateSubscription(subscriptionId, payload) : createSubscription(payload)
}

export async function updateSubscriptionStatus(subscriptionId: string, status: SubscriptionStatus) {
  return updateSubscription(subscriptionId, { status })
}

export async function updateSubscriptionBillingDate(subscriptionId: string, nextBillingDate: string) {
  return updateSubscription(subscriptionId, { next_billing_date: nextBillingDate })
}
