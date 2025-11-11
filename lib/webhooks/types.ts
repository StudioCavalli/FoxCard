/**
 * Webhook Event Types
 */
export type WebhookEventType =
  | 'order.created'
  | 'order.updated'
  | 'order.completed'
  | 'order.cancelled'
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'customer.created'
  | 'payment.succeeded'
  | 'payment.failed'

/**
 * Webhook Payload
 */
export interface WebhookPayload {
  event: WebhookEventType
  timestamp: string
  data: any
  storeId: string
}

/**
 * Webhook Configuration
 */
export interface WebhookConfig {
  id: string
  url: string
  events: WebhookEventType[]
  secret: string
  enabled: boolean
  headers?: Record<string, string>
}

/**
 * Webhook Delivery
 */
export interface WebhookDelivery {
  id: string
  webhookId: string
  event: WebhookEventType
  payload: WebhookPayload
  status: 'pending' | 'success' | 'failed'
  attempts: number
  response?: {
    statusCode: number
    body: string
  }
  error?: string
  deliveredAt?: Date
  createdAt: Date
}
