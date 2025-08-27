import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mapa para armazenar conexões ativas dos usuários
const userConnections = new Map<string, WritableStreamDefaultWriter>()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Criar um ReadableStream para Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // Configurar headers para SSE
        const encoder = new TextEncoder()
        
        // Função para enviar dados
        const send = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(message))
        }

        // Enviar evento inicial de conexão
        send({
          type: 'connected',
          message: 'Conectado ao sistema de notificações',
          timestamp: new Date().toISOString()
        })

        // Armazenar a conexão do usuário
        const writer = controller as any
        userConnections.set(session.user.id, writer)

        // Enviar heartbeat a cada 30 segundos
        const heartbeatInterval = setInterval(() => {
          try {
            send({
              type: 'heartbeat',
              timestamp: new Date().toISOString()
            })
          } catch (error) {
            clearInterval(heartbeatInterval)
            userConnections.delete(session.user.id)
          }
        }, 30000)

        // Cleanup quando a conexão for fechada
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval)
          userConnections.delete(session.user.id)
          try {
            controller.close()
          } catch (error) {
            // Conexão já fechada
          }
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    })

  } catch (error) {
    console.error('Error in notification stream:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

// Função utilitária para enviar notificação para um usuário específico
export function sendNotificationToUser(userId: string, notification: any) {
  const connection = userConnections.get(userId)
  if (connection) {
    try {
      const encoder = new TextEncoder()
      const message = `data: ${JSON.stringify({
        type: 'notification',
        ...notification,
        timestamp: new Date().toISOString()
      })}\n\n`
      
      // Note: This is a simplified approach. In production, you'd want more robust error handling
      connection.enqueue(encoder.encode(message))
    } catch (error) {
      console.error('Error sending notification to user:', error)
      userConnections.delete(userId)
    }
  }
}

// Função utilitária para broadcast para todos os usuários conectados
export function broadcastNotification(notification: any) {
  const encoder = new TextEncoder()
  const message = `data: ${JSON.stringify({
    type: 'broadcast',
    ...notification,
    timestamp: new Date().toISOString()
  })}\n\n`

  userConnections.forEach((connection, userId) => {
    try {
      connection.enqueue(encoder.encode(message))
    } catch (error) {
      console.error(`Error sending broadcast to user ${userId}:`, error)
      userConnections.delete(userId)
    }
  })
}