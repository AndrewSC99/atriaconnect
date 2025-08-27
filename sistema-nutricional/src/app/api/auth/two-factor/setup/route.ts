import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { setupTwoFactor } from '@/lib/two-factor'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await setupTwoFactor(session.user.id)

    return NextResponse.json({
      qrCode: result.qrCode,
      backupCodes: result.backupCodes,
      message: 'Setup 2FA completed. Scan the QR code with your authenticator app.'
    })

  } catch (error) {
    console.error('Error setting up 2FA:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}