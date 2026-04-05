import {
  getClients,
  removeClientRecord,
  saveClientRecord,
  subscribeClientsRealtime as subscribeClientsRealtimeChannel,
  summarizeClients,
  updateClientRecordStatus,
} from "@/lib/clients/service"
import type { ClientFilters, ClientMutationInput, ClientRecord, ClientStatus, ClientSummary } from "@/lib/clients/types"

export type Client = ClientRecord
export type { ClientStatus, ClientSummary }

interface FetchClientsOptions {
  includeArchived: boolean
}

export async function fetchClients({ includeArchived }: FetchClientsOptions): Promise<Client[]> {
  const result = await getClients({ includeArchived, page: 1, pageSize: 100 })
  return result.data
}

export async function fetchClientsPage(filters: ClientFilters) {
  return getClients(filters)
}

export async function saveClient(payload: Omit<ClientMutationInput, "sort_order" | "is_featured">, editingId?: string | null) {
  return saveClientRecord(
    {
      ...payload,
      sort_order: 0,
      is_featured: false,
    },
    editingId
  )
}

export async function removeClient(id: string) {
  return removeClientRecord(id)
}

export async function updateClientStatus(id: string, status: ClientStatus) {
  return updateClientRecordStatus(id, status)
}

export { summarizeClients }

export function subscribeClientsRealtime(channelName: string, onChange: () => void) {
  return subscribeClientsRealtimeChannel(channelName, onChange)
}
