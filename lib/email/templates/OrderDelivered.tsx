import {
  Text,
  Heading,
  Section,
  Button,
  Hr,
} from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './layouts/Base'

interface OrderDeliveredProps {
  storeName?: string
  storeLogo?: string
  customerName: string
  orderNumber: string
  deliveryDate: string
  reviewUrl?: string
  orderDetailsUrl?: string
  trackingPixelUrl?: string
}

export const OrderDelivered = ({
  storeName = 'FoxCard',
  storeLogo,
  customerName,
  orderNumber,
  deliveryDate,
  reviewUrl,
  orderDetailsUrl,
  trackingPixelUrl,
}: OrderDeliveredProps) => {
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
            <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" />
            <path
              d="M9 12L11 14L15 10"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <Heading style={heroHeading}>Commande livrée avec succès !</Heading>
        <Text style={heroText}>
          Bonjour {customerName}, votre commande #{orderNumber} a été livrée le {deliveryDate}.
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Main Content */}
      <Section style={contentSection}>
        <Heading as="h2" style={sectionHeading}>
          Nous espérons que vous êtes satisfait
        </Heading>
        <Text style={contentText}>
          Merci d'avoir choisi {storeName} ! Nous espérons que vos produits répondent à vos attentes.
        </Text>
        <Text style={contentText}>
          Si vous rencontrez le moindre problème avec votre commande, n'hésitez pas à nous contacter.
          Notre équipe est là pour vous aider.
        </Text>
      </Section>

      {/* Review Section */}
      {reviewUrl && (
        <>
          <Section style={reviewSection}>
            <Heading as="h3" style={reviewHeading}>
              Votre avis compte !
            </Heading>
            <Text style={reviewText}>
              Prenez quelques instants pour partager votre expérience avec nous.
              Votre avis nous aide à améliorer nos produits et services.
            </Text>
            <div style={buttonContainer}>
              <Button href={reviewUrl} style={reviewButton}>
                Laisser un avis
              </Button>
            </div>
          </Section>
          <Hr style={divider} />
        </>
      )}

      {/* Order Details Link */}
      {orderDetailsUrl && (
        <Section style={linksSection}>
          <Button href={orderDetailsUrl} style={detailsButton}>
            Voir les détails de ma commande
          </Button>
        </Section>
      )}

      {/* Footer Message */}
      <Section style={footerSection}>
        <Text style={footerText}>
          Merci de votre confiance !
        </Text>
        <Text style={footerSubtext}>
          Nous serions ravis de vous revoir bientôt sur {storeName}.
        </Text>
      </Section>
    </BaseLayout>
  )
}

export default OrderDelivered

// Styles
const heroSection = {
  padding: '40px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#f0fdf4',
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
  marginBottom: '16px',
  marginTop: '0',
}

const contentText = {
  fontSize: '15px',
  color: '#475569',
  marginBottom: '12px',
  lineHeight: '1.6',
}

const reviewSection = {
  padding: '32px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  margin: '32px 0',
}

const reviewHeading = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#78350f',
  marginBottom: '12px',
  marginTop: '0',
}

const reviewText = {
  fontSize: '15px',
  color: '#92400e',
  marginBottom: '20px',
  lineHeight: '1.5',
}

const buttonContainer = {
  marginTop: '20px',
}

const reviewButton = {
  backgroundColor: '#f59e0b',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
}

const linksSection = {
  padding: '20px',
  textAlign: 'center' as const,
}

const detailsButton = {
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
  padding: '32px 20px',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '16px',
  color: '#1e293b',
  marginBottom: '8px',
  fontWeight: '600',
}

const footerSubtext = {
  fontSize: '14px',
  color: '#64748b',
  marginBottom: '0',
  lineHeight: '1.5',
}
