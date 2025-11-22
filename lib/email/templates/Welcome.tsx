import { Text, Heading, Button, Section } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './layouts/Base'
import { getAccountEmailTranslations, type Locale } from '../i18n'

interface WelcomeEmailProps {
  storeName?: string
  storeLogo?: string
  customerName: string
  loginUrl?: string
  trackingPixelUrl?: string
  locale?: Locale
}

export const WelcomeEmail = ({
  storeName = 'GoldenEra',
  storeLogo,
  customerName,
  loginUrl,
  trackingPixelUrl,
  locale = 'fr',
}: WelcomeEmailProps) => {
  const t = getAccountEmailTranslations(locale)

  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      <Heading style={h1}>{t.welcome.title(storeName)}</Heading>

      <Text style={text}>
        {t.common.hello(customerName)}
      </Text>

      <Text style={text}>
        {t.welcome.intro}
      </Text>

      <Text style={text}>
        {t.welcome.benefits}
      </Text>

      <ul style={list}>
        <li style={listItem}>{t.welcome.benefit1}</li>
        <li style={listItem}>{t.welcome.benefit2}</li>
        <li style={listItem}>{t.welcome.benefit3}</li>
        <li style={listItem}>{t.welcome.benefit4}</li>
      </ul>

      {loginUrl && (
        <Section style={buttonContainer}>
          <Button href={loginUrl} style={button}>
            {t.welcome.startShopping}
          </Button>
        </Section>
      )}

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

const list = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  marginLeft: '24px',
  marginBottom: '24px',
}

const listItem = {
  marginBottom: '8px',
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
