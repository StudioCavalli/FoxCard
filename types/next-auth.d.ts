import { UserRole, UserStatus } from '@prisma/client'
import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      status?: string
      suspendedReason?: string | null
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
    status?: UserStatus
    suspendedReason?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    status?: string
    suspendedReason?: string | null
  }
}
