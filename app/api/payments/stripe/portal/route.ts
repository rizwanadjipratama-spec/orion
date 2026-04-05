import { getErrorMessage } from "@/lib/errors"
import { createStripeBillingPortalSession } from "@/lib/stripe-server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

async function isAuthorized(request: Request) {
  const bearer = request.headers.get("authorization")

  if (!bearer?.startsWith("Bearer ")) {
    return false
  }

  const token = bearer.replace("Bearer ", "").trim()
  if (!token) {
    return false
  }

  const admin = getSupabaseAdmin()
  const { data: authData, error: authError } = await admin.auth.getUser(token)

  if (authError || !authData.user) {
    return false
  }

  const { data: adminRow, error: adminError } = await admin
    .from("admin_users")
    .select("id")
    .eq("user_id", authData.user.id)
    .eq("is_active", true)
    .maybeSingle()

  if (adminError) {
    return false
  }

  return Boolean(adminRow)
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthorized(request))) {
      return Response.json({ error: "Unauthorized." }, { status: 401 })
    }

    const body = (await request.json()) as { subscriptionId?: string }

    if (!body.subscriptionId) {
      return Response.json({ error: "Subscription is required." }, { status: 400 })
    }

    const session = await createStripeBillingPortalSession(body.subscriptionId)
    return Response.json({ success: true, session })
  } catch (error) {
    return Response.json({ error: getErrorMessage(error, "Unable to create Stripe billing portal session.") }, { status: 500 })
  }
}

