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
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    let where: any = {
      userId: session.user.id
    }

    if (unreadOnly) {
      where.read = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      read: notification.read,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata ? JSON.parse(notification.metadata) : null,
      createdAt: notification.createdAt.toISOString()
    }))

    return NextResponse.json(formattedNotifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
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
    const { title, message, type, priority = 'MEDIUM', actionUrl, metadata, targetUserId } = body

    // Validação básica
    if (!title || !message || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Se targetUserId for fornecido, verificar permissões
    let userId = session.user.id
    if (targetUserId && session.user.role === 'NUTRITIONIST') {
      // Nutricionistas podem enviar notificações para seus pacientes
      const patient = await prisma.patient.findFirst({
        where: {
          userId: targetUserId,
          nutritionistId: session.user.nutritionistId
        }
      })
      
      if (patient) {
        userId = targetUserId
      }
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        priority,
        actionUrl,
        metadata: metadata ? JSON.stringify(metadata) : null,
        read: false
      }
    })

    // Aqui seria implementado o sistema de push em tempo real
    // Por exemplo: WebSockets, Server-Sent Events, ou push notifications

    return NextResponse.json({
      id: notification.id,
      title: notification.title,
      message: 'Notification created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationIds, markAsRead = true } = body

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Notification IDs required' }, { status: 400 })
    }

    // Atualizar apenas notificações do usuário atual
    const updatedNotifications = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id
      },
      data: { 
        read: markAsRead,
        readAt: markAsRead ? new Date() : null
      }
    })

    return NextResponse.json({
      updatedCount: updatedNotifications.count,
      message: `Notifications marked as ${markAsRead ? 'read' : 'unread'}`
    })

  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}