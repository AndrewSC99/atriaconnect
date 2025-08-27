import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { WhatsAppService } from '@/lib/communication/whatsapp-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Retornar configuração atual (sem dados sensíveis)
    const config = {
      hasToken: !!process.env.WHATSAPP_ACCESS_TOKEN,
      hasPhoneNumberId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
      hasBusinessAccountId: !!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      hasWebhookToken: !!process.env.WHATSAPP_VERIFY_TOKEN,
      hasWebhookSecret: !!process.env.WHATSAPP_WEBHOOK_SECRET,
      webhookUrl: `${process.env.NEXTAUTH_URL}/api/webhook/whatsapp`
    }

    return NextResponse.json({ config })

  } catch (error) {
    console.error('Erro ao obter configuração WhatsApp:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'NUTRITIONIST') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, ...data } = await request.json()

    switch (action) {
      case 'test_connection':
        return await testConnection()
        
      case 'send_test_message':
        return await sendTestMessage(data.to, data.message)
        
      case 'get_business_profile':
        return await getBusinessProfile()
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro na API do WhatsApp:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function testConnection() {
  try {
    if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuração incompleta. Verifique as variáveis de ambiente.' 
      })
    }

    const config = {
      ativo: true,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      apiVersion: 'v17.0',
      webhookVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
      webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET || '',
      rateLimitPerSecond: 20,
      timeoutMs: 30000
    }

    const whatsappService = new WhatsAppService(config)
    const result = await whatsappService.obterPerfilBusiness()

    if (result.sucesso) {
      return NextResponse.json({ 
        success: true, 
        message: 'Conexão com WhatsApp estabelecida com sucesso',
        profile: result.perfil
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.erro || 'Erro ao conectar com WhatsApp'
      })
    }

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}

async function sendTestMessage(to: string, message: string) {
  try {
    if (!to || !message) {
      return NextResponse.json({ 
        success: false, 
        error: 'Número de telefone e mensagem são obrigatórios'
      })
    }

    const config = {
      ativo: true,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      apiVersion: 'v17.0',
      webhookVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
      webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET || '',
      rateLimitPerSecond: 20,
      timeoutMs: 30000
    }

    const whatsappService = new WhatsAppService(config)
    const result = await whatsappService.enviarMensagemTexto({
      id: `test_${Date.now()}`,
      tipo: 'whatsapp',
      destinatario: {
        pacienteId: 'test',
        nome: 'Teste',
        whatsapp: to,
        canalPreferido: 'whatsapp'
      },
      conteudo: {
        corpo: message
      },
      configuracao: {
        prioridade: 'media',
        trackingEnabled: true
      }
    })

    if (result.sucesso) {
      return NextResponse.json({ 
        success: true, 
        message: 'Mensagem de teste enviada com sucesso',
        messageId: result.providerId
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.erro || 'Erro ao enviar mensagem'
      })
    }

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao enviar mensagem'
    })
  }
}

async function getBusinessProfile() {
  try {
    const config = {
      ativo: true,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      apiVersion: 'v17.0',
      webhookVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
      webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET || '',
      rateLimitPerSecond: 20,
      timeoutMs: 30000
    }

    const whatsappService = new WhatsAppService(config)
    const result = await whatsappService.obterPerfilBusiness()

    if (result.sucesso) {
      return NextResponse.json({ 
        success: true, 
        profile: result.perfil
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.erro || 'Erro ao obter perfil'
      })
    }

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao obter perfil'
    })
  }
}