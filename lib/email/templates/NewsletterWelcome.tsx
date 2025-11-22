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

export interface NewsletterWelcomeProps extends BaseLayoutProps {
  firstName?: string
}

export const NewsletterWelcome = ({
  storeName = 'GoldenEra',
  storeLogo,
  firstName = 'Cher abonné',
  trackingPixelUrl,
}: NewsletterWelcomeProps) => {
  return (
    <BaseLayout
      storeName={storeName}
      storeLogo={storeLogo}
      trackingPixelUrl={trackingPixelUrl}
    >
      <Text style={heading}>Bienvenue dans notre newsletter ! 🎉</Text>

      <Text style={paragraph}>Bonjour {firstName},</Text>

      <Text style={paragraph}>
        Merci d'avoir confirmé votre inscription ! Nous sommes ravis de vous compter
        parmi nos abonnés.
      </Text>

      <Text style={paragraph}>
        Vous recevrez désormais nos dernières actualités, offres exclusives et contenus
        spéciaux directement dans votre boîte mail.
      </Text>

      <Section style={highlightBox}>
        <Text style={highlightText}>
          <strong>💡 Astuce :</strong> Pour ne manquer aucun de nos emails, ajoutez-nous
          à votre liste de contacts !
        </Text>
      </Section>

      <Text style={paragraph}>
        Merci de votre confiance,
        <br />
        L'équipe {storeName}
      </Text>

      <Hr style={hr} />

      <Text style={footer}>
        Vous recevez cet email car vous venez de confirmer votre inscription à la
        newsletter de {storeName}.
      </Text>
    </BaseLayout>
  )
}

export default NewsletterWelcome

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

const highlightBox = {
  backgroundColor: '#EFF6FF',
  borderLeft: '4px solid #3B82F6',
  padding: '16px',
  margin: '24px 0',
  borderRadius: '4px',
}

const highlightText = {
  fontSize: '14px',
  color: '#1E40AF',
  margin: 0,
  lineHeight: '1.5',
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
