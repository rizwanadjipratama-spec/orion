import { supabase } from "@/lib/supabase"
import type { BillingOverview } from "@/lib/billing/types"

function normalizeRecentPayments(data: Array<Record<string, unknown>>) {
  return data.map((payment) => {
    const invoiceValue = Array.isArray(payment.invoice)
      ? payment.invoice[0]
      : payment.invoice

    const invoiceRecord = invoiceValue && typeof invoiceValue === "object"
      ? (invoiceValue as { invoice_number?: unknown })
      : null

    return {
      id: String(payment.id ?? ""),
      amount: Number(payment.amount ?? 0),
      paid_at: typeof payment.paid_at === "string" ? payment.paid_at : null,
      payment_reference: typeof payment.payment_reference === "string" ? payment.payment_reference : null,
      invoice: invoiceRecord ? { invoice_number: typeof invoiceRecord.invoice_number === "string" ? invoiceRecord.invoice_number : null } : null,
    }
  }) as BillingOverview["recentPayments"]
}

function normalizeRecentInvoices(data: Array<Record<string, unknown>>) {
  return data.map((invoice) => ({
    id: String(invoice.id ?? ""),
    invoice_number: String(invoice.invoice_number ?? ""),
    amount: Number(invoice.amount ?? 0),
    status: String(invoice.status ?? "draft"),
    due_date: String(invoice.due_date ?? ""),
  })) as BillingOverview["recentInvoices"]
}

export async function fetchBillingOverview(): Promise<BillingOverview> {
  const [
    clientsResult,
    projectsResult,
    subscriptionsResult,
    overdueInvoicesResult,
    suspendedServicesResult,
    recentPaymentsResult,
    recentInvoicesResult,
    monthlyRevenueResult,
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "overdue"),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("is_active", false),
    supabase.from("payments").select("id, amount, paid_at, payment_reference, invoice:invoices(invoice_number)").order("created_at", { ascending: false }).limit(5),
    supabase.from("invoices").select("id, invoice_number, amount, status, due_date").order("created_at", { ascending: false }).limit(5),
    supabase.from("payments").select("amount, paid_at").gte("paid_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()).eq("status", "paid"),
  ])

  const errors = [
    clientsResult.error,
    projectsResult.error,
    subscriptionsResult.error,
    overdueInvoicesResult.error,
    suspendedServicesResult.error,
    recentPaymentsResult.error,
    recentInvoicesResult.error,
    monthlyRevenueResult.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    throw errors[0]
  }

  const monthlyRevenue = (monthlyRevenueResult.data ?? []).reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0)

  return {
    monthlyRevenue,
    activeSubscriptions: subscriptionsResult.count ?? 0,
    overdueInvoices: overdueInvoicesResult.count ?? 0,
    suspendedServices: suspendedServicesResult.count ?? 0,
    totalClients: clientsResult.count ?? 0,
    totalProjects: projectsResult.count ?? 0,
    recentPayments: normalizeRecentPayments((recentPaymentsResult.data ?? []) as Array<Record<string, unknown>>),
    recentInvoices: normalizeRecentInvoices((recentInvoicesResult.data ?? []) as Array<Record<string, unknown>>),
  }
}
