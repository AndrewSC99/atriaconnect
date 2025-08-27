import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { encrypt, decrypt, generateBackupCodes, hashBackupCode } from './crypto'
import { prisma } from './prisma'

/**
 * Gera secret para 2FA
 */
export function generateTwoFactorSecret(userEmail: string): {
  secret: string
  qrCodeUrl: string
} {
  const secret = speakeasy.generateSecret({
    name: `Sistema Nutricional (${userEmail})`,
    issuer: 'Sistema Nutricional',
    length: 32
  })

  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url || ''
  }
}

/**
 * Gera QR Code para configuração do 2FA
 */
export async function generateQRCode(qrCodeUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(qrCodeUrl)
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

/**
 * Verifica token 2FA
 */
export function verifyTwoFactorToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Permite tokens de até 1 minuto antes/depois
  })
}

/**
 * Configura 2FA para usuário
 */
export async function setupTwoFactor(userId: string): Promise<{
  secret: string
  qrCode: string
  backupCodes: string[]
}> {
  try {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Gerar secret e QR code
    const { secret, qrCodeUrl } = generateTwoFactorSecret(user.email)
    const qrCode = await generateQRCode(qrCodeUrl)

    // Gerar códigos de backup
    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => hashBackupCode(code))
    )

    // Criptografar secret
    const encryptedSecret = encrypt(secret)

    // Salvar no banco (ainda não habilitado)
    await prisma.twoFactorAuth.upsert({
      where: { userId },
      create: {
        userId,
        secret: encryptedSecret,
        backupCodes: JSON.stringify(hashedBackupCodes),
        isEnabled: false
      },
      update: {
        secret: encryptedSecret,
        backupCodes: JSON.stringify(hashedBackupCodes),
        isEnabled: false
      }
    })

    return {
      secret,
      qrCode,
      backupCodes
    }
  } catch (error) {
    console.error('Error setting up 2FA:', error)
    throw new Error('Failed to setup 2FA')
  }
}

/**
 * Habilita 2FA após verificação
 */
export async function enableTwoFactor(userId: string, token: string): Promise<boolean> {
  try {
    // Buscar configuração 2FA
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId }
    })

    if (!twoFactorAuth) {
      throw new Error('2FA not configured')
    }

    // Descriptografar secret
    const secret = decrypt(twoFactorAuth.secret)

    // Verificar token
    const isValid = verifyTwoFactorToken(token, secret)

    if (isValid) {
      // Habilitar 2FA
      await prisma.twoFactorAuth.update({
        where: { userId },
        data: { isEnabled: true }
      })

      return true
    }

    return false
  } catch (error) {
    console.error('Error enabling 2FA:', error)
    throw new Error('Failed to enable 2FA')
  }
}

/**
 * Desabilita 2FA
 */
export async function disableTwoFactor(userId: string): Promise<void> {
  try {
    await prisma.twoFactorAuth.delete({
      where: { userId }
    })
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    throw new Error('Failed to disable 2FA')
  }
}

/**
 * Verifica se usuário tem 2FA habilitado
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  try {
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId }
    })

    return twoFactorAuth?.isEnabled || false
  } catch (error) {
    console.error('Error checking 2FA status:', error)
    return false
  }
}

/**
 * Verifica token ou código de backup para login
 */
export async function verifyTwoFactorForLogin(
  userId: string, 
  token: string, 
  isBackupCode: boolean = false
): Promise<boolean> {
  try {
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId }
    })

    if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
      return false
    }

    if (isBackupCode) {
      // Verificar código de backup
      const backupCodes = JSON.parse(twoFactorAuth.backupCodes) as string[]
      
      for (let i = 0; i < backupCodes.length; i++) {
        const isValid = await verifyBackupCode(token, backupCodes[i])
        
        if (isValid) {
          // Remover código usado
          backupCodes.splice(i, 1)
          
          await prisma.twoFactorAuth.update({
            where: { userId },
            data: {
              backupCodes: JSON.stringify(backupCodes)
            }
          })
          
          return true
        }
      }
      
      return false
    } else {
      // Verificar token TOTP
      const secret = decrypt(twoFactorAuth.secret)
      return verifyTwoFactorToken(token, secret)
    }
  } catch (error) {
    console.error('Error verifying 2FA for login:', error)
    return false
  }
}

/**
 * Gera novos códigos de backup
 */
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  try {
    const backupCodes = generateBackupCodes()
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => hashBackupCode(code))
    )

    await prisma.twoFactorAuth.update({
      where: { userId },
      data: {
        backupCodes: JSON.stringify(hashedBackupCodes)
      }
    })

    return backupCodes
  } catch (error) {
    console.error('Error regenerating backup codes:', error)
    throw new Error('Failed to regenerate backup codes')
  }
}