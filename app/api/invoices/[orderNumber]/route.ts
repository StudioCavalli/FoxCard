import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { pdfService } from '@/lib/pdf/service'

/**
 * Download invoice PDF by order number
 * Public endpoint - anyone with the order number can download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await params

  try {
    // Find order by order number
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        invoice: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
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
