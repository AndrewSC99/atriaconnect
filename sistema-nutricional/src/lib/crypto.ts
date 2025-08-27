import { randomBytes, createCipher, createDecipher } from 'crypto'
import bcrypt from 'bcryptjs'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'fallback-key-for-development-only'

/**
 * Criptografa uma string usando AES
 */
export function encrypt(text: string): string {
  try {
    const cipher = createCipher('aes-256-cbc', ENCRYPTION_KEY)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Descriptografa uma string usando AES
 */
export function decrypt(encryptedText: string): string {
  try {
    const decipher = createDecipher('aes-256-cbc', ENCRYPTION_KEY)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Gera códigos de backup aleatórios para 2FA
 */
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    // Gera código de 8 caracteres alfanuméricos
    const code = randomBytes(4).toString('hex').toUpperCase()
    codes.push(code)
  }
  
  return codes
}

/**
 * Hash para códigos de backup
 */
export async function hashBackupCode(code: string): Promise<string> {
  return bcrypt.hash(code, 12)
}

/**
 * Verifica código de backup
 */
export async function verifyBackupCode(code: string, hashedCode: string): Promise<boolean> {
  return bcrypt.compare(code, hashedCode)
}

/**
 * Gera token seguro para reset de senha
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Gera salt aleatório
 */
export function generateSalt(): string {
  return randomBytes(16).toString('hex')
}

/**
 * Valida força da senha
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  // Verificações de força
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Senha deve ter pelo menos 8 caracteres')
  }

  if (password.length >= 12) {
    score += 1
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Senha deve conter pelo menos uma letra minúscula')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Senha deve conter pelo menos uma letra maiúscula')
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Senha deve conter pelo menos um número')
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Senha deve conter pelo menos um caractere especial')
  }

  // Verificar padrões comuns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i
  ]

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password))
  if (hasCommonPattern) {
    score -= 2
    feedback.push('Senha contém padrões muito comuns')
  }

  return {
    isValid: score >= 4 && !hasCommonPattern,
    score: Math.max(0, Math.min(6, score)),
    feedback
  }
}