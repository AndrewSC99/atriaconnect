import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSecureToken } from '@/lib/crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Sempre retorna sucesso (para não revelar se o email existe)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a reset link has been sent.'
      })
    }

    // Verificar rate limiting - max 3 tentativas por hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentResets = await prisma.passwordReset.count({
      where: {
        userId: user.id,
        createdAt: { gte: oneHourAgo }
      }
    })

    if (recentResets >= 3) {
      return NextResponse.json({
        error: 'Too many reset attempts. Try again later.'
      }, { status: 429 })
    }

    // Gerar token único
    const token = generateSecureToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Salvar token no banco
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        used: false
      }
    })

    // Enviar email
    try {
      await sendPasswordResetEmail(user.email, token, user.name)
    } catch (emailError) {
      console.error('Error sending reset email:', emailError)
      // Não revelar erro de email para o usuário
    }

    // Log da ação
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUEST',
        resource: 'User',
        resourceId: user.id,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: 'If the email exists, a reset link has been sent.'
    })

  } catch (error) {
    console.error('Error in forgot password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}