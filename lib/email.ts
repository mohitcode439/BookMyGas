// Email utility for sending notifications
// This would be implemented with a Cloud Function in a real application

import { logger } from "./logger"

interface EmailOptions {
  to: string
  subject: string
  body: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // In a real application, this would use a service like SendGrid, Mailgun, etc.
    // For this demo, we'll just log the email
    logger.info("Sending email", {
      to: options.to,
      subject: options.subject,
    })

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 500))

    logger.info("Email sent successfully", {
      to: options.to,
    })

    return true
  } catch (error) {
    logger.error("Failed to send email", error)
    return false
  }
}

export function sendBookingConfirmationEmail(email: string, bookingId: string, userName: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Gas Cylinder Booking Confirmation",
    body: `
      Dear ${userName},
      
      Your gas cylinder booking (ID: ${bookingId}) has been received and is being processed.
      
      You will receive another email once your booking is approved.
      
      Thank you for using our service.
      
      Regards,
      Gas Agency Team
    `,
  })
}

export function sendBookingStatusUpdateEmail(
  email: string,
  bookingId: string,
  userName: string,
  status: string,
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Gas Cylinder Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    body: `
      Dear ${userName},
      
      Your gas cylinder booking (ID: ${bookingId}) has been ${status}.
      
      ${
        status === "approved"
          ? "Your cylinder will be delivered soon. Please keep the payment ready as per your selected payment method."
          : "If you have any questions, please contact our customer support."
      }
      
      Thank you for using our service.
      
      Regards,
      Gas Agency Team
    `,
  })
}

export function sendAccountBalanceEmail(email: string, userName: string, cylindersRemaining: number): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Gas Cylinder Account Balance",
    body: `
      Dear ${userName},
      
      This is to inform you that you have ${cylindersRemaining} gas cylinders remaining in your account for this year.
      
      Thank you for using our service.
      
      Regards,
      Gas Agency Team
    `,
  })
}
