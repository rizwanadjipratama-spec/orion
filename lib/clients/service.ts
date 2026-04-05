import { supabase } from "@/lib/supabase"
import { createClient, deleteClient, listClients, updateClient } from "@/lib/clients/repository"
import type { ClientFilters, ClientMutationInput, ClientRecord, ClientSummary, ClientStatus } from "@/lib/clients/types"
import { validateClientInput } from "@/lib/clients/validation"

export async function getClients(filters: ClientFilters = {}) {
  return listClients(filters)
}

export async function saveClientRecord(input: ClientMutationInput, clientId?: string | null) {
  const payload = validateClientInput(input)
  return clientId ? updateClient(clientId, payload) : createClient(payload)
}

export async function updateClientRecord(clientId: string, input: Partial<ClientMutationInput>) {
  return updateClient(clientId, input)
}

export async function updateClientRecordStatus(clientId: string, status: ClientStatus) {
  return updateClient(clientId, { status })
}

export async function removeClientRecord(id: string) {
  return deleteClient(id)
}

export function summarizeClients(clients: ClientRecord[]): ClientSummary {
  return clients.reduce<ClientSummary>(
    (summary, client) => {
      summary.total += 1
      summary[client.status] += 1
      return summary
    },
    { total: 0, live: 0, beta: 0, private: 0, archived: 0 }
  )
}

export function subscribeClientsRealtime(channelName: string, onChange: () => void) {
  const channel = supabase
    .channel(channelName)
    .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, onChange)
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
