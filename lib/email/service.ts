import { render } from '@react-email/render'
import { getTransporter, getFromAddress } from './config'
import { prisma } from '@/lib/prisma'
import * as templates from './templates'

export interface SendEmailOptions {
  to: string
  subject: string
  template: keyof typeof templates
  props: Record<string, any>
  storeId: string
  orderId?: string
  customerId?: string
  trackingEnabled?: boolean
}

/**
 * Main email service
 * Sends emails with automatic retry and logging
 */
export class EmailService {
  private maxRetries = 3

  /**
   * Replace template variables with actual values
   * Supports {{variableName}} and nested properties like {{object.property}}
   */
  private replaceVariables(template: string, props: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim()

      // Handle nested properties (e.g., shippingAddress.city)
      const value = trimmedKey.split('.').reduce((obj, prop) => {
        return obj?.[prop]
      }, props)

      // Handle arrays (e.g., items) - convert to JSON for display
      if (Array.isArray(value)) {
        return JSON.stringify(value, null, 2)
      }

      // Handle objects - convert to JSON for display
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2)
      }

      // Return string value or empty string if undefined
      return value !== undefined && value !== null ? String(value) : ''
    })
  }

  /**
   * Send an email using a React Email template or custom DB template
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const {
      to,
      subject,
      template: templateName,
      props,
      storeId,
      orderId,
      customerId,
      trackingEnabled = true,
    } = options

    // Get transporter
    const transporter = getTransporter()
    if (!transporter) {
      console.error('Email service not configured')
      return false
    }

    // Get from address
    const from = getFromAddress()

    // Create email log in database first (to get ID for tracking)
    const emailLog = await prisma.emailLog.create({
      data: {
        storeId,
        templateName: templateName as string,
        to,
        from: `${from.name} <${from.address}>`,
        subject,
        htmlBody: '', // Will update after rendering
        textBody: '',
        status: 'PENDING',
        orderId,
        customerId,
      },
    })

    // Generate tracking pixel URL with emailLog ID
    let trackingPixelUrl: string | undefined
    if (trackingEnabled) {
      const trackingId = Buffer.from(emailLog.id).toString('base64')
      trackingPixelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/email/track/${trackingId}`
    }

    // Add tracking pixel to props
    const propsWithTracking = { ...props, trackingPixelUrl }

    // Check for custom template in database first
    const customTemplate = await prisma.emailTemplate.findUnique({
      where: {
        storeId_name: {
          storeId,
          name: templateName as string,
        },
      },
    })

    let html: string
    let text: string

    if (customTemplate && customTemplate.isActive) {
      // Use custom template from database with variable replacement
      html = this.replaceVariables(customTemplate.htmlBody, propsWithTracking)
      text = customTemplate.textBody
        ? this.replaceVariables(customTemplate.textBody, propsWithTracking)
        : ''

      console.log(`📧 Using custom template: ${templateName}`)
    } else {
      // Fallback to React Email templates
      const TemplateComponent = templates[templateName]
      if (!TemplateComponent) {
        console.error(`Template ${templateName} not found`)
        return false
      }

      html = await render(TemplateComponent(propsWithTracking as any))
      text = await render(TemplateComponent(propsWithTracking as any), {
        plainText: true,
      })

      console.log(`📧 Using default React Email template: ${templateName}`)
    }

    // Update email log with rendered content
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: {
        htmlBody: html,
        textBody: text,
      },
    })

    // Send with retry
    return this.sendWithRetry(emailLog.id, {
      from: `${from.name} <${from.address}>`,
      to,
      subject,
      html,
      text,
    })
  }

  /**
   * Send email with automatic retry
   */
  private async sendWithRetry(
    logId: string,
    mailOptions: {
      from: string
      to: string
      subject: string
      html: string
      text?: string
    },
    attempt = 1
  ): Promise<boolean> {
    const transporter = getTransporter()
    if (!transporter) return false

    try {
      // Update attempt count
      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: 'SENDING',
          attempts: attempt,
        },
      })

      // Send email
      const info = await transporter.sendMail(mailOptions)

      // Mark as sent
      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      })

      console.log(`✅ Email sent successfully to ${mailOptions.to}`)
      return true
    } catch (error) {
      console.error(`❌ Email send failed (attempt ${attempt}/${this.maxRetries}):`, error)

      // If max retries reached, mark as failed
      if (attempt >= this.maxRetries) {
        await prisma.emailLog.update({
          where: { id: logId },
          data: {
            status: 'FAILED',
            error: error instanceof Error ? error.message : String(error),
          },
        })
        return false
      }

      // Retry with exponential backoff
      const delay = Math.pow(2, attempt) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
      return this.sendWithRetry(logId, mailOptions, attempt + 1)
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(orderId: string, storeId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        store: true,
      },
    })

    if (!order) {
      console.error(`Order ${orderId} not found`)
      return false
    }

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Confirmation de commande #${order.orderNumber}`,
      template: 'OrderConfirmation',
      props: {
        storeName: order.store.name,
        storeLogo: order.store.logo,
        customerName: order.customerName || 'Client',
        orderNumber: order.orderNumber,
        orderDate: order.createdAt.toLocaleDateString('fr-FR'),
        items: order.items.map((item) => ({
          name: item.name,
          variantName: item.variantName,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        shippingAddress: order.shippingAddress,
        trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation/${order.orderNumber}`,
      },
      storeId,
      orderId: order.id,
      customerId: order.customerId || undefined,
    })
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(orderId: string, storeId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: true,
      },
    })

    if (!order) {
      console.error(`Order ${orderId} not found`)
      return false
    }

    const statusMessages: Record<string, string> = {
      PENDING: 'Votre commande est en attente de traitement.',
      PROCESSING: 'Votre commande est en cours de préparation.',
      COMPLETED: 'Votre commande a été traitée avec succès !',
      CANCELLED: 'Votre commande a été annulée.',
      REFUNDED: 'Votre commande a été remboursée.',
    }

    return this.sendEmail({
      to: order.customerEmail,
      subject: `Mise à jour de votre commande #${order.orderNumber}`,
      template: 'OrderStatusUpdate',
      props: {
        storeName: order.store.name,
        storeLogo: order.store.logo,
        customerName: order.customerName || 'Client',
        orderNumber: order.orderNumber,
        status: order.status,
        statusMessage: statusMessages[order.status] || 'Votre commande a été mise à jour.',
        trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation/${order.orderNumber}`,
      },
      storeId,
      orderId: order.id,
      customerId: order.customerId || undefined,
    })
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string, storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      console.error(`Store ${storeId} not found`)
      return false
    }

    return this.sendEmail({
      to: email,
      subject: `Bienvenue sur ${store.name} !`,
      template: 'WelcomeEmail',
      props: {
        storeName: store.name,
        storeLogo: store.logo,
        customerName: name,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
      },
      storeId,
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, resetToken: string, storeId: string) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    })

    if (!store) {
      console.error(`Store ${storeId} not found`)
      return false
    }

    return this.sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      template: 'ResetPassword',
      props: {
        storeName: store.name,
        storeLogo: store.logo,
        customerName: name,
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`,
        expiresIn: '1 heure',
      },
      storeId,
    })
  }
}

// Export singleton instance
export const emailService = new EmailService()
