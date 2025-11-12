import { renderToBuffer } from '@react-pdf/renderer'
import { InvoiceDocument, InvoiceProps } from './templates/Invoice'
import { prisma } from '@/lib/prisma'
import React from 'react'

/**
 * PDF Generation Service
 * Generates invoices and stores them in the database
 */
export class PDFService {
  /**
   * Generate invoice PDF for an order
   */
  async generateInvoice(orderId: string): Promise<Buffer> {
    // Fetch order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
        invoice: true,
      },
    })

    if (!order) {
      throw new Error(`Order ${orderId} not found`)
    }

    // Check if invoice already exists
    let invoice = order.invoice

    // Generate invoice number if needed
    if (!invoice) {
      const invoiceNumber = await this.generateInvoiceNumber(order.storeId)

      // Create invoice record
      invoice = await prisma.invoice.create({
        data: {
          storeId: order.storeId,
          orderId: order.id,
          invoiceNumber,
          invoiceDate: new Date(),
          customerName: order.customerName || 'Client',
          customerEmail: order.customerEmail,
          customerAddress: order.shippingAddress || undefined,
          merchantName: order.store.name,
          merchantAddress: order.store.settings ? (order.store.settings as any).address : undefined,
          merchantTax: order.store.settings ? (order.store.settings as any).taxId : undefined,
          items: order.items.map((item) => ({
            name: item.name,
            variantName: item.variantName,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          discount: order.discount,
          total: order.total,
          paymentStatus: order.paymentStatus,
          paidAt: order.paymentStatus === 'PAID' ? new Date() : undefined,
        },
      })
    }

    // Prepare invoice props
    const invoiceProps: InvoiceProps = {
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate.toISOString(),
      dueDate: invoice.dueDate?.toISOString(),
      merchantName: invoice.merchantName,
      merchantAddress: invoice.merchantAddress as any,
      merchantTax: invoice.merchantTax || undefined,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      customerAddress: invoice.customerAddress as any,
      orderNumber: order.orderNumber,
      items: invoice.items as any,
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      shipping: invoice.shipping,
      discount: invoice.discount,
      total: invoice.total,
      paymentStatus: invoice.paymentStatus,
      paidAt: invoice.paidAt?.toISOString(),
      notes: invoice.notes || undefined,
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(InvoiceDocument, invoiceProps) as any
    )

    // Update invoice record
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        pdfGenerated: true,
        pdfGeneratedAt: new Date(),
      },
    })

    return pdfBuffer
  }

  /**
   * Generate sequential invoice number
   */
  private async generateInvoiceNumber(storeId: string): Promise<string> {
    const year = new Date().getFullYear()

    // Count invoices for this store and year
    const count = await prisma.invoice.count({
      where: {
        storeId,
        invoiceDate: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
      },
    })

    // Generate invoice number: INV-2025-0001
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, '0')}`

    return invoiceNumber
  }

  /**
   * Get invoice PDF buffer
   */
  async getInvoicePDF(invoiceId: string): Promise<Buffer> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        order: true,
      },
    })

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`)
    }

    // If PDF not generated yet, generate it
    if (!invoice.pdfGenerated) {
      return this.generateInvoice(invoice.orderId)
    }

    // Regenerate PDF (in future, we could cache it in R2/S3)
    return this.generateInvoice(invoice.orderId)
  }

  /**
   * Get invoice by order ID
   */
  async getInvoiceByOrderId(orderId: string) {
    return prisma.invoice.findUnique({
      where: { orderId },
    })
  }

  /**
   * Update invoice status
   */
  async updateInvoicePaymentStatus(
    invoiceId: string,
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  ) {
    return prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentStatus,
        paidAt: paymentStatus === 'PAID' ? new Date() : undefined,
      },
    })
  }
}

// Export singleton instance
export const pdfService = new PDFService()
