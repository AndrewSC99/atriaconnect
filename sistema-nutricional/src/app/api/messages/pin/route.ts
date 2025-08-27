import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, pinned } = await request.json()

    if (!conversationId || typeof pinned !== 'boolean') {
      return NextResponse.json({ 
        error: 'Conversation ID and pinned status are required' 
      }, { status: 400 })
    }

    // Verificar se o usuário tem permissão para modificar esta conversa
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
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

    // Atualizar o status de fixação
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        pinned: pinned,
        pinnedAt: pinned ? new Date() : null,
        pinnedBy: pinned ? session.user.id : null
      }
    })

    return NextResponse.json({
      success: true,
      message: `Conversation ${pinned ? 'pinned' : 'unpinned'} successfully`,
      conversation: {
        id: updatedConversation.id,
        pinned: updatedConversation.pinned,
        pinnedAt: updatedConversation.pinnedAt
      }
    })

  } catch (error) {
    console.error('Error in conversation pin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Listar conversas fixadas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let where: any = {
      pinned: true,
      archived: false // Não mostrar arquivadas na lista de fixadas
    }

    // Filtrar por usuário
    if (session.user.role === 'PATIENT') {
      where.patientId = session.user.patientId
    } else if (session.user.role === 'NUTRITIONIST') {
      where.nutritionistId = session.user.id
    }

    const pinnedConversations = await prisma.conversation.findMany({
      where,
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
          select: {
            id: true,
            name: true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                read: false,
                senderId: { not: session.user.id }
              }
            }
          }
        }
      },
      orderBy: { pinnedAt: 'desc' }
    })

    const formattedConversations = pinnedConversations.map(conversation => ({
      id: conversation.id,
      patient: conversation.patient ? {
        id: conversation.patient.user.id,
        name: conversation.patient.user.name,
        avatar: conversation.patient.user.name?.charAt(0).toUpperCase(),
        status: 'online' // Status padrão
      } : null,
      nutritionist: {
        id: conversation.nutritionist.id,
        name: conversation.nutritionist.name,
        avatar: conversation.nutritionist.name?.charAt(0).toUpperCase(),
        status: 'online'
      },
      lastMessage: conversation.messages[0]?.content || 'Nenhuma mensagem',
      timestamp: conversation.messages[0]?.createdAt.toISOString() || conversation.pinnedAt?.toISOString(),
      unreadCount: conversation._count.messages,
      priority: 'normal',
      pinned: true,
      pinnedAt: conversation.pinnedAt,
      archived: false,
      messages: []
    }))

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length
    })

  } catch (error) {
    console.error('Error fetching pinned conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}