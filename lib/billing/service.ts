import { fetchBillingOverview } from "@/lib/billing/repository"

export async function getBillingOverview() {
  return fetchBillingOverview()
}
