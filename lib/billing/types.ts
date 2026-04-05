export interface BillingOverview {
  monthlyRevenue: number
  activeSubscriptions: number
  overdueInvoices: number
  suspendedServices: number
  totalClients: number
  totalProjects: number
  recentPayments: Array<{
    id: string
    amount: number
    paid_at: string | null
    payment_reference: string | null
    invoice: { invoice_number: string | null } | null
  }>
  recentInvoices: Array<{
    id: string
    invoice_number: string
    amount: number
    status: string
    due_date: string
  }>
}

export interface BillingRunResult {
  invoicesGenerated: number
  invoicesOverdue: number
  subscriptionsSuspended: number
}

export type BillingNotificationType = "issued" | "reminder"

export interface BillingReminderCandidate {
  invoiceId: string
  invoiceNumber: string
  amount: number
  status: string
  issueDate: string
  dueDate: string
  clientName: string
  email: string
  notificationType: BillingNotificationType
}

export interface BillingReminderDispatchResult {
  notificationsSent: number
  skipped: number
}
