import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

// Verificar assinatura do webhook do WhatsApp
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !signature.startsWith('sha256=')) {
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')

  const receivedSignature = signature.replace('sha256=', '')
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  )
}

// Verificação do webhook (GET request do WhatsApp)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token'

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado com sucesso')
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// Receber mensagens e atualizações do WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    
    const signature = headersList.get('x-hub-signature-256')
    const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET || 'your_webhook_secret'

    // Verificar assinatura do webhook
    if (!verifyWebhookSignature(body, signature || '', webhookSecret)) {
      console.error('Assinatura do webhook inválida')
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const webhookData = JSON.parse(body)
    
    // Processar mensagens recebidas
    if (webhookData.entry) {
      for (const entry of webhookData.entry) {
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              await processarMensagens(change.value)
            }
          }
        }
      }
    }

    return new NextResponse('OK', { status: 200 })

  } catch (error) {
    console.error('Erro no webhook do WhatsApp:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function processarMensagens(value: any) {
  try {
    // Processar mensagens recebidas
    if (value.messages) {
      for (const message of value.messages) {
        await processarMensagemRecebida(message, value.metadata)
      }
    }

    // Processar status de entrega
    if (value.statuses) {
      for (const status of value.statuses) {
        await processarStatusEntrega(status)
      }
    }

  } catch (error) {
    console.error('Erro ao processar mensagem do WhatsApp:', error)
  }
}

async function processarMensagemRecebida(message: any, metadata: any) {
  console.log('Nova mensagem recebida do WhatsApp:', {
    id: message.id,
    from: message.from,
    timestamp: message.timestamp,
    type: message.type
  })

  try {
    // 1. Encontrar ou criar paciente baseado no número de telefone
    const conversation = await findOrCreateConversation(message.from, metadata.phone_number_id)
    if (!conversation) {
      console.error('Não foi possível criar/encontrar conversa para:', message.from)
      return
    }

    // 2. Extrair e preparar conteúdo da mensagem
    const content = extrairConteudo(message)
    const messageContent = typeof content === 'object' ? JSON.stringify(content) : String(content)

    // 3. Salvar mensagem no banco de dados
    const savedMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: conversation.patientId,
        content: messageContent,
        type: mapWhatsAppTypeToMessageType(message.type),
        createdAt: new Date(parseInt(message.timestamp) * 1000)
      }
    })

    console.log('Mensagem salva no banco:', savedMessage.id)

    // 4. Notificar nutricionista
    await criarNotificacaoNutricionista(conversation.nutritionistId, message.from, messageContent)

    // 5. Emitir evento WebSocket para atualização em tempo real
    // TODO: Integrar com WebSocket service quando disponível
    console.log('Mensagem processada com sucesso')

  } catch (error) {
    console.error('Erro ao processar mensagem recebida:', error)
  }
}

async function processarStatusEntrega(status: any) {
  console.log('Atualização de status:', {
    messageId: status.id,
    recipientId: status.recipient_id,
    status: status.status,
    timestamp: status.timestamp
  })

  try {
    // Encontrar a mensagem pelo ID do WhatsApp (armazenado no content se necessário)
    // Por enquanto, apenas logar os status até implementarmos tracking completo
    console.log(`Status da mensagem ${status.id}: ${status.status}`)
    
    // TODO: Implementar sistema de tracking de status de mensagens
    // Isso requereria adicionar campos extras no modelo Message para armazenar
    // o whatsappMessageId e status de entrega
    
  } catch (error) {
    console.error('Erro ao processar status de entrega:', error)
  }
}

function extrairConteudo(message: any): any {
  switch (message.type) {
    case 'text':
      return { text: message.text.body }
    
    case 'image':
      return { 
        image: {
          id: message.image.id,
          caption: message.image.caption,
          mimeType: message.image.mime_type
        }
      }
    
    case 'document':
      return {
        document: {
          id: message.document.id,
          filename: message.document.filename,
          caption: message.document.caption,
          mimeType: message.document.mime_type
        }
      }
    
    case 'audio':
      return {
        audio: {
          id: message.audio.id,
          mimeType: message.audio.mime_type
        }
      }
    
    case 'video':
      return {
        video: {
          id: message.video.id,
          caption: message.video.caption,
          mimeType: message.video.mime_type
        }
      }
    
    default:
      return { raw: message }
  }
}

// Função para mapear tipos do WhatsApp para tipos do banco
function mapWhatsAppTypeToMessageType(whatsappType: string): string {
  const typeMap: Record<string, string> = {
    'text': 'TEXT',
    'image': 'IMAGE', 
    'document': 'FILE',
    'audio': 'FILE',
    'video': 'FILE',
    'voice': 'FILE'
  }
  
  return typeMap[whatsappType] || 'TEXT'
}

// Função para encontrar ou criar conversa
async function findOrCreateConversation(phoneNumber: string, phoneNumberId: string) {
  try {
    // 1. Tentar encontrar paciente pelo telefone
    let patient = await prisma.patient.findFirst({
      where: {
        phone: phoneNumber
      },
      include: {
        user: true
      }
    })

    // 2. Se não encontrar paciente, criar um novo usuário/paciente
    if (!patient) {
      console.log('Criando novo paciente para número:', phoneNumber)
      
      const newUser = await prisma.user.create({
        data: {
          name: `Paciente WhatsApp ${phoneNumber}`,
          email: `whatsapp_${phoneNumber}@temp.com`,
          password: 'temp_password', // Senha temporária
          role: 'PATIENT'
        }
      })

      patient = await prisma.patient.create({
        data: {
          userId: newUser.id,
          phone: phoneNumber,
          status: 'PENDING' // Status pendente até ser atribuído a um nutricionista
        },
        include: {
          user: true
        }
      })
    }

    // 3. Encontrar ou criar conversa
    let conversation = await prisma.conversation.findFirst({
      where: {
        patientId: patient.id
      }
    })

    if (!conversation) {
      // Encontrar um nutricionista disponível (ou o padrão)
      const nutritionist = await prisma.nutritionist.findFirst({
        orderBy: { createdAt: 'asc' }
      })

      if (!nutritionist) {
        console.error('Nenhum nutricionista encontrado no sistema')
        return null
      }

      conversation = await prisma.conversation.create({
        data: {
          patientId: patient.id,
          nutritionistId: nutritionist.id
        }
      })
    }

    return conversation

  } catch (error) {
    console.error('Erro ao encontrar/criar conversa:', error)
    return null
  }
}

// Função para criar notificação para o nutricionista
async function criarNotificacaoNutricionista(nutritionistId: string, phoneNumber: string, content: string) {
  try {
    await prisma.notification.create({
      data: {
        userId: nutritionistId,
        title: 'Nova mensagem do WhatsApp',
        message: `Nova mensagem de ${phoneNumber}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
        type: 'INFO',
        priority: 'HIGH'
      }
    })
    
    console.log('Notificação criada para nutricionista:', nutritionistId)
  } catch (error) {
    console.error('Erro ao criar notificação:', error)
  }
}