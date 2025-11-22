import {
  Text,
  Heading,
  Section,
  Row,
  Column,
  Button,
  Hr,
  Link,
} from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './layouts/Base'
import { getOrderEmailTranslations, type Locale } from '../i18n'

interface OrderShippedProps {
  storeName?: string
  storeLogo?: string
  customerName: string
  orderNumber: string
  shipmentDate: string
  carrier: string
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: string
  shippingAddress?: {
    address: string
    city: string
    postalCode: string
    country: string
  }
  orderDetailsUrl?: string
  trackingPixelUrl?: string
  locale?: Locale
}

export const OrderShipped = ({
  storeName = 'GoldenEra',
  storeLogo,
  customerName,
  orderNumber,
  shipmentDate,
  carrier,
  trackingNumber,
  trackingUrl,
  estimatedDelivery,
  shippingAddress,
  orderDetailsUrl,
  trackingPixelUrl,
  locale = 'fr',
}: OrderShippedProps) => {
  const t = getOrderEmailTranslations(locale)
  const formattedTrackingNumber = trackingNumber || 'N/A'
  const defaultTrackingUrl = trackingUrl || orderDetailsUrl || '#'

  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      {/* Hero Section */}
      <Section style={heroSection}>
        <div style={iconContainer}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ margin: '0 auto' }}
          >
            <path
              d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21"
              stroke="#14b8a6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12L12 14L15 12"
              stroke="#14b8a6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <Heading style={heroHeading}>{t.shipped.title}</Heading>
        <Text style={heroText}>
          {t.common.hello(customerName)} {t.shipped.intro(orderNumber)}
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Shipment Details */}
      <Section style={contentSection}>
        <Heading as="h2" style={sectionHeading}>
          {t.confirmation.orderSummary}
        </Heading>

        <div style={detailsBox}>
          <Row style={detailRow}>
            <Column style={labelColumn}>
              <Text style={label}>{t.confirmation.orderSummary}</Text>
            </Column>
            <Column style={valueColumn}>
              <Text style={value}>#{orderNumber}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column style={labelColumn}>
              <Text style={label}>{t.formatDate(shipmentDate)}</Text>
            </Column>
            <Column style={valueColumn}>
              <Text style={value}>{shipmentDate}</Text>
            </Column>
          </Row>

          <Row style={detailRow}>
            <Column style={labelColumn}>
              <Text style={label}>{t.shipped.carrier(carrier).split(':')[0]}</Text>
            </Column>
            <Column style={valueColumn}>
              <Text style={value}>{carrier}</Text>
            </Column>
          </Row>

          {trackingNumber && (
            <Row style={detailRow}>
              <Column style={labelColumn}>
                <Text style={label}>{t.shipped.trackingNumber(trackingNumber).split(':')[0]}</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={{ ...value, fontFamily: 'monospace' }}>
                  {formattedTrackingNumber}
                </Text>
              </Column>
            </Row>
          )}

          {estimatedDelivery && (
            <Row style={detailRow}>
              <Column style={labelColumn}>
                <Text style={label}>{t.shipped.estimatedDelivery(estimatedDelivery).split(':')[0]}</Text>
              </Column>
              <Column style={valueColumn}>
                <Text style={{ ...value, color: '#14b8a6', fontWeight: '600' }}>
                  {estimatedDelivery}
                </Text>
              </Column>
            </Row>
          )}
        </div>
      </Section>

      {/* Tracking Button */}
      {trackingUrl && (
        <Section style={buttonSection}>
          <Button href={defaultTrackingUrl} style={trackingButton}>
            {t.shipped.trackShipment}
          </Button>
          <Text style={trackingHint}>
            <Link href={defaultTrackingUrl} style={trackingLink}>
              {defaultTrackingUrl}
            </Link>
          </Text>
        </Section>
      )}

      {/* Shipping Address */}
      {shippingAddress && (
        <Section style={addressSection}>
          <Heading as="h3" style={addressHeading}>
            {t.confirmation.shippingAddress}
          </Heading>
          <div style={addressBox}>
            <Text style={addressText}>
              {shippingAddress.address}
              <br />
              {shippingAddress.postalCode} {shippingAddress.city}
              <br />
              {shippingAddress.country}
            </Text>
          </div>
        </Section>
      )}

      <Hr style={divider} />

      {/* Footer Info */}
      <Section style={footerSection}>
        <Text style={footerText}>
          {t.common.questions}
        </Text>
      </Section>
    </BaseLayout>
  )
}

export default OrderShipped

// Styles
const heroSection = {
  padding: '40px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#f0fdfa',
  borderRadius: '12px',
  margin: '20px 0',
}

const iconContainer = {
  marginBottom: '20px',
}

const heroHeading = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#0f172a',
  marginBottom: '12px',
  marginTop: '0',
}

const heroText = {
  fontSize: '16px',
  color: '#64748b',
  marginBottom: '0',
  lineHeight: '1.5',
}

const divider = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
}

const contentSection = {
  padding: '0 20px',
}

const sectionHeading = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '20px',
  marginTop: '0',
}

const detailsBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '20px',
  border: '1px solid #e2e8f0',
}

const detailRow = {
  marginBottom: '16px',
}

const labelColumn = {
  width: '40%',
  paddingRight: '10px',
}

const valueColumn = {
  width: '60%',
}

const label = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
  fontWeight: '500',
}

const value = {
  fontSize: '14px',
  color: '#1e293b',
  margin: '0',
  fontWeight: '600',
}

const buttonSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const trackingButton = {
  backgroundColor: '#14b8a6',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
}

const trackingHint = {
  fontSize: '12px',
  color: '#64748b',
  marginTop: '16px',
  lineHeight: '1.5',
}

const trackingLink = {
  color: '#14b8a6',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
}

const addressSection = {
  padding: '0 20px',
  marginTop: '32px',
}

const addressHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  marginBottom: '12px',
  marginTop: '0',
}

const addressBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '16px',
  border: '1px solid #e2e8f0',
}

const addressText = {
  fontSize: '14px',
  color: '#1e293b',
  margin: '0',
  lineHeight: '1.6',
}

const footerSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '14px',
  color: '#64748b',
  marginBottom: '8px',
  lineHeight: '1.5',
}
