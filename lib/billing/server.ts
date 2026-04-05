import "server-only"

import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { sendInvoiceReminder, sendIssuedInvoiceNotification } from "@/lib/notifications/service"
import { formatCurrency } from "@/lib/utils"
import type {
  BillingReminderCandidate,
  BillingReminderDispatchResult,
  BillingRunResult,
} from "@/lib/billing/types"

interface RpcCapableClient {
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>
}

function normalizeNotificationCandidate(row: Record<string, unknown>, today: string): BillingReminderCandidate | null {
  const subscriptionValue = Array.isArray(row.subscription_id) ? row.subscription_id[0] : row.subscription_id
  const subscriptionRecord = subscriptionValue && typeof subscriptionValue === "object" ? subscriptionValue as Record<string, unknown> : null
  const serviceValue = subscriptionRecord?.service_id
  const serviceRecord = Array.isArray(serviceValue) ? serviceValue[0] : serviceValue
  const projectValue = serviceRecord && typeof serviceRecord === "object" ? (serviceRecord as Record<string, unknown>).project_id : null
  const projectRecord = Array.isArray(projectValue) ? projectValue[0] : projectValue
  const clientValue = projectRecord && typeof projectRecord === "object" ? (projectRecord as Record<string, unknown>).client_id : null
  const clientRecord = Array.isArray(clientValue) ? clientValue[0] : clientValue

  if (!clientRecord || typeof clientRecord !== "object") {
    return null
  }

  const clientData = clientRecord as Record<string, unknown>
  const email = typeof clientData.email === "string" ? clientData.email : ""
  if (!email.trim()) {
    return null
  }

  const issueDate = String(row.issue_date ?? "")
  const dueDate = String(row.due_date ?? "")

  return {
    invoiceId: String(row.id ?? ""),
    invoiceNumber: String(row.invoice_number ?? ""),
    amount: Number(row.amount ?? 0),
    status: String(row.status ?? "issued"),
    issueDate,
    dueDate,
    clientName: typeof clientData.name === "string" ? clientData.name : "Client",
    email,
    notificationType: issueDate === today ? "issued" : "reminder",
  }
}

export async function executeBillingAutomation(runAt?: string): Promise<BillingRunResult> {
  const admin = getSupabaseAdmin() as unknown as RpcCapableClient
  const { data, error } = await admin.rpc("run_billing_automation", {
    p_run_at: runAt ?? new Date().toISOString(),
  })

  if (error) {
    throw error
  }

  const result = Array.isArray(data) ? data[0] : data
  const resultRecord = result && typeof result === "object" ? result as Record<string, unknown> : {}

  return {
    invoicesGenerated: Number(resultRecord.invoices_generated ?? 0),
    invoicesOverdue: Number(resultRecord.invoices_overdue ?? 0),
    subscriptionsSuspended: Number(resultRecord.subscriptions_suspended ?? 0),
  }
}

async function fetchNotificationCandidates(runAt = new Date().toISOString()) {
  const admin = getSupabaseAdmin()
  const today = runAt.slice(0, 10)
  const inThreeDays = new Date(runAt)
  inThreeDays.setUTCDate(inThreeDays.getUTCDate() + 3)

  const { data, error } = await admin
    .from("invoices")
    .select("id, invoice_number, amount, status, issue_date, due_date, subscription_id(service_id(project_id(client_id(name, email))))")
    .in("status", ["issued", "overdue"])
    .or(`issue_date.eq.${today},and(due_date.gte.${today},due_date.lte.${inThreeDays.toISOString().slice(0, 10)})`)
    .order("due_date", { ascending: true })

  if (error) {
    throw error
  }

  const candidates = ((data ?? []) as Array<Record<string, unknown>>)
    .map((row) => normalizeNotificationCandidate(row, today))
    .filter((candidate): candidate is BillingReminderCandidate => Boolean(candidate))

  const uniqueCandidates = new Map<string, BillingReminderCandidate>()
  for (const candidate of candidates) {
    const existing = uniqueCandidates.get(candidate.invoiceId)
    if (!existing || existing.notificationType !== "issued") {
      uniqueCandidates.set(candidate.invoiceId, candidate)
    }
  }

  return Array.from(uniqueCandidates.values())
}

export async function sendBillingNotifications(runAt?: string): Promise<BillingReminderDispatchResult> {
  const candidates = await fetchNotificationCandidates(runAt)

  let notificationsSent = 0
  let skipped = 0

  for (const candidate of candidates) {
    try {
      if (candidate.notificationType === "issued") {
        await sendIssuedInvoiceNotification({
          to: candidate.email,
          clientName: candidate.clientName,
          invoiceNumber: candidate.invoiceNumber,
          amountLabel: formatCurrency(candidate.amount),
          dueDate: candidate.dueDate,
          statusLabel: candidate.status,
        })
      } else {
        await sendInvoiceReminder({
          to: candidate.email,
          clientName: candidate.clientName,
          invoiceNumber: candidate.invoiceNumber,
          amountLabel: formatCurrency(candidate.amount),
          dueDate: candidate.dueDate,
          statusLabel: candidate.status,
        })
      }
      notificationsSent += 1
    } catch {
      skipped += 1
    }
  }

  return {
    notificationsSent,
    skipped,
  }
}
