import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isTwoFactorEnabled } from '@/lib/two-factor'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isEnabled = await isTwoFactorEnabled(session.user.id)

    return NextResponse.json({
      isEnabled,
      message: isEnabled ? '2FA is enabled' : '2FA is not enabled'
    })

  } catch (error) {
    console.error('Error checking 2FA status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}