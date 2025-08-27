import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { disableTwoFactor } from '@/lib/two-factor'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await disableTwoFactor(session.user.id)

    // Log da ação
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'TWO_FACTOR_DISABLE',
        resource: 'TwoFactorAuth',
        resourceId: session.user.id,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: '2FA disabled successfully'
    })

  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}