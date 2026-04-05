import type { ClientMutationInput } from "@/lib/clients/types"
import { asTrimmedNullable, asTrimmedRequired } from "@/lib/utils"

export function validateClientInput(input: ClientMutationInput) {
  return {
    name: asTrimmedRequired(input.name, "Client name"),
    email: asTrimmedNullable(input.email),
    company_name: asTrimmedNullable(input.company_name),
    phone: asTrimmedNullable(input.phone),
    category: asTrimmedNullable(input.category),
    description: asTrimmedNullable(input.description),
    link: asTrimmedRequired(input.link, "Client link"),
    status: input.status,
    notes: asTrimmedNullable(input.notes),
    sort_order: Number.isFinite(input.sort_order) ? Math.trunc(input.sort_order as number) : 0,
    is_featured: Boolean(input.is_featured),
  }
}
