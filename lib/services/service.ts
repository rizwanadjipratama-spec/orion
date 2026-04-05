import { createService, listServices, updateService } from "@/lib/services/repository"
import type { ServiceFilters, ServiceMutationInput } from "@/lib/services/types"
import { validateServiceInput } from "@/lib/services/validation"

export async function getServices(filters: ServiceFilters = {}) {
  return listServices(filters)
}

export async function saveServiceRecord(input: ServiceMutationInput, serviceId?: string | null) {
  const payload = validateServiceInput(input)
  return serviceId ? updateService(serviceId, payload) : createService(payload)
}

export async function updateServiceActivation(serviceId: string, isActive: boolean) {
  return updateService(serviceId, { is_active: isActive })
}

export async function updateServicePrice(serviceId: string, price: number) {
  return updateService(serviceId, { price })
}
