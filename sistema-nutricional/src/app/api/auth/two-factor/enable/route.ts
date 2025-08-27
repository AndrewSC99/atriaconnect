import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { enableTwoFactor } from '@/lib/two-factor'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const isValid = await enableTwoFactor(session.user.id, token)

    if (isValid) {
      // Log da ação
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'TWO_FACTOR_ENABLE',
          resource: 'TwoFactorAuth',
          resourceId: session.user.id,
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || undefined
        }
      })

      return NextResponse.json({
        success: true,
        message: '2FA enabled successfully'
      })
    } else {
      return NextResponse.json({ 
        error: 'Invalid token' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error enabling 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}