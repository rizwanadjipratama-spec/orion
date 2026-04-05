import { getErrorMessage } from "@/lib/errors"
import { createPortalStripeCheckoutSession } from "@/lib/stripe-server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

/**
 * Verify that the request bearer token belongs to a registered client,
 * and that the given invoiceId actually belongs to that client.
 * Returns the client's email if valid, null otherwise.
 */
async function verifyPortalClient(
  request: Request,
  invoiceId: string
): Promise<{ userId: string; email: string } | null> {
  const bearer = request.headers.get("authorization")

  if (!bearer?.startsWith("Bearer ")) {
    return null
  }

  const token = bearer.replace("Bearer ", "").trim()
  if (!token) return null

  const admin = getSupabaseAdmin()

  // Verify the JWT and get the user
  const { data: authData, error: authError } = await admin.auth.getUser(token)
  if (authError || !authData.user?.email) return null

  const email = authData.user.email

  // Confirm the user is a registered client
  const { data: client, error: clientError } = await admin
    .from("clients")
    .select("id")
    .ilike("email", email)
    .single()

  if (clientError || !client) return null
  const clientRecord = client as Record<string, unknown>

  // Confirm the invoice belongs to this client by tracing the chain
  const { data: invoiceRow, error: invoiceError } = await admin
    .from("invoices")
    .select(`
      id,
      subscription:subscriptions (
        service:services (
          project:projects ( client_id )
        )
      )
    `)
    .eq("id", invoiceId)
    .single()

  if (invoiceError || !invoiceRow) return null

  // Traverse the nested join result (cast away Supabase's inferred never on deep joins)
  const row = invoiceRow as Record<string, unknown>
  const rawSub = row.subscription
  const sub = Array.isArray(rawSub) ? (rawSub as Record<string, unknown>[])[0] : (rawSub as Record<string, unknown> | null)
  const rawSvc = sub?.service
  const svc = Array.isArray(rawSvc) ? (rawSvc as Record<string, unknown>[])[0] : (rawSvc as Record<string, unknown> | null)
  const rawProj = svc?.project
  const proj = Array.isArray(rawProj) ? (rawProj as Record<string, unknown>[])[0] : (rawProj as Record<string, unknown> | null)
  const clientId = proj?.client_id ?? null

  if (clientId !== clientRecord.id) return null

  return { userId: authData.user.id, email }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { invoiceId?: string }

    if (!body.invoiceId) {
      return Response.json({ error: "Invoice ID is required." }, { status: 400 })
    }

    const verified = await verifyPortalClient(request, body.invoiceId)

    if (!verified) {
      return Response.json({ error: "Unauthorized." }, { status: 401 })
    }

    const session = await createPortalStripeCheckoutSession(body.invoiceId)

    if (!session.url) {
      return Response.json({ error: "Stripe did not return a checkout URL." }, { status: 500 })
    }

    return Response.json({ url: session.url })
  } catch (error) {
    return Response.json(
      { error: getErrorMessage(error, "Unable to create payment session.") },
      { status: 500 }
    )
  }
}
