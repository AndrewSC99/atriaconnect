import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            patient: true,
            nutritionist: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          patientId: user.patient?.id,
          nutritionistId: user.nutritionist?.id,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.patientId = user.patientId
        token.nutritionistId = user.nutritionistId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.patientId = token.patientId as string
        session.user.nutritionistId = token.nutritionistId as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Only redirect after successful authentication
      // Don't redirect to login from public pages
      if (url.startsWith('/login') || url.startsWith('/register')) {
        return url
      }
      // If the URL is relative, make it absolute
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      // If the URL is the same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url
      }
      // Otherwise, redirect to base URL
      return baseUrl
    }
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      patientId?: string
      nutritionistId?: string
    }
  }

  interface User {
    role: UserRole
    patientId?: string
    nutritionistId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    patientId?: string
    nutritionistId?: string
  }
}