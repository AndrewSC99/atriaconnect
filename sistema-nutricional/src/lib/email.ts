// Configuração do transporter de email
let transporter: any = null

async function getTransporter() {
  if (!transporter && typeof window === 'undefined') {
    try {
      const nodemailer = require('nodemailer')
      transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true para 465, false para outras portas
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
    } catch (error) {
      console.error('Error loading nodemailer:', error)
      return null
    }
  }
  return transporter
}

/**
 * Envia email de recuperação de senha
 */
export async function sendPasswordResetEmail(
  email: string, 
  resetToken: string, 
  userName: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@sistemanutricional.com',
    to: email,
    subject: 'Recuperação de Senha - Sistema Nutricional',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recuperação de Senha</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { 
              display: inline-block; 
              background: #1e40af; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Sistema Nutricional</h1>
            </div>
            <div class="content">
              <h2>Recuperação de Senha</h2>
              <p>Olá <strong>${userName}</strong>,</p>
              <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
              <p>Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Redefinir Senha</a>
              </div>
              <p><strong>Este link expira em 1 hora.</strong></p>
              <p>Se você não solicitou a redefinição da senha, ignore este email. Sua senha atual permanecerá inalterada.</p>
              <p>Por questões de segurança, não compartilhe este link com ninguém.</p>
            </div>
            <div class="footer">
              <p>Este é um email automático. Por favor, não responda.</p>
              <p>&copy; 2024 Sistema Nutricional. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  try {
    const emailTransporter = await getTransporter()
    if (!emailTransporter) {
      throw new Error('Email service not available')
    }
    
    await emailTransporter.sendMail(mailOptions)
    console.log('Password reset email sent successfully to:', email)
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

/**
 * Envia email de notificação de login suspeito
 */
export async function sendSuspiciousLoginEmail(
  email: string,
  userName: string,
  loginDetails: {
    ipAddress: string
    userAgent: string
    timestamp: Date
    location?: string
  }
): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@sistemanutricional.com',
    to: email,
    subject: 'Alerta de Segurança - Sistema Nutricional',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Alerta de Segurança</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .alert { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alerta de Segurança</h1>
            </div>
            <div class="content">
              <h2>Login Detectado</h2>
              <p>Olá <strong>${userName}</strong>,</p>
              <p>Detectamos um login na sua conta do Sistema Nutricional.</p>
              
              <div class="alert">
                <h3>Detalhes do Login:</h3>
                <ul>
                  <li><strong>Data/Hora:</strong> ${loginDetails.timestamp.toLocaleString('pt-BR')}</li>
                  <li><strong>Endereço IP:</strong> ${loginDetails.ipAddress}</li>
                  <li><strong>Dispositivo:</strong> ${loginDetails.userAgent}</li>
                  ${loginDetails.location ? `<li><strong>Localização:</strong> ${loginDetails.location}</li>` : ''}
                </ul>
              </div>
              
              <p><strong>Se foi você:</strong> Pode ignorar este email.</p>
              <p><strong>Se não foi você:</strong> Recomendamos que mude sua senha imediatamente e habilite a autenticação de dois fatores.</p>
              
              <p>Para sua segurança, monitore regularmente a atividade da sua conta.</p>
            </div>
            <div class="footer">
              <p>Este é um email automático. Por favor, não responda.</p>
              <p>&copy; 2024 Sistema Nutricional. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  try {
    const emailTransporter = await getTransporter()
    if (!emailTransporter) {
      throw new Error('Email service not available')
    }
    
    await emailTransporter.sendMail(mailOptions)
    console.log('Suspicious login email sent successfully to:', email)
  } catch (error) {
    console.error('Error sending suspicious login email:', error)
    throw new Error('Failed to send suspicious login email')
  }
}

/**
 * Testa configuração de email
 */
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const emailTransporter = await getTransporter()
    if (!emailTransporter) {
      return false
    }
    
    await emailTransporter.verify()
    return true
  } catch (error) {
    console.error('Email configuration error:', error)
    return false
  }
}