import { Text, Heading, Button, Section } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './layouts/Base'

interface ResetPasswordProps {
  storeName?: string
  storeLogo?: string
  customerName: string
  resetUrl: string
  expiresIn?: string
  trackingPixelUrl?: string
}

export const ResetPassword = ({
  storeName,
  storeLogo,
  customerName,
  resetUrl,
  expiresIn = '1 heure',
  trackingPixelUrl,
}: ResetPasswordProps) => {
  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      <Heading style={h1}>Réinitialisation de mot de passe</Heading>

      <Text style={text}>Bonjour {customerName},</Text>

      <Text style={text}>
        Vous avez demandé à réinitialiser le mot de passe de votre compte.
        Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
      </Text>

      <Section style={buttonContainer}>
        <Button href={resetUrl} style={button}>
          Réinitialiser mon mot de passe
        </Button>
      </Section>

      <Text style={warningText}>
        Ce lien expirera dans <strong>{expiresIn}</strong>.
      </Text>

      <Section style={securityBox}>
        <Text style={securityTitle}>🔒 Sécurité</Text>
        <Text style={securityText}>
          Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
          Votre mot de passe ne sera pas modifié.
        </Text>
      </Section>

      <Text style={helpText}>
        Des questions ? Contactez notre support client.
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
