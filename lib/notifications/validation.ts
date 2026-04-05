export function validateNotificationPayload(email: string) {
  if (!email.trim()) {
    throw new Error("Notification target email is required.")
  }

  return email.trim()
}
