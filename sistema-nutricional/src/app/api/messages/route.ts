import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const conversationId = searchParams.get('conversationId')
    const limit = parseInt(searchParams.get('limit') || '50')

    let where: any = {}

    if (conversationId) {
      where.conversationId = conversationId
    } else {
      // Buscar conversações do usuário
      if (session.user.role === 'PATIENT') {
        where.conversation = {
          patientId: session.user.patientId
        }
      } else if (session.user.role === 'NUTRITIONIST') {
        where.conversation = {
          nutritionistId: session.user.id
        }
      }
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        conversation: {
          include: {
            patient: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            nutritionist: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      senderId: message.senderId,
      senderName: message.sender.name,
      senderType: message.sender.role.toLowerCase(),
      type: message.type,
      read: message.read,
      conversationId: message.conversationId,
      conversation: {
        patient: message.conversation.patient ? {
          id: message.conversation.patient.id,
          name: message.conversation.patient.user.name
        } : null,
        nutritionist: {
          id: message.conversation.nutritionist.id,
          name: message.conversation.nutritionist.user.name
        }
      }
    }))

    return NextResponse.json(formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, conversationId, recipientId, type = 'TEXT' } = body

    // Validação básica
    if (!content) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    let targetConversationId = conversationId

    // Se não há conversationId, criar ou encontrar uma conversa
    if (!targetConversationId) {
      if (!recipientId) {
        return NextResponse.json({ error: 'Conversation ID or recipient ID required' }, { status: 400 })
      }

      // Buscar ou criar conversa
      let conversation
      
      if (session.user.role === 'PATIENT') {
        // Paciente enviando para nutricionista
        conversation = await prisma.conversation.findFirst({
          where: {
            patientId: session.user.patientId,
            nutritionistId: recipientId
          }
        })

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              patientId: session.user.patientId,
              nutritionistId: recipientId
            }
          })
        }
      } else if (session.user.role === 'NUTRITIONIST') {
        // Nutricionista enviando para paciente
        const patient = await prisma.patient.findFirst({
          where: {
            userId: recipientId,
            nutritionistId: session.user.id
          }
        })

        if (!patient) {
          return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        conversation = await prisma.conversation.findFirst({
          where: {
            patientId: patient.id,
            nutritionistId: session.user.id
          }
        })

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              patientId: patient.id,
              nutritionistId: session.user.id
            }
          })
        }
      }

      targetConversationId = conversation!.id
    }

    // Verificar se o usuário tem permissão para enviar mensagem nesta conversa
    const conversation = await prisma.conversation.findUnique({
      where: { id: targetConversationId },
      include: {
        patient: true
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const hasPermission = 
      (session.user.role === 'PATIENT' && conversation.patientId === session.user.patientId) ||
      (session.user.role === 'NUTRITIONIST' && conversation.nutritionistId === session.user.id)

    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Criar mensagem
    const message = await prisma.message.create({
      data: {
        content,
        type,
        senderId: session.user.id,
        conversationId: targetConversationId,
        read: false
      },
      include: {
        sender: {
          select: {
            name: true,
            role: true
          }
        }
      }
    })

    // Atualizar última atividade da conversa
    await prisma.conversation.update({
      where: { id: targetConversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessage: content.substring(0, 100)
      }
    })

    return NextResponse.json({
      id: message.id,
      content: message.content,
      timestamp: message.createdAt.toISOString(),
      senderName: message.sender.name,
      conversationId: message.conversationId,
      message: 'Message sent successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Marcar mensagens como lidas
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageIds, conversationId } = body

    if (!messageIds && !conversationId) {
      return NextResponse.json({ error: 'Message IDs or conversation ID required' }, { status: 400 })
    }

    let where: any = {}

    if (messageIds) {
      where.id = { in: messageIds }
    } else if (conversationId) {
      where.conversationId = conversationId
    }

    // Adicionar filtro para não marcar mensagens próprias como lidas
    where.senderId = { not: session.user.id }

    // Verificar permissões baseadas na conversa
    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      })

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }

      const hasPermission = 
        (session.user.role === 'PATIENT' && conversation.patientId === session.user.patientId) ||
        (session.user.role === 'NUTRITIONIST' && conversation.nutritionistId === session.user.id)

      if (!hasPermission) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const updatedMessages = await prisma.message.updateMany({
      where,
      data: { read: true }
    })

    return NextResponse.json({
      updatedCount: updatedMessages.count,
      message: 'Messages marked as read'
    })

  } catch (error) {
    console.error('Error updating messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}