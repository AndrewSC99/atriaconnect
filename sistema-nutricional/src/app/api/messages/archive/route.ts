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

    const { conversationId, action } = await request.json()

    if (!conversationId || !action) {
      return NextResponse.json({ 
        error: 'Conversation ID and action are required' 
      }, { status: 400 })
    }

    if (!['archive', 'unarchive'].includes(action)) {
      return NextResponse.json({ 
        error: 'Action must be either "archive" or "unarchive"' 
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

    // Atualizar o status de arquivamento
    const isArchived = action === 'archive'
    
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        archived: isArchived,
        archivedAt: isArchived ? new Date() : null,
        archivedBy: isArchived ? session.user.id : null
      }
    })

    return NextResponse.json({
      success: true,
      message: `Conversation ${action}d successfully`,
      conversation: {
        id: updatedConversation.id,
        archived: updatedConversation.archived,
        archivedAt: updatedConversation.archivedAt
      }
    })

  } catch (error) {
    console.error('Error in conversation archive:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Listar conversas arquivadas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let where: any = {
      archived: true
    }

    // Filtrar por usuário
    if (session.user.role === 'PATIENT') {
      where.patientId = session.user.patientId
    } else if (session.user.role === 'NUTRITIONIST') {
      where.nutritionistId = session.user.id
    }

    const archivedConversations = await prisma.conversation.findMany({
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
      orderBy: { archivedAt: 'desc' }
    })

    const formattedConversations = archivedConversations.map(conversation => ({
      id: conversation.id,
      patient: conversation.patient ? {
        id: conversation.patient.user.id,
        name: conversation.patient.user.name,
        avatar: conversation.patient.user.name?.charAt(0).toUpperCase(),
        status: 'offline' // Status padrão para conversas arquivadas
      } : null,
      nutritionist: {
        id: conversation.nutritionist.id,
        name: conversation.nutritionist.name,
        avatar: conversation.nutritionist.name?.charAt(0).toUpperCase(),
        status: 'offline'
      },
      lastMessage: conversation.messages[0]?.content || 'Nenhuma mensagem',
      timestamp: conversation.messages[0]?.createdAt.toISOString() || conversation.archivedAt?.toISOString(),
      unreadCount: conversation._count.messages,
      priority: 'normal',
      archived: true,
      archivedAt: conversation.archivedAt,
      messages: []
    }))

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length
    })

  } catch (error) {
    console.error('Error fetching archived conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}