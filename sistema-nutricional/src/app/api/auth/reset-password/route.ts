import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePasswordStrength } from '@/lib/crypto'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ 
        error: 'Token and password required' 
      }, { status: 400 })
    }

    // Validar força da senha
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({
        error: 'Password does not meet security requirements',
        feedback: passwordValidation.feedback
      }, { status: 400 })
    }

    // Buscar token válido
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetRecord) {
      return NextResponse.json({ 
        error: 'Invalid or expired token' 
      }, { status: 400 })
    }

    // Verificar se token não expirou
    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordReset.delete({
        where: { id: resetRecord.id }
      })
      
      return NextResponse.json({ 
        error: 'Token has expired' 
      }, { status: 400 })
    }

    // Verificar se token já foi usado
    if (resetRecord.used) {
      return NextResponse.json({ 
        error: 'Token has already been used' 
      }, { status: 400 })
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Atualizar senha do usuário
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword }
    })

    // Marcar token como usado
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true }
    })

    // Invalidar todos os outros tokens do usuário
    await prisma.passwordReset.deleteMany({
      where: {
        userId: resetRecord.userId,
        used: false,
        id: { not: resetRecord.id }
      }
    })

    // Log da ação
    await prisma.auditLog.create({
      data: {
        userId: resetRecord.userId,
        action: 'PASSWORD_RESET_COMPLETE',
        resource: 'User',
        resourceId: resetRecord.userId,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Error in reset password:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}