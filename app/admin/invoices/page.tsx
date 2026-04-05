"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getSubscriptions } from "@/lib/subscriptions/service"
import { getInvoices, generateInvoiceManually, markInvoicePaid, voidInvoice } from "@/lib/invoices/service"
import type { SubscriptionRecord } from "@/lib/subscriptions/types"
import type { InvoiceRecord } from "@/lib/invoices/types"
import { hasAdminAccess } from "@/lib/admin-auth"
import { getErrorMessage } from "@/lib/errors"
import { formatCurrency } from "@/lib/utils"

const today = new Date().toISOString().slice(0, 10)
const INITIAL_FORM = {
  subscription_id: "",
  amount: 0,
  issue_date: today,
  due_date: today,
}

export default function AdminInvoicesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([])
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([])
  const [form, setForm] = useState(INITIAL_FORM)

  const loadData = useCallback(async () => {
    try {
      const [subscriptionRows, invoiceRows] = await Promise.all([
        getSubscriptions({ page: 1, pageSize: 100 }),
        getInvoices({ page: 1, pageSize: 100 }),
      ])
      setSubscriptions(subscriptionRows.data)
      setInvoices(invoiceRows.data)
      setMessage(null)
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to load invoices."))
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
        await loadData()
      }
    }
    void init()
    return () => {
      active = false
    }
  }, [loadData, router])

  const handleSubmit = useCallback(async () => {
    setSaving(true)
    try {
      await generateInvoiceManually(form)
      setForm(INITIAL_FORM)
      setMessage("Invoice generated.")
      await loadData()
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to generate invoice."))
    } finally {
      setSaving(false)
    }
  }, [form, loadData])

  const handleMarkPaid = useCallback(async (invoiceId: string) => {
    try {
      await markInvoicePaid(invoiceId)
      setMessage("Invoice marked paid.")
      await loadData()
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to mark invoice paid."))
    }
  }, [loadData])

  const handleVoid = useCallback(async (invoiceId: string) => {
    try {
      await voidInvoice(invoiceId)
      setMessage("Invoice voided.")
      await loadData()
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to void invoice."))
    }
  }, [loadData])

  const handleStripeCheckout = useCallback(async (invoiceId: string) => {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      if (!token) {
        throw new Error("Missing admin session token.")
      }

      const response = await fetch("/api/payments/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invoiceId }),
      })

      const payload = (await response.json().catch(() => null)) as {
        error?: string
        session?: { url?: string | null }
      } | null

      if (!response.ok || !payload?.session?.url) {
        throw new Error(payload?.error || "Unable to create Stripe checkout session.")
      }

      window.open(payload.session.url, "_blank", "noopener,noreferrer")
      setMessage("Stripe checkout session created.")
      await loadData()
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to create Stripe checkout session."))
    }
  }, [loadData])

  if (loading) {
    return <div className="text-[var(--muted)]">Loading invoices...</div>
  }

  return (
    <div>
      <div className="border-b border-[var(--border-soft)] pb-8">
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-[var(--signal)]">Invoices</p>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,4.5vw,4.6rem)] leading-none tracking-[-0.04em]">Invoice issuance</h1>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="saintce-inset rounded-[28px] p-6">
          <div className="grid gap-4">
            <select value={form.subscription_id} onChange={(e) => setForm((prev) => ({ ...prev, subscription_id: e.target.value }))} className="saintce-input">
              <option value="">Select subscription</option>
              {subscriptions.map((subscription) => <option key={subscription.id} value={subscription.id}>{subscription.service?.name || subscription.id}</option>)}
            </select>
            <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value || 0) }))} className="saintce-input" placeholder="Amount" />
            <div className="grid gap-4 md:grid-cols-2">
              <input type="date" value={form.issue_date} onChange={(e) => setForm((prev) => ({ ...prev, issue_date: e.target.value }))} className="saintce-input" />
              <input type="date" value={form.due_date} onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value }))} className="saintce-input" />
            </div>
            {message && <p className="text-[var(--muted-strong)]">{message}</p>}
            <button onClick={handleSubmit} disabled={saving} className="saintce-button">{saving ? "Generating..." : "Generate invoice"}</button>
          </div>
        </section>

        <section className="saintce-inset rounded-[28px] p-6">
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-[22px] border border-[var(--border-soft)] px-4 py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg text-[var(--text-primary)]">{invoice.invoice_number}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{formatCurrency(invoice.amount)} · {invoice.status} · due {invoice.due_date}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleStripeCheckout(invoice.id)} className="saintce-button saintce-button--ghost">Stripe link</button>
                    <button onClick={() => handleMarkPaid(invoice.id)} className="saintce-button saintce-button--ghost">Mark paid</button>
                    <button onClick={() => handleVoid(invoice.id)} className="saintce-button saintce-button--ghost">Void</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
