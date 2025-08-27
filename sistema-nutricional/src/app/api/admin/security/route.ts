import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { detectSuspiciousPatterns, generateUserActivityReport } from '@/lib/audit'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    switch (action) {
      case 'suspicious-patterns':
        const hours = parseInt(searchParams.get('hours') || '24')
        const userId = searchParams.get('userId') || undefined
        
        const patterns = await detectSuspiciousPatterns(userId, hours)
        return NextResponse.json(patterns)

      case 'user-activity':
        const targetUserId = searchParams.get('userId')
        const days = parseInt(searchParams.get('days') || '30')
        
        if (!targetUserId) {
          return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }
        
        const activity = await generateUserActivityReport(targetUserId, days)
        return NextResponse.json(activity)

      case 'security-overview':
        // Visão geral de segurança
        const now = new Date()
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const [
          totalUsers,
          usersWith2FA,
          loginAttempts24h,
          failedLogins24h,
          suspiciousActivity,
          recentPasswordResets,
          lockedAccounts
        ] = await Promise.all([
          prisma.user.count(),
          prisma.twoFactorAuth.count({ where: { isEnabled: true } }),
          prisma.loginAttempt.count({ where: { createdAt: { gte: last24h } } }),
          prisma.loginAttempt.count({ 
            where: { 
              createdAt: { gte: last24h },
              success: false 
            } 
          }),
          detectSuspiciousPatterns(undefined, 24),
          prisma.passwordReset.count({ 
            where: { 
              createdAt: { gte: last7d } 
            } 
          }),
          prisma.loginAttempt.groupBy({
            by: ['email'],
            where: {
              createdAt: { gte: new Date(now.getTime() - 15 * 60 * 1000) },
              success: false
            },
            having: {
              email: {
                _count: {
                  gte: 5
                }
              }
            }
          })
        ])

        return NextResponse.json({
          overview: {
            totalUsers,
            usersWith2FA,
            twoFactorAdoption: totalUsers > 0 ? (usersWith2FA / totalUsers * 100).toFixed(1) : 0,
            loginAttempts24h,
            failedLogins24h,
            failureRate: loginAttempts24h > 0 ? (failedLogins24h / loginAttempts24h * 100).toFixed(1) : 0,
            recentPasswordResets,
            lockedAccountsCount: lockedAccounts.length
          },
          security: {
            suspiciousActivities: suspiciousActivity.suspiciousActivities,
            lockedAccounts: lockedAccounts.map(account => account.email)
          }
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in security API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}