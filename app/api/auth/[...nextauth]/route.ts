import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getClientInfo(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || undefined
  const userAgent = req.headers.get('user-agent') || undefined
  return { ip, userAgent }
}

const nextAuthHandler = NextAuth({
  ...authOptions,
  events: {
    ...authOptions.events,
  },
})

async function handler(req: Request) {
  const { ip, userAgent } = getClientInfo(req)
  const url = new URL(req.url)

  // For POST requests to credentials callback, we intercept to log login events
  if (req.method === 'POST' && url.pathname.includes('callback/credentials')) {
    // Clone the request to read body without consuming it
    const clonedReq = req.clone()

    const response = await nextAuthHandler(req)

    // Check if login succeeded or failed by inspecting the response
    const location = response.headers.get('location') || ''
    const isError = location.includes('error=')

    try {
      const formData = await clonedReq.formData().catch(() => null)
      const email = formData?.get('email') as string | null

      if (isError) {
        // Failed login
        const errorMatch = location.match(/error=([^&]+)/)
        const errorMsg = errorMatch ? decodeURIComponent(errorMatch[1]) : 'Unknown error'

        let userId: string | undefined
        if (email) {
          const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          })
          userId = user?.id
        }

        await prisma.platformAuditLog.create({
          data: {
            userId: userId || undefined,
            action: 'LOGIN_FAILED',
            entity: 'Session',
            ipAddress: ip,
            userAgent,
            metadata: { email: email || 'unknown', reason: errorMsg },
            success: false,
            errorMessage: errorMsg,
          },
        }).catch(() => {})
      } else {
        // Successful login — find user by email to log
        if (email) {
          const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          })
          if (user) {
            await prisma.platformAuditLog.create({
              data: {
                userId: user.id,
                action: 'LOGIN',
                entity: 'Session',
                ipAddress: ip,
                userAgent,
                metadata: { email },
                success: true,
              },
            }).catch(() => {})
          }
        }
      }
    } catch {
      // Never let logging break auth
    }

    return response
  }

  // For signout POST requests
  if (req.method === 'POST' && url.pathname.includes('signout')) {
    const { getServerSession } = await import('next-auth/next')
    const session = await getServerSession(authOptions)

    const response = await nextAuthHandler(req)

    if (session?.user?.id) {
      await prisma.platformAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'LOGOUT',
          entity: 'Session',
          ipAddress: ip,
          userAgent,
          metadata: { email: session.user.email },
          success: true,
        },
      }).catch(() => {})
    }

    return response
  }

  // All other auth requests pass through normally
  return nextAuthHandler(req)
}

export { handler as GET, handler as POST }
