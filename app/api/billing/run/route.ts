import { executeBillingAutomation, sendBillingNotifications } from "@/lib/billing/server"
import { getErrorMessage } from "@/lib/errors"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

async function isAuthorized(request: Request) {
  const cronSecret = process.env.BILLING_CRON_SECRET
  const bearer = request.headers.get("authorization")
  const headerSecret = request.headers.get("x-cron-secret")

  if (cronSecret && (bearer === `Bearer ${cronSecret}` || headerSecret === cronSecret)) {
    return true
  }

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

    const body = (await request.json().catch(() => ({}))) as { runAt?: string }
    const runAt = body.runAt || new Date().toISOString()

    const automation = await executeBillingAutomation(runAt)
    const notifications = await sendBillingNotifications(runAt)

    return Response.json({
      success: true,
      runAt,
      automation,
      notifications,
    })
  } catch (error) {
    return Response.json({ error: getErrorMessage(error, "Unable to run billing automation.") }, { status: 500 })
  }
}
