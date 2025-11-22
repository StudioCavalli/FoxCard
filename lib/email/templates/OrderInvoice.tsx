import {
  Text,
  Heading,
  Section,
  Row,
  Column,
  Button,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './layouts/Base'

interface OrderItem {
  name: string
  variantName?: string
  quantity: number
  price: number
  total: number
}

interface OrderInvoiceProps {
  storeName?: string
  storeLogo?: string
  customerName: string
  orderNumber: string
  invoiceNumber: string
  invoiceDate: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  invoiceUrl?: string
  trackingPixelUrl?: string
}

export const OrderInvoice = ({
  storeName = 'GoldenEra',
  storeLogo,
  customerName,
  orderNumber,
  invoiceNumber,
  invoiceDate,
  items,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  invoiceUrl,
  trackingPixelUrl,
}: OrderInvoiceProps) => {
  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      <Section style={headerSection}>
        <Heading style={title}>Facture #{invoiceNumber}</Heading>
        <Text style={subtitle}>Commande #{orderNumber}</Text>
        <Text style={date}>Date: {invoiceDate}</Text>
      </Section>

      <Hr style={divider} />

      <Section style={customerSection}>
        <Text style={label}>Facturé à:</Text>
        <Text style={customerNameStyle}>{customerName}</Text>
      </Section>

      <Section style={itemsSection}>
        <Heading as="h2" style={sectionTitle}>Articles</Heading>
        <table style={table}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left' }}>Article</th>
              <th style={{ ...th, textAlign: 'center' }}>Qté</th>
              <th style={{ ...th, textAlign: 'right' }}>Prix</th>
              <th style={{ ...th, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={td}>
                  {item.name}
                  {item.variantName && <br />}
                  {item.variantName && <span style={variant}>{item.variantName}</span>}
                </td>
                <td style={{ ...td, textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  {(item.price / 100).toFixed(2)}€
                </td>
                <td style={{ ...td, textAlign: 'right', fontWeight: '600' }}>
                  {(item.total / 100).toFixed(2)}€
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section style={totalsSection}>
        <Row style={totalRow}>
          <Column style={totalLabel}>Sous-total:</Column>
          <Column style={totalValue}>{(subtotal / 100).toFixed(2)}€</Column>
        </Row>
        <Row style={totalRow}>
          <Column style={totalLabel}>Livraison:</Column>
          <Column style={totalValue}>{(shipping / 100).toFixed(2)}€</Column>
        </Row>
        {discount > 0 && (
          <Row style={totalRow}>
            <Column style={totalLabel}>Réduction:</Column>
            <Column style={{ ...totalValue, color: '#22c55e' }}>
              -{(discount / 100).toFixed(2)}€
            </Column>
          </Row>
        )}
        {tax > 0 && (
          <Row style={totalRow}>
            <Column style={totalLabel}>TVA:</Column>
            <Column style={totalValue}>{(tax / 100).toFixed(2)}€</Column>
          </Row>
        )}
        <Hr style={totalDivider} />
        <Row style={grandTotalRow}>
          <Column style={grandTotalLabel}>TOTAL:</Column>
          <Column style={grandTotalValue}>{(total / 100).toFixed(2)}€</Column>
        </Row>
      </Section>

      {invoiceUrl && (
        <Section style={buttonSection}>
          <Button href={invoiceUrl} style={downloadButton}>
            Télécharger la facture (PDF)
          </Button>
        </Section>
      )}

      <Section style={footerSection}>
        <Text style={footerText}>
          Merci pour votre achat !
        </Text>
      </Section>
    </BaseLayout>
  )
}

export default OrderInvoice

// Styles
const headerSection = {
  padding: '20px',
  textAlign: 'center' as const,
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  marginBottom: '24px',
}

const title = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#0f172a',
  margin: '0 0 8px 0',
}

const subtitle = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
}

const date = {
  fontSize: '14px',
  color: '#64748b',
  margin: '4px 0 0 0',
}

const divider = {
  borderColor: '#e2e8f0',
  margin: '24px 0',
}

const customerSection = {
  padding: '0 20px',
  marginBottom: '24px',
}

const label = {
  fontSize: '12px',
  color: '#64748b',
  textTransform: 'uppercase' as const,
  margin: '0 0 4px 0',
}

const customerNameStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0',
}

const itemsSection = {
  padding: '0 20px',
  marginBottom: '24px',
}

const sectionTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '16px',
}

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
}

const th = {
  padding: '12px 8px',
  backgroundColor: '#f1f5f9',
  fontSize: '12px',
  fontWeight: '600',
  color: '#475569',
  textTransform: 'uppercase' as const,
  borderBottom: '2px solid #e2e8f0',
}

const td = {
  padding: '12px 8px',
  fontSize: '14px',
  color: '#1e293b',
  borderBottom: '1px solid #f1f5f9',
}

const variant = {
  fontSize: '12px',
  color: '#64748b',
}

const totalsSection = {
  padding: '0 20px',
  marginTop: '32px',
}

const totalRow = {
  marginBottom: '8px',
}

const totalLabel = {
  fontSize: '14px',
  color: '#64748b',
  textAlign: 'right' as const,
  paddingRight: '20px',
}

const totalValue = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#1e293b',
  textAlign: 'right' as const,
  width: '120px',
}

const totalDivider = {
  borderColor: '#cbd5e1',
  margin: '16px 0',
}

const grandTotalRow = {
  marginTop: '8px',
}

const grandTotalLabel = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#0f172a',
  textAlign: 'right' as const,
  paddingRight: '20px',
}

const grandTotalValue = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#14b8a6',
  textAlign: 'right' as const,
  width: '120px',
}

const buttonSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const downloadButton = {
  backgroundColor: '#14b8a6',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
}

const footerSection = {
  padding: '24px 20px',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '14px',
  color: '#64748b',
}
