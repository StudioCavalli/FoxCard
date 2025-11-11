import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Hr,
  Link,
} from '@react-email/components'
import * as React from 'react'

interface BaseLayoutProps {
  children: React.ReactNode
  storeName?: string
  storeLogo?: string
  trackingPixelUrl?: string
}

export const BaseLayout = ({
  children,
  storeName = 'FoxCard',
  storeLogo,
  trackingPixelUrl,
}: BaseLayoutProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            {storeLogo ? (
              <Img
                src={storeLogo}
                alt={storeName}
                width="150"
                height="auto"
                style={logo}
              />
            ) : (
              <Text style={headerText}>{storeName}</Text>
            )}
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Vous recevez cet email car vous avez créé un compte ou passé une
              commande sur {storeName}.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://foxcard.com'}`} style={link}>
                Visiter le site
              </Link>
              {' | '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://foxcard.com'}/account`} style={link}>
                Mon compte
              </Link>
              {' | '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'https://foxcard.com'}/contact`} style={link}>
                Contact
              </Link>
            </Text>
            <Text style={footerCopyright}>
              © {new Date().getFullYear()} {storeName}. Tous droits réservés.
            </Text>
          </Section>

          {/* Tracking Pixel */}
          {trackingPixelUrl && (
            <Img
              src={trackingPixelUrl}
              alt=""
              width="1"
              height="1"
              style={{ display: 'block' }}
            />
          )}
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const headerText = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0',
}

const content = {
  padding: '0 24px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  padding: '0 24px',
}

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0',
}

const footerLinks = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const footerCopyright = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const link = {
  color: '#5469d4',
  textDecoration: 'underline',
}
