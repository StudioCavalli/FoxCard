import { Text, Heading, Button, Section } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './layouts/Base'

interface OrderStatusUpdateProps {
  storeName?: string
  storeLogo?: string
  customerName: string
  orderNumber: string
  status: string
  statusMessage: string
  trackingNumber?: string
  trackingUrl?: string
  trackingPixelUrl?: string
}

export const OrderStatusUpdate = ({
  storeName,
  storeLogo,
  customerName,
  orderNumber,
  status,
  statusMessage,
  trackingNumber,
  trackingUrl,
  trackingPixelUrl,
}: OrderStatusUpdateProps) => {
  const statusColors: Record<string, string> = {
    PROCESSING: '#5469d4',
    SHIPPED: '#00d084',
    DELIVERED: '#00d084',
    CANCELLED: '#e25950',
  }

  const statusColor = statusColors[status] || '#525f7f'

  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      <Heading style={h1}>Mise à jour de votre commande</Heading>

      <Text style={text}>Bonjour {customerName},</Text>

      <Text style={text}>
        Votre commande <strong>#{orderNumber}</strong> a été mise à jour.
      </Text>

      <Section style={{ ...statusBox, borderColor: statusColor }}>
        <Text style={{ ...statusLabel, color: statusColor }}>
          Statut : {getStatusLabel(status)}
        </Text>
        <Text style={statusText}>{statusMessage}</Text>
      </Section>

      {trackingNumber && (
        <Text style={text}>
          <strong>Numéro de suivi :</strong> {trackingNumber}
        </Text>
      )}

      {trackingUrl && (
        <Section style={buttonContainer}>
          <Button href={trackingUrl} style={button}>
            Suivre ma commande
          </Button>
        </Section>
      )}

      <Text style={helpText}>
        Des questions ? Répondez à cet email ou contactez notre support client.
      </Text>
    </BaseLayout>
  )
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    PROCESSING: 'En cours de traitement',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
    REFUNDED: 'Remboursée',
  }
  return labels[status] || status
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '1.3',
  margin: '0 0 24px',
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const statusBox = {
  backgroundColor: '#f6f9fc',
  border: '2px solid',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const statusLabel = {
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 12px',
}

const statusText = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
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
