import { sendNotification } from "@/lib/notifications/repository"
import { validateNotificationPayload } from "@/lib/notifications/validation"

function buildInvoiceEmailHtml(args: {
  clientName: string
  invoiceNumber: string
  amountLabel: string
  dueDate: string
  statusLabel: string
  intro: string
}) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Saintce Billing Update</h2>
      <p>Hello ${args.clientName},</p>
      <p>${args.intro}</p>
      <p><strong>Invoice:</strong> ${args.invoiceNumber}</p>
      <p><strong>Amount:</strong> ${args.amountLabel}</p>
      <p><strong>Status:</strong> ${args.statusLabel}</p>
      <p><strong>Due date:</strong> ${args.dueDate}</p>
      <p>Please complete payment to keep your subscription active and avoid service suspension.</p>
      <p>Saintce Control</p>
    </div>
  `
}

export async function queueInvoiceNotification(to: string, subject: string, html: string) {
  validateNotificationPayload(to)
  return sendNotification({ to, subject, html })
}

export async function sendIssuedInvoiceNotification(args: {
  to: string
  clientName: string
  invoiceNumber: string
  amountLabel: string
  dueDate: string
  statusLabel: string
}) {
  validateNotificationPayload(args.to)

  return sendNotification({
    to: args.to,
    subject: `New Invoice - ${args.invoiceNumber}`,
    html: buildInvoiceEmailHtml({
      ...args,
      intro: `A new invoice has been issued for your Saintce subscription.`,
    }),
  })
}

export async function sendInvoiceReminder(args: {
  to: string
  clientName: string
  invoiceNumber: string
  amountLabel: string
  dueDate: string
  statusLabel: string
}) {
  validateNotificationPayload(args.to)

  return sendNotification({
    to: args.to,
    subject: `Invoice Reminder - ${args.invoiceNumber}`,
    html: buildInvoiceEmailHtml({
      ...args,
      intro: `This is a reminder that your Saintce invoice is still awaiting payment.`,
    }),
  })
}
