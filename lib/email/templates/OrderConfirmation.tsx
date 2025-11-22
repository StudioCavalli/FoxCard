import {
  Text,
  Heading,
  Section,
  Row,
  Column,
  Button,
} from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './layouts/Base'
import { getOrderEmailTranslations, type Locale } from '../i18n'

interface OrderItem {
  name: string
  variantName?: string
  quantity: number
  price: number
  total: number
}

interface OrderConfirmationProps {
  storeName?: string
  storeLogo?: string
  customerName: string
  orderNumber: string
  orderDate: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  shippingAddress?: {
    address: string
    city: string
    postalCode: string
    country: string
  }
  trackingUrl?: string
  trackingPixelUrl?: string
  locale?: Locale
}

export const OrderConfirmation = ({
  storeName,
  storeLogo,
  customerName,
  orderNumber,
  orderDate,
  items,
  subtotal,
  shipping,
  tax,
  discount,
  total,
  shippingAddress,
  trackingUrl,
  trackingPixelUrl,
  locale = 'fr',
}: OrderConfirmationProps) => {
  const t = getOrderEmailTranslations(locale)

  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      {/* Greeting */}
      <Heading style={h1}>{t.confirmation.title}</Heading>

      <Text style={text}>
        {t.common.hello(customerName)}
      </Text>

      <Text style={text}>
        {t.confirmation.intro(orderNumber, orderDate)}
      </Text>

      {/* Order Summary */}
      <Section style={orderBox}>
        <Heading as="h2" style={h2}>
          {t.confirmation.orderSummary}
        </Heading>

        {/* Order Items */}
        {items.map((item, index) => (
          <Row key={index} style={itemRow}>
            <Column style={itemInfo}>
              <Text style={itemName}>
                {item.name}
                {item.variantName && (
                  <span style={variantName}> - {item.variantName}</span>
                )}
              </Text>
              <Text style={itemQuantity}>{t.confirmation.quantity(item.quantity)}</Text>
            </Column>
            <Column align="right" style={itemPrice}>
              <Text style={priceText}>{t.formatCurrency(item.total)}</Text>
            </Column>
          </Row>
        ))}

        {/* Totals */}
        <div style={divider} />

        <Row style={totalRow}>
          <Column>
            <Text style={totalLabel}>{t.confirmation.subtotal}</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>{t.formatCurrency(subtotal)}</Text>
          </Column>
        </Row>

        {shipping > 0 && (
          <Row style={totalRow}>
            <Column>
              <Text style={totalLabel}>{t.confirmation.shipping}</Text>
            </Column>
            <Column align="right">
              <Text style={totalValue}>{t.formatCurrency(shipping)}</Text>
            </Column>
          </Row>
        )}

        {tax > 0 && (
          <Row style={totalRow}>
            <Column>
              <Text style={totalLabel}>{t.confirmation.tax}</Text>
            </Column>
            <Column align="right">
              <Text style={totalValue}>{t.formatCurrency(tax)}</Text>
            </Column>
          </Row>
        )}

        {discount > 0 && (
          <Row style={totalRow}>
            <Column>
              <Text style={totalLabel}>{t.confirmation.discount}</Text>
            </Column>
            <Column align="right">
              <Text style={discountValue}>-{t.formatCurrency(discount)}</Text>
            </Column>
          </Row>
        )}

        <div style={divider} />

        <Row style={totalRow}>
          <Column>
            <Text style={totalLabelFinal}>{t.confirmation.total}</Text>
          </Column>
          <Column align="right">
            <Text style={totalValueFinal}>{t.formatCurrency(total)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Shipping Address */}
      {shippingAddress && (
        <Section style={addressBox}>
          <Heading as="h3" style={h3}>
            {t.confirmation.shippingAddress}
          </Heading>
          <Text style={addressText}>
            {shippingAddress.address}
            <br />
            {shippingAddress.postalCode} {shippingAddress.city}
            <br />
            {shippingAddress.country}
          </Text>
        </Section>
      )}

      {/* Track Order Button */}
      {trackingUrl && (
        <Section style={buttonContainer}>
          <Button href={trackingUrl} style={button}>
            {t.confirmation.trackOrder}
          </Button>
        </Section>
      )}

      {/* Help Text */}
      <Text style={helpText}>
        {t.common.questions}
      </Text>
    </BaseLayout>
  )
}

// Styles
const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 24px',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 16px',
}

const h3 = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0 0 12px',
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const orderBox = {
  backgroundColor: '#f6f9fc',
  border: '1px solid #e6ebf1',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const itemRow = {
  marginBottom: '16px',
}

const itemInfo = {
  verticalAlign: 'top',
}

const itemName = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const variantName = {
  color: '#8898aa',
  fontWeight: '400',
}

const itemQuantity = {
  color: '#8898aa',
  fontSize: '12px',
  margin: '0',
}

const itemPrice = {
  verticalAlign: 'top',
}

const priceText = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const divider = {
  borderTop: '1px solid #e6ebf1',
  margin: '16px 0',
}

const totalRow = {
  marginBottom: '8px',
}

const totalLabel = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0',
}

const totalValue = {
  color: '#525f7f',
  fontSize: '14px',
  margin: '0',
}

const discountValue = {
  color: '#00d084',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const totalLabelFinal = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
}

const totalValueFinal = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
}

const addressBox = {
  margin: '24px 0',
}

const addressText = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const helpText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
}
