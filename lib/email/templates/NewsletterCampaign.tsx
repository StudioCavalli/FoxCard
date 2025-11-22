import React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Hr,
} from '@react-email/components'
import { BaseLayout, BaseLayoutProps } from './layouts/Base'

export interface NewsletterCampaignProps extends BaseLayoutProps {
  firstName?: string
  htmlContent: string
  unsubscribeUrl?: string
}

export const NewsletterCampaign = ({
  storeName = 'GoldenEra',
  storeLogo,
  firstName = 'Cher abonné',
  htmlContent,
  unsubscribeUrl,
  trackingPixelUrl,
}: NewsletterCampaignProps) => {
  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      <Text style={greeting}>Bonjour {firstName},</Text>

      {/* Custom HTML content from campaign */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

      <Hr style={hr} />

      {/* Unsubscribe link */}
      {unsubscribeUrl && (
        <Text style={footer}>
          Vous recevez cet email car vous êtes inscrit à la newsletter de {storeName}.
          <br />
          <Link href={unsubscribeUrl} style={unsubscribeLink}>
            Se désinscrire
          </Link>
        </Text>
      )}
    </BaseLayout>
  )
}

export default NewsletterCampaign

// Styles
const greeting = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  marginBottom: '24px',
}

const hr = {
  borderColor: '#E5E7EB',
  margin: '32px 0',
}

const footer = {
  fontSize: '12px',
  color: '#9CA3AF',
  lineHeight: '1.8',
  textAlign: 'center' as const,
}

const unsubscribeLink = {
  color: '#9CA3AF',
  textDecoration: 'underline',
}
