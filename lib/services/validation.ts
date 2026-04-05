import type { ServiceMutationInput } from "@/lib/services/types"
import { asPositiveAmount, asTrimmedNullable, asTrimmedRequired } from "@/lib/utils"

export function validateServiceInput(input: ServiceMutationInput) {
  return {
    project_id: asTrimmedRequired(input.project_id, "Project"),
    name: asTrimmedRequired(input.name, "Service name"),
    description: asTrimmedNullable(input.description),
    price: asPositiveAmount(input.price, "Service price"),
    billing_interval: input.billing_interval,
    is_recurring: Boolean(input.is_recurring),
    is_active: input.is_active ?? true,
  }
}
