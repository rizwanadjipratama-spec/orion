import { getErrorMessage } from "@/lib/errors"
import { handleStripeWebhookRequest } from "@/lib/stripe-server"

export async function POST(request: Request) {
  try {
    const result = await handleStripeWebhookRequest(request)
    return Response.json({ success: true, event: result.eventType, duplicate: result.duplicate })
  } catch (error) {
    return Response.json({ error: getErrorMessage(error, "Unable to process Stripe webhook.") }, { status: 500 })
  }
}
