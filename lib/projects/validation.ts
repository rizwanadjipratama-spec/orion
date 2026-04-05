import type { ProjectMutationInput } from "@/lib/projects/types"
import { asTrimmedNullable, asTrimmedRequired } from "@/lib/utils"

export function validateProjectInput(input: ProjectMutationInput) {
  return {
    client_id: asTrimmedRequired(input.client_id, "Client"),
    name: asTrimmedRequired(input.name, "Project name"),
    type: input.type,
    domain: asTrimmedNullable(input.domain),
    status: input.status,
  }
}
