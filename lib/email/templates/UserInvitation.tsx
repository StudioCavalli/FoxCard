import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components'

interface UserInvitationProps {
  inviterName: string
  inviterEmail: string
  storeName: string
  roleName: string
  invitationUrl: string
  expiresInDays?: number
}

export default function UserInvitation({
  inviterName = 'John Doe',
  inviterEmail = 'john@example.com',
  storeName = 'Ma Boutique',
  roleName = 'Manager',
  invitationUrl = 'https://foxcard.com/accept-invitation?token=xxx',
  expiresInDays = 7,
}: UserInvitationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} vous invite à rejoindre {storeName} sur FoxCard
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Invitation à rejoindre {storeName}</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={paragraph}>
              <strong>{inviterName}</strong> ({inviterEmail}) vous invite à rejoindre{' '}
              <strong>{storeName}</strong> en tant que <strong>{roleName}</strong>.
            </Text>

            <Text style={paragraph}>
              En acceptant cette invitation, vous pourrez collaborer sur ce magasin et
              accéder aux fonctionnalités selon votre rôle.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={invitationUrl}>
                Accepter l'invitation
              </Button>
            </Section>

            <Text style={paragraph}>
              Ou copiez et collez ce lien dans votre navigateur :
            </Text>
            <Text style={link}>
              <Link href={invitationUrl}>{invitationUrl}</Link>
            </Text>

            <Text style={warningText}>
              ⚠️ Cette invitation expire dans {expiresInDays} jours.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email en toute
              sécurité.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} FoxCard. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 40px',
  borderBottom: '1px solid #e6ebf1',
}

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  margin: '0',
}

const content = {
  padding: '32px 40px',
}

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.625',
  margin: '16px 0',
}

const buttonContainer = {
  padding: '24px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const link = {
  color: '#3b82f6',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
}

const warningText = {
  color: '#f59e0b',
  fontSize: '14px',
  fontWeight: '500',
  marginTop: '24px',
  padding: '12px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
}

const footer = {
  padding: '32px 40px',
  borderTop: '1px solid #e6ebf1',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
}
