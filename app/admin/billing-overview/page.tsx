"use client"

import { supabase } from "@/lib/supabase"
import { getBillingOverview } from "@/lib/billing/service"
import type { BillingOverview } from "@/lib/billing/types"
import { hasAdminAccess } from "@/lib/admin-auth"
import { getErrorMessage } from "@/lib/errors"
import { formatCurrency } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function BillingOverviewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [overview, setOverview] = useState<BillingOverview | null>(null)

  const loadOverview = useCallback(async () => {
    try {
      const data = await getBillingOverview()
      setOverview(data)
      setMessage(null)
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to load billing overview."))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    const init = async () => {
      const allowed = await hasAdminAccess()
      if (!allowed) {
        router.replace("/login")
        return
      }

      if (active) {
        await loadOverview()
      }
    }

    void init()

    return () => {
      active = false
    }
  }, [loadOverview, router])

  const handleRunAutomation = useCallback(async () => {
    setRunning(true)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) {
        throw new Error("Missing admin session token.")
      }

      const response = await fetch("/api/billing/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ runAt: new Date().toISOString() }),
      })

      const payload = (await response.json().catch(() => null)) as {
        error?: string
        automation?: { invoicesGenerated: number; invoicesOverdue: number; subscriptionsSuspended: number }
        notifications?: { notificationsSent: number; skipped: number }
      } | null

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to run billing automation.")
      }

      setMessage(
        `Automation complete. ${payload?.automation?.invoicesGenerated ?? 0} invoices generated, ${payload?.automation?.invoicesOverdue ?? 0} marked overdue, ${payload?.automation?.subscriptionsSuspended ?? 0} subscriptions suspended, ${payload?.notifications?.notificationsSent ?? 0} notifications sent.`
      )
      await loadOverview()
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to run billing automation."))
    } finally {
      setRunning(false)
    }
  }, [loadOverview])

  if (loading || !overview) {
    return <div className="text-[var(--muted)]">Loading billing overview...</div>
  }

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-[var(--border-soft)] pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-[var(--signal)]">Billing overview</p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,4.5vw,4.6rem)] leading-none tracking-[-0.04em]">
            Subscription revenue control
          </h1>
        </div>
        <button onClick={handleRunAutomation} disabled={running} className="saintce-button">
          {running ? "Running..." : "Run billing automation"}
        </button>
      </div>

      {message && <p className="mt-6 text-[var(--muted-strong)]">{message}</p>}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Monthly revenue", value: formatCurrency(overview.monthlyRevenue) },
          { label: "Active subscriptions", value: overview.activeSubscriptions },
          { label: "Overdue invoices", value: overview.overdueInvoices },
          { label: "Suspended services", value: overview.suspendedServices },
          { label: "Total clients", value: overview.totalClients },
          { label: "Total projects", value: overview.totalProjects },
        ].map((card) => (
          <div key={card.label} className="saintce-inset rounded-[24px] p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">{card.label}</p>
            <p className="mt-3 font-display text-4xl">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <section className="saintce-inset rounded-[28px] p-6">
          <h2 className="font-display text-2xl">Recent payments</h2>
          <div className="mt-5 space-y-3">
            {overview.recentPayments.length > 0 ? overview.recentPayments.map((payment) => (
              <div key={payment.id} className="rounded-[22px] border border-[var(--border-soft)] px-4 py-4">
                <p className="text-[var(--text-primary)]">{formatCurrency(payment.amount)}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{payment.invoice?.invoice_number || "Payment"} · {payment.payment_reference || "Manual reference"}</p>
              </div>
            )) : <p className="text-[var(--muted)]">No payments recorded yet.</p>}
          </div>
        </section>

        <section className="saintce-inset rounded-[28px] p-6">
          <h2 className="font-display text-2xl">Recent invoices</h2>
          <div className="mt-5 space-y-3">
            {overview.recentInvoices.length > 0 ? overview.recentInvoices.map((invoice) => (
              <div key={invoice.id} className="rounded-[22px] border border-[var(--border-soft)] px-4 py-4">
                <p className="text-[var(--text-primary)]">{invoice.invoice_number}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{formatCurrency(invoice.amount)} · {invoice.status} · due {invoice.due_date}</p>
              </div>
            )) : <p className="text-[var(--muted)]">No invoices generated yet.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
