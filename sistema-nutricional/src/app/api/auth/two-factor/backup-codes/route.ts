import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { regenerateBackupCodes } from '@/lib/two-factor'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const newBackupCodes = await regenerateBackupCodes(session.user.id)

    // Log da ação
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'TwoFactorAuth',
        resourceId: session.user.id,
        details: JSON.stringify({ action: 'regenerate_backup_codes' }),
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    return NextResponse.json({
      backupCodes: newBackupCodes,
      message: 'New backup codes generated successfully'
    })

  } catch (error) {
    console.error('Error regenerating backup codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}