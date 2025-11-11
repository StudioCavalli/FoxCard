import { Plugin } from '../types'

/**
 * Example Plugin: Email Notifications
 * Sends email notifications when orders are created or paid
 */
export const emailNotificationsPlugin: Plugin = {
  metadata: {
    id: 'email-notifications',
    name: 'Email Notifications',
    version: '1.0.0',
    description: 'Sends email notifications for order events',
    author: 'FoxCard Team',
    enabled: true,
  },

  config: {
    smtpHost: process.env.SMTP_HOST || 'smtp.example.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@foxcard.com',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@foxcard.com',
  },

  onInstall: async () => {
    console.log('Email Notifications plugin installed')
    // Could create database tables, initialize services, etc.
  },

  onUninstall: async () => {
    console.log('Email Notifications plugin uninstalled')
    // Cleanup
  },

  onEnable: () => {
    console.log('Email Notifications plugin enabled')
  },

  onDisable: () => {
    console.log('Email Notifications plugin disabled')
  },

  registerHooks: (hooks) => {
    // Hook: Order Created
    hooks.onOrderCreated(async (data) => {
      console.log(`[Email Plugin] Order created: ${data.orderNumber}`)
      // In production, send email using nodemailer or similar
      /*
      await sendEmail({
        to: data.customerEmail,
        subject: `Order Confirmation - ${data.orderNumber}`,
        html: `
          <h1>Thank you for your order!</h1>
          <p>Order Number: ${data.orderNumber}</p>
          <p>Total: €${data.total.toFixed(2)}</p>
        `,
      })
      */
    })

    // Hook: Order Paid
    hooks.onOrderPaid(async (data) => {
      console.log(`[Email Plugin] Order paid: ${data.orderNumber}`)
      // Send payment confirmation email
      /*
      await sendEmail({
        to: data.customerEmail,
        subject: `Payment Confirmed - ${data.orderNumber}`,
        html: `
          <h1>Payment Received!</h1>
          <p>Your payment of €${data.total.toFixed(2)} has been processed.</p>
          <p>Order Number: ${data.orderNumber}</p>
        `,
      })
      */
    })

    // Hook: Order Status Changed
    hooks.onOrderStatusChanged(async (data) => {
      console.log(
        `[Email Plugin] Order status changed: ${data.orderNumber} (${data.oldStatus} → ${data.newStatus})`
      )
      // Send status update email
    })
  },
}
