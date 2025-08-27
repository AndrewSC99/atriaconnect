import { NextRequest } from 'next/server'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// Store em memória (em produção, usar Redis)
const store: RateLimitStore = {}

export interface RateLimitConfig {
  windowMs: number // Janela de tempo em millisegundos
  maxRequests: number // Máximo de requests na janela
  skipSuccessfulRequests?: boolean // Ignorar requests bem-sucedidos
}

/**
 * Rate limiter baseado em IP
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest, identifier?: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    resetTime: number
  }> => {
    const key = identifier || getClientIdentifier(request)
    const now = Date.now()
    
    // Limpar entradas expiradas
    if (store[key] && store[key].resetTime <= now) {
      delete store[key]
    }

    // Inicializar se não existe
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + config.windowMs
      }
    }

    const current = store[key]
    
    // Verificar se excedeu o limite
    if (current.count >= config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: current.resetTime
      }
    }

    // Incrementar contador
    current.count++

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - current.count,
      resetTime: current.resetTime
    }
  }
}

/**
 * Obter identificador do cliente (IP + User Agent)
 */
function getClientIdentifier(request: NextRequest): string {
  const ip = request.ip || 
             request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}:${userAgent.slice(0, 50)}` // Limitar tamanho
}

/**
 * Rate limiters pré-configurados
 */

// Login: 5 tentativas por 15 minutos
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 5
})

// Registro: 3 tentativas por hora
export const registerRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 3
})

// Reset de senha: 3 tentativas por hora
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  maxRequests: 3
})

// 2FA: 10 tentativas por 5 minutos
export const twoFactorRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutos
  maxRequests: 10
})

// API geral: 100 requests por minuto
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 100
})

/**
 * Middleware helper para aplicar rate limiting
 */
export async function applyRateLimit(
  request: NextRequest,
  rateLimiter: ReturnType<typeof createRateLimiter>,
  identifier?: string
) {
  const result = await rateLimiter(request, identifier)
  
  if (!result.success) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
    
    throw new Error(JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter,
      limit: result.limit
    }))
  }
  
  return result
}

/**
 * Limpar store (útil para testes)
 */
export function clearRateLimitStore(): void {
  Object.keys(store).forEach(key => delete store[key])
}