import { Resend } from "resend"
import { siteConfig } from "@/lib/site-config"
import type { NotificationPayload } from "@/lib/notifications/types"

let resendClient: Resend | null = null

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY.")
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey)
  }

  return resendClient
}

export async function sendNotification(payload: NotificationPayload) {
  const resend = getResendClient()

  return resend.emails.send({
    from: `${siteConfig.brand.name} <onboarding@resend.dev>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    replyTo: payload.replyTo || siteConfig.contact.email,
  })
}
