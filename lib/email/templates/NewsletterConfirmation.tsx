import React from 'react'
import {
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'
import { BaseLayout, BaseLayoutProps } from './layouts/Base'
import { getNewsletterEmailTranslations, type Locale } from '../i18n'

export interface NewsletterConfirmationProps extends BaseLayoutProps {
  firstName?: string
  confirmUrl: string
  locale?: Locale
}

export const NewsletterConfirmation = ({
  storeName = 'GoldenEra Marketplace',
  storeLogo,
  firstName,
  confirmUrl,
  trackingPixelUrl,
  locale = 'fr',
}: NewsletterConfirmationProps) => {
  const t = getNewsletterEmailTranslations(locale)
  const displayName = firstName || 'there'

  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      <Text style={heading}>{t.confirmation.title}</Text>

      <Text style={paragraph}>{t.common.hello(displayName)}</Text>

      <Text style={paragraph}>
        {t.confirmation.intro}
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={confirmUrl}>
          {t.confirmation.confirmButton}
        </Button>
      </Section>

      <Text style={paragraph}>
        {t.confirmation.expiry}
      </Text>

      <Hr style={hr} />

      <Text style={footer}>
        {t.common.team(storeName)}
      </Text>
    </BaseLayout>
  )
}

export default NewsletterConfirmation

// Styles
const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1F2937',
  marginBottom: '24px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#374151',
  marginBottom: '16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#3B82F6',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const hr = {
  borderColor: '#E5E7EB',
  margin: '32px 0',
}

const footer = {
  fontSize: '12px',
  color: '#9CA3AF',
  lineHeight: '1.5',
}
