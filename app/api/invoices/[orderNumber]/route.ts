import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pdfService } from '@/lib/pdf/service'

/**
 * Download invoice PDF by order number
 * Requires authentication: user must be the store owner, a store member, or the customer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params

  try {
    // Require authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find order by order number
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        invoice: true,
        store: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check authorization: store owner, store member, or the customer
    const userId = session.user.id
    const isStoreOwner = order.store.ownerId === userId
    const isCustomer = order.customerEmail === session.user.email

    let isStoreMember = false
    if (!isStoreOwner && !isCustomer) {
      const storeUser = await prisma.storeUser.findUnique({
        where: {
          userId_storeId: {
            userId,
            storeId: order.storeId,
          },
        },
        select: { status: true },
      })
      isStoreMember = storeUser?.status === 'ACTIVE'
    }

    if (!isStoreOwner && !isStoreMember && !isCustomer) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Generate or get invoice PDF
    let pdfBuffer: Buffer

    if (order.invoice) {
      pdfBuffer = await pdfService.getInvoicePDF(order.invoice.id)
    } else {
      // Generate invoice if it doesn't exist
      pdfBuffer = await pdfService.generateInvoice(order.id)
    }

    // Return PDF (convert Buffer to Uint8Array for Response compatibility)
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Facture-${orderNumber}.pdf"`,
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}
