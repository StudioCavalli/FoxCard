import React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'
import { BaseLayout, BaseLayoutProps } from './layouts/Base'

export interface NewsletterConfirmationProps extends BaseLayoutProps {
  firstName?: string
  confirmUrl: string
}

export const NewsletterConfirmation = ({
  storeName = 'FoxCard',
  storeLogo,
  firstName = 'Cher abonné',
  confirmUrl,
  trackingPixelUrl,
}: NewsletterConfirmationProps) => {
  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      <Text style={heading}>Confirmez votre inscription</Text>

      <Text style={paragraph}>Bonjour {firstName},</Text>

      <Text style={paragraph}>
        Merci de votre inscription à notre newsletter ! Pour confirmer votre inscription
        et commencer à recevoir nos actualités, veuillez cliquer sur le bouton ci-dessous :
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={confirmUrl}>
          Confirmer mon inscription
        </Button>
      </Section>

      <Text style={paragraph}>
        Si vous n'avez pas demandé à vous inscrire à notre newsletter, vous pouvez
        ignorer cet email en toute sécurité.
      </Text>

      <Hr style={hr} />

      <Text style={footer}>
        Vous recevez cet email car vous (ou quelqu'un) avez demandé à vous inscrire à
        la newsletter de {storeName}.
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
