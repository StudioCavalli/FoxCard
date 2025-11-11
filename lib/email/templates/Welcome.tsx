import { Text, Heading, Button, Section } from '@react-email/components'
import * as React from 'react'
import { BaseLayout } from './layouts/Base'

interface WelcomeEmailProps {
  storeName?: string
  storeLogo?: string
  customerName: string
  loginUrl?: string
  trackingPixelUrl?: string
}

export const WelcomeEmail = ({
  storeName,
  storeLogo,
  customerName,
  loginUrl,
  trackingPixelUrl,
}: WelcomeEmailProps) => {
  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      <Heading style={h1}>Bienvenue {customerName} !</Heading>

      <Text style={text}>
        Nous sommes ravis de vous compter parmi nous. Votre compte a été créé
        avec succès.
      </Text>

      <Text style={text}>
        Vous pouvez désormais profiter de nombreux avantages :
      </Text>

      <ul style={list}>
        <li style={listItem}>Suivi de vos commandes en temps réel</li>
        <li style={listItem}>Historique de vos achats</li>
        <li style={listItem}>Gestion de vos adresses de livraison</li>
        <li style={listItem}>Offres exclusives réservées aux membres</li>
      </ul>

      {loginUrl && (
        <Section style={buttonContainer}>
          <Button href={loginUrl} style={button}>
            Accéder à mon compte
          </Button>
        </Section>
      )}

      <Text style={helpText}>
        Des questions ? N'hésitez pas à nous contacter, nous sommes là pour
        vous aider !
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
