import { Text, Heading, Button, Section } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './layouts/Base'
import { getAccountEmailTranslations, type Locale } from '../i18n'

interface ResetPasswordProps {
  storeName?: string
  storeLogo?: string
  customerName: string
  resetUrl: string
  expiresInHours?: number
  trackingPixelUrl?: string
  locale?: Locale
}

export const ResetPassword = ({
  storeName,
  storeLogo,
  customerName,
  resetUrl,
  expiresInHours = 1,
  trackingPixelUrl,
  locale = 'fr',
}: ResetPasswordProps) => {
  const t = getAccountEmailTranslations(locale)

  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      <Heading style={h1}>{t.resetPassword.title}</Heading>

      <Text style={text}>{t.common.hello(customerName)}</Text>

      <Text style={text}>
        {t.resetPassword.intro}
      </Text>

      <Section style={buttonContainer}>
        <Button href={resetUrl} style={button}>
          {t.resetPassword.resetButton}
        </Button>
      </Section>

      <Text style={warningText}>
        {t.resetPassword.expiry(expiresInHours)}
      </Text>

      <Section style={securityBox}>
        <Text style={securityTitle}>🔒 Security</Text>
        <Text style={securityText}>
          {t.resetPassword.ignore}
        </Text>
      </Section>

      <Text style={helpText}>
        {t.common.questions}
      </Text>
    </BaseLayout>
  )
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

const warningText = {
  color: '#e25950',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const securityBox = {
  backgroundColor: '#fff9e6',
  border: '1px solid #ffd000',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const securityTitle = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 8px',
}

const securityText = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const helpText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
}
