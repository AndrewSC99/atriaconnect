import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { sendSuspiciousLoginEmail } from './email'

/**
 * Detecta login suspeito baseado em padrões
 */
export async function detectSuspiciousLogin(
  userId: string,
  request: NextRequest
): Promise<boolean> {
  const ipAddress = request.ip || 'unknown'
  const userAgent = request.headers.get('user-agent') || ''
  
  try {
    // Buscar tentativas de login dos últimos 30 dias
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const recentLogins = await prisma.loginAttempt.findMany({
      where: {
        userId,
        success: true,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Se é o primeiro login, não é suspeito
    if (recentLogins.length === 0) {
      return false
    }

    // Verificar padrões suspeitos
    const suspiciousFactors = []

    // 1. IP Address nunca usado
    const knownIPs = new Set(recentLogins.map(login => login.ipAddress))
    if (!knownIPs.has(ipAddress)) {
      suspiciousFactors.push('new_ip')
    }

    // 2. User Agent muito diferente
    const knownUserAgents = recentLogins.map(login => login.userAgent || '')
    const isSimilarUserAgent = knownUserAgents.some(ua => 
      calculateSimilarity(userAgent, ua) > 0.7
    )
    if (!isSimilarUserAgent) {
      suspiciousFactors.push('new_device')
    }

    // 3. Horário atípico (fora dos padrões normais)
    const currentHour = new Date().getHours()
    const usualHours = recentLogins.map(login => login.createdAt.getHours())
    const isUnusualTime = !isWithinUsualHours(currentHour, usualHours)
    if (isUnusualTime) {
      suspiciousFactors.push('unusual_time')
    }

    // 4. Múltiplas tentativas falhadas recentemente
    const recentFailures = await prisma.loginAttempt.count({
      where: {
        userId,
        success: false,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } // 2 horas
      }
    })
    if (recentFailures >= 3) {
      suspiciousFactors.push('recent_failures')
    }

    // Login é suspeito se tem 2 ou mais fatores
    return suspiciousFactors.length >= 2

  } catch (error) {
    console.error('Error detecting suspicious login:', error)
    return false
  }
}

/**
 * Calcula similaridade entre duas strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer, shorter)
  return (longer.length - distance) / longer.length
}

/**
 * Calcula distância de Levenshtein
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null)
  )
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[j][i] = matrix[j - 1][i - 1]
      } else {
        matrix[j][i] = Math.min(
          matrix[j - 1][i - 1] + 1,
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Verifica se horário está dentro dos padrões usuais
 */
function isWithinUsualHours(currentHour: number, usualHours: number[]): boolean {
  if (usualHours.length === 0) return true
  
  // Encontrar horários mais comuns (dentro de +/- 3 horas)
  const hourCounts: { [hour: number]: number } = {}
  
  usualHours.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  // Verificar se hora atual está próxima dos horários usuais
  for (const hour in hourCounts) {
    const hourNum = parseInt(hour)
    if (Math.abs(currentHour - hourNum) <= 3) {
      return true
    }
  }
  
  return false
}

/**
 * Registra tentativa de login
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  request: NextRequest,
  failureReason?: string,
  userId?: string
): Promise<void> {
  try {
    await prisma.loginAttempt.create({
      data: {
        userId,
        email: email.toLowerCase(),
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent'),
        success,
        failureReason,
        attempt: 'PASSWORD'
      }
    })
  } catch (error) {
    console.error('Error logging login attempt:', error)
  }
}

/**
 * Verifica se conta está bloqueada
 */
export async function isAccountLocked(email: string): Promise<{
  isLocked: boolean
  lockUntil?: Date
  failedAttempts: number
}> {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    
    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        email: email.toLowerCase(),
        success: false,
        createdAt: { gte: fifteenMinutesAgo }
      }
    })

    // Bloquear após 5 tentativas falhadas em 15 minutos
    const isLocked = failedAttempts >= 5
    const lockUntil = isLocked ? new Date(Date.now() + 15 * 60 * 1000) : undefined

    return {
      isLocked,
      lockUntil,
      failedAttempts
    }
  } catch (error) {
    console.error('Error checking account lock:', error)
    return { isLocked: false, failedAttempts: 0 }
  }
}

/**
 * Processa login bem-sucedido
 */
export async function processSuccessfulLogin(
  userId: string,
  email: string,
  request: NextRequest
): Promise<void> {
  try {
    // Registrar tentativa bem-sucedida
    await logLoginAttempt(email, true, request, undefined, userId)

    // Detectar login suspeito
    const isSuspicious = await detectSuspiciousLogin(userId, request)
    
    if (isSuspicious) {
      // Buscar dados do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (user) {
        // Enviar email de alerta
        await sendSuspiciousLoginEmail(user.email, user.name, {
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          timestamp: new Date()
        })

        // Log da ação
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'LOGIN',
            resource: 'User',
            resourceId: userId,
            details: JSON.stringify({ suspicious: true }),
            ipAddress: request.ip || 'unknown',
            userAgent: request.headers.get('user-agent')
          }
        })
      }
    }
  } catch (error) {
    console.error('Error processing successful login:', error)
  }
}

/**
 * Sanitiza entrada do usuário
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove caracteres potencialmente perigosos
    .slice(0, 1000) // Limita tamanho
}

/**
 * Valida headers de segurança
 */
export function validateSecurityHeaders(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')
  const origin = request.headers.get('origin')
  
  // Bloquear requests sem User-Agent (possível bot)
  if (!userAgent || userAgent.length < 10) {
    return false
  }
  
  // Validar origem se presente
  if (origin && !isAllowedOrigin(origin)) {
    return false
  }
  
  return true
}

/**
 * Verifica se origem é permitida
 */
function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    'http://localhost:3000',
    'http://localhost:3013'
  ].filter(Boolean)
  
  return allowedOrigins.includes(origin)
}