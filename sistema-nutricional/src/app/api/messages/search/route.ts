import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface SearchFilters {
  query?: string
  sender?: string
  dateFrom?: string
  dateTo?: string
  messageType?: 'all' | 'text' | 'image' | 'file'
  hasAttachments?: boolean
  tags?: string[]
  priority?: 'all' | 'normal' | 'high' | 'urgent'
  readStatus?: 'all' | 'read' | 'unread'
  limit?: number
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filters: SearchFilters = await request.json()
    
    // Construir filtros where do Prisma
    let where: any = {}
    
    // Filtrar por mensagens do usuário
    if (session.user.role === 'PATIENT') {
      where.conversation = {
        patientId: session.user.patientId
      }
    } else if (session.user.role === 'NUTRITIONIST') {
      where.conversation = {
        nutritionistId: session.user.id
      }
    }

    // Busca por texto
    if (filters.query) {
      where.content = {
        contains: filters.query,
        mode: 'insensitive'
      }
    }

    // Filtro por remetente
    if (filters.sender && filters.sender !== 'all') {
      if (filters.sender === 'nutritionist' || filters.sender === 'patient') {
        where.sender = {
          role: filters.sender.toUpperCase()
        }
      } else {
        // ID específico do usuário
        where.senderId = filters.sender
      }
    }

    // Filtro por data
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom)
      }
      
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo)
        dateTo.setHours(23, 59, 59, 999) // Fim do dia
        where.createdAt.lte = dateTo
      }
    }

    // Filtro por tipo de mensagem
    if (filters.messageType && filters.messageType !== 'all') {
      where.type = filters.messageType.toUpperCase()
    }

    // Filtro por anexos
    if (filters.hasAttachments) {
      // Assumindo que existe um campo attachments ou similar
      where.attachments = {
        some: {}
      }
    }

    // Filtro por prioridade
    if (filters.priority && filters.priority !== 'all') {
      where.priority = filters.priority.toUpperCase()
    }

    // Filtro por status de leitura
    if (filters.readStatus && filters.readStatus !== 'all') {
      where.read = filters.readStatus === 'read'
    }

    // Executar busca
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
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50
    })

    // Formatar resultados
    const results = messages.map(message => {
      // Destacar termos de busca no conteúdo
      let highlightedContent = message.content
      if (filters.query) {
        const regex = new RegExp(`(${filters.query})`, 'gi')
        highlightedContent = message.content.replace(regex, '<mark>$1</mark>')
      }

      return {
        messageId: message.id,
        conversationId: message.conversationId,
        content: message.content,
        highlighted: highlightedContent,
        senderName: message.sender.name,
        senderType: message.sender.role.toLowerCase(),
        timestamp: message.createdAt.toISOString(),
        type: message.type.toLowerCase(),
        priority: message.priority?.toLowerCase(),
        tags: [], // TODO: Implementar sistema de tags
        hasAttachments: false, // TODO: Verificar anexos
        patientName: message.conversation.patient?.user.name,
        nutritionistName: message.conversation.nutritionist?.name
      }
    })

    return NextResponse.json({
      results,
      total: results.length,
      filters
    })

  } catch (error) {
    console.error('Error in message search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Endpoint para obter sugestões de busca
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'tags' | 'patients' | 'recent'

    let suggestions: any[] = []

    switch (type) {
      case 'tags':
        // TODO: Implementar busca de tags populares
        suggestions = [
          'emagrecimento',
          'diabetes',
          'hipertensão',
          'vegetariano',
          'primeira-consulta',
          'acompanhamento',
          'receitas',
          'suplementação'
        ]
        break

      case 'patients':
        if (session.user.role === 'NUTRITIONIST') {
          const patients = await prisma.patient.findMany({
            where: {
              nutritionistId: session.user.id
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            take: 20
          })

          suggestions = patients.map(patient => ({
            id: patient.user.id,
            name: patient.user.name
          }))
        }
        break

      case 'recent':
        // Buscar termos de busca recentes do usuário
        // TODO: Implementar histórico de buscas
        suggestions = []
        break

      default:
        suggestions = []
    }

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}