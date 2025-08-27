import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { loginRateLimiter } from '@/lib/rate-limiter'
import { isAccountLocked, logLoginAttempt, processSuccessfulLogin, validateSecurityHeaders } from '@/lib/security'
import { isTwoFactorEnabled } from '@/lib/two-factor'
import { createAuditLog } from '@/lib/audit'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'

export async function POST(request: NextRequest) {
  try {
    // Validar headers de segurança
    if (!validateSecurityHeaders(request)) {
      return NextResponse.json({ 
        error: 'Invalid request headers' 
      }, { status: 400 })
    }

    // Rate limiting
    try {
      await loginRateLimiter(request)
    } catch (error) {
      const errorData = JSON.parse((error as Error).message)
      return NextResponse.json(errorData, { 
        status: 429,
        headers: {
          'Retry-After': errorData.retryAfter.toString()
        }
      })
    }

    const body = await request.json()
    const { email, password, twoFactorToken, isBackupCode = false } = body

    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password required' 
      }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verificar se conta está bloqueada
    const lockStatus = await isAccountLocked(normalizedEmail)
    if (lockStatus.isLocked) {
      await logLoginAttempt(normalizedEmail, false, request, 'account_locked')
      
      return NextResponse.json({ 
        error: 'Account temporarily locked due to too many failed attempts',
        lockedUntil: lockStatus.lockUntil
      }, { status: 423 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        patient: true,
        nutritionist: true,
        twoFactorAuth: true
      }
    })

    if (!user || !user.password) {
      await logLoginAttempt(normalizedEmail, false, request, 'invalid_credentials')
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      await logLoginAttempt(normalizedEmail, false, request, 'invalid_password', user.id)
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }

    // Verificar 2FA se habilitado
    const requires2FA = await isTwoFactorEnabled(user.id)
    
    if (requires2FA) {
      if (!twoFactorToken) {
        // Primeira etapa do login - senha válida, precisa do 2FA
        const tempToken = jwt.sign(
          { userId: user.id, step: 'awaiting_2fa' },
          JWT_SECRET,
          { expiresIn: '5m' }
        )

        return NextResponse.json({
          requires2FA: true,
          tempToken,
          message: 'Please provide your 2FA token'
        })
      } else {
        // Verificar token 2FA
        const { verifyTwoFactorForLogin } = await import('@/lib/two-factor')
        const isValid2FA = await verifyTwoFactorForLogin(user.id, twoFactorToken, isBackupCode)
        
        if (!isValid2FA) {
          await logLoginAttempt(normalizedEmail, false, request, 'invalid_2fa', user.id)
          return NextResponse.json({ 
            error: 'Invalid 2FA token' 
          }, { status: 401 })
        }
      }
    }

    // Login bem-sucedido
    await processSuccessfulLogin(user.id, normalizedEmail, request)

    // Gerar token JWT de sessão
    const sessionToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        patientId: user.patient?.id,
        nutritionistId: user.nutritionist?.id
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Log de auditoria
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      resource: 'User',
      resourceId: user.id,
      details: { method: requires2FA ? '2fa' : 'password' }
    }, request)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        patientId: user.patient?.id,
        nutritionistId: user.nutritionist?.id
      },
      token: sessionToken
    })

  } catch (error) {
    console.error('Error in login:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}