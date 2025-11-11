import crypto from 'crypto'
import { WebhookConfig, WebhookPayload, WebhookEventType } from './types'
import { prisma } from '@/lib/prisma'

/**
 * Webhook Manager
 * Handles webhook registration and delivery
 */
class WebhookManager {
  private webhooks: Map<string, WebhookConfig> = new Map()

  /**
   * Register a webhook
   */
  registerWebhook(webhook: WebhookConfig): void {
    this.webhooks.set(webhook.id, webhook)
    console.log(`Webhook registered: ${webhook.id} -> ${webhook.url}`)
  }

  /**
   * Unregister a webhook
   */
  unregisterWebhook(webhookId: string): void {
    this.webhooks.delete(webhookId)
    console.log(`Webhook unregistered: ${webhookId}`)
  }

  /**
   * Get all webhooks for a specific event
   */
  getWebhooksForEvent(event: WebhookEventType): WebhookConfig[] {
    return Array.from(this.webhooks.values()).filter(
      (webhook) => webhook.enabled && webhook.events.includes(event)
    )
  }

  /**
   * Generate webhook signature
   */
  generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }

  /**
   * Deliver webhook to a URL
   */
  async deliverWebhook(
    webhook: WebhookConfig,
    payload: WebhookPayload,
    attempt: number = 1,
    deliveryId?: string
  ): Promise<void> {
    const maxAttempts = 3
    const payloadString = JSON.stringify(payload)
    const signature = this.generateSignature(payloadString, webhook.secret)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': payload.event,
      'X-Webhook-ID': webhook.id,
      'X-Webhook-Timestamp': payload.timestamp,
      ...webhook.headers,
    }

    // Create delivery record on first attempt
    if (attempt === 1 && !deliveryId) {
      const delivery = await prisma.webhookDelivery.create({
        data: {
          webhookId: webhook.id,
          event: payload.event,
          payload: payload as any,
          status: 'PENDING',
          attempts: 0,
        },
      })
      deliveryId = delivery.id
    }

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
      })

      const responseText = await response.text()

      if (!response.ok && attempt < maxAttempts) {
        // Update delivery record
        if (deliveryId) {
          await prisma.webhookDelivery.update({
            where: { id: deliveryId },
            data: {
              attempts: attempt,
              statusCode: response.status,
              response: responseText,
            },
          })
        }

        // Retry with exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        console.log(
          `Webhook delivery failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.deliverWebhook(webhook, payload, attempt + 1, deliveryId)
      }

      // Update delivery record with success
      if (deliveryId) {
        await prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: 'SUCCESS',
            attempts: attempt,
            statusCode: response.status,
            response: responseText.substring(0, 1000), // Limit response size
            deliveredAt: new Date(),
          },
        })
      }

      console.log(`Webhook delivered successfully to ${webhook.url}`)
      console.log(`Response: ${response.status} - ${responseText}`)
    } catch (error) {
      console.error(`Webhook delivery error (attempt ${attempt}/${maxAttempts}):`, error)

      if (attempt < maxAttempts) {
        // Update delivery record
        if (deliveryId) {
          await prisma.webhookDelivery.update({
            where: { id: deliveryId },
            data: {
              attempts: attempt,
              error: error instanceof Error ? error.message : String(error),
            },
          })
        }

        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        return this.deliverWebhook(webhook, payload, attempt + 1, deliveryId)
      }

      // Update delivery record with final failure
      if (deliveryId) {
        await prisma.webhookDelivery.update({
          where: { id: deliveryId },
          data: {
            status: 'FAILED',
            attempts: maxAttempts,
            error: error instanceof Error ? error.message : String(error),
          },
        })
      }

      // Log final failure
      console.error(`Webhook delivery failed after ${maxAttempts} attempts`)
    }
  }

  /**
   * Trigger webhooks for an event
   */
  async triggerEvent(event: WebhookEventType, data: any, storeId: string): Promise<void> {
    const webhooks = this.getWebhooksForEvent(event)

    if (webhooks.length === 0) {
      return
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      storeId,
    }

    // Deliver webhooks in parallel
    await Promise.all(
      webhooks.map((webhook) => this.deliverWebhook(webhook, payload))
    )
  }

  // Convenience methods for common events

  async onOrderCreated(orderId: string, orderData: any, storeId: string): Promise<void> {
    await this.triggerEvent('order.created', { orderId, ...orderData }, storeId)
  }

  async onOrderUpdated(orderId: string, orderData: any, storeId: string): Promise<void> {
    await this.triggerEvent('order.updated', { orderId, ...orderData }, storeId)
  }

  async onOrderCompleted(orderId: string, orderData: any, storeId: string): Promise<void> {
    await this.triggerEvent('order.completed', { orderId, ...orderData }, storeId)
  }

  async onOrderCancelled(orderId: string, orderData: any, storeId: string): Promise<void> {
    await this.triggerEvent('order.cancelled', { orderId, ...orderData }, storeId)
  }

  async onProductCreated(productId: string, productData: any, storeId: string): Promise<void> {
    await this.triggerEvent('product.created', { productId, ...productData }, storeId)
  }

  async onProductUpdated(productId: string, productData: any, storeId: string): Promise<void> {
    await this.triggerEvent('product.updated', { productId, ...productData }, storeId)
  }

  async onProductDeleted(productId: string, productData: any, storeId: string): Promise<void> {
    await this.triggerEvent('product.deleted', { productId, ...productData }, storeId)
  }

  async onCustomerCreated(customerId: string, customerData: any, storeId: string): Promise<void> {
    await this.triggerEvent('customer.created', { customerId, ...customerData }, storeId)
  }

  async onPaymentSucceeded(paymentData: any, storeId: string): Promise<void> {
    await this.triggerEvent('payment.succeeded', paymentData, storeId)
  }

  async onPaymentFailed(paymentData: any, storeId: string): Promise<void> {
    await this.triggerEvent('payment.failed', paymentData, storeId)
  }
}

// Export singleton instance
export const webhookManager = new WebhookManager()
