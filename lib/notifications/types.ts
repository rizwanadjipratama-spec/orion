export interface NotificationPayload {
  to: string
  subject: string
  html: string
  replyTo?: string | null
}
