import { NextRequest } from 'next/server'
import { WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface ExtendedWebSocket extends WebSocket {
  userId?: string
  userRole?: string
  isAlive?: boolean
}

interface WebSocketMessage {
  type: 'new_message' | 'message_read' | 'typing' | 'user_status' | 'ping' | 'pong'
  data?: any
  conversationId?: string
  userId?: string
  timestamp: number
}

// Armazenar conexões ativas
const connections = new Map<string, ExtendedWebSocket>()
const conversationRooms = new Map<string, Set<string>>() // conversationId -> Set<userId>

// Configurar WebSocket Server (isso seria normalmente feito no servidor principal)
let wss: WebSocketServer | null = null

function initializeWebSocketServer() {
  if (wss) return wss

  wss = new WebSocketServer({ 
    port: 8080,
    verifyClient: async (info) => {
      try {
        // Verificar autenticação aqui se necessário
        return true
      } catch (error) {
        console.error('Erro na verificação do cliente WebSocket:', error)
        return false
      }
    }
  })

  wss.on('connection', async (ws: ExtendedWebSocket, request: IncomingMessage) => {
    const url = new URL(request.url!, `http://${request.headers.host}`)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      ws.close(1000, 'userId requerido')
      return
    }

    // Configurar conexão
    ws.userId = userId
    ws.isAlive = true
    connections.set(userId, ws)

    console.log(`WebSocket conectado: ${userId}`)

    // Heartbeat
    ws.on('pong', () => {
      ws.isAlive = true
    })

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString())
        await handleWebSocketMessage(ws, message)
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error)
      }
    })

    ws.on('close', (code, reason) => {
      console.log(`WebSocket desconectado: ${userId} (${code}: ${reason})`)
      
      // Remover da lista de conexões
      connections.delete(userId)
      
      // Remover de todas as salas
      conversationRooms.forEach((users, conversationId) => {
        users.delete(userId)
        if (users.size === 0) {
          conversationRooms.delete(conversationId)
        }
      })

      // Notificar outros usuários sobre mudança de status
      broadcastUserStatus(userId, 'offline')
    })

    // Enviar status inicial
    broadcastUserStatus(userId, 'online')
  })

  // Heartbeat para detectar conexões mortas
  const heartbeat = setInterval(() => {
    wss!.clients.forEach((ws: ExtendedWebSocket) => {
      if (!ws.isAlive) {
        ws.terminate()
        return
      }
      
      ws.isAlive = false
      ws.ping()
    })
  }, 30000)

  wss.on('close', () => {
    clearInterval(heartbeat)
  })

  console.log('WebSocket Server iniciado na porta 8080')
  return wss
}

async function handleWebSocketMessage(ws: ExtendedWebSocket, message: WebSocketMessage) {
  const { type, data, conversationId, userId } = message

  switch (type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
      break

    case 'new_message':
      if (conversationId && data) {
        await handleNewMessage(ws, conversationId, data)
      }
      break

    case 'message_read':
      if (conversationId && data?.messageIds) {
        await handleMessageRead(ws, conversationId, data.messageIds)
      }
      break

    case 'typing':
      if (conversationId && data && ws.userId) {
        await handleTyping(ws, conversationId, data.isTyping)
      }
      break

    case 'user_status':
      if (data?.status && ws.userId) {
        broadcastUserStatus(ws.userId, data.status)
      }
      break

    default:
      console.warn('Tipo de mensagem WebSocket não reconhecido:', type)
  }
}

async function handleNewMessage(ws: ExtendedWebSocket, conversationId: string, messageData: any) {
  // Adicionar usuário à sala da conversa
  if (!conversationRooms.has(conversationId)) {
    conversationRooms.set(conversationId, new Set())
  }
  conversationRooms.get(conversationId)!.add(ws.userId!)

  // Broadcast para todos os participantes da conversa
  broadcastToConversation(conversationId, {
    type: 'new_message',
    data: messageData,
    conversationId,
    timestamp: Date.now()
  }, ws.userId)
}

async function handleMessageRead(ws: ExtendedWebSocket, conversationId: string, messageIds: string[]) {
  // Broadcast para todos os participantes da conversa
  broadcastToConversation(conversationId, {
    type: 'message_read',
    data: { messageIds, readBy: ws.userId },
    conversationId,
    timestamp: Date.now()
  }, ws.userId)
}

async function handleTyping(ws: ExtendedWebSocket, conversationId: string, isTyping: boolean) {
  // Buscar nome do usuário (em produção, consultaria no banco)
  const userName = `Usuario ${ws.userId}`

  // Broadcast para outros participantes da conversa
  broadcastToConversation(conversationId, {
    type: 'typing',
    data: {
      isTyping,
      userId: ws.userId,
      userName
    },
    conversationId,
    timestamp: Date.now()
  }, ws.userId)

  // Auto-remover typing após 3 segundos
  if (isTyping) {
    setTimeout(() => {
      broadcastToConversation(conversationId, {
        type: 'typing',
        data: {
          isTyping: false,
          userId: ws.userId,
          userName
        },
        conversationId,
        timestamp: Date.now()
      }, ws.userId)
    }, 3000)
  }
}

function broadcastToConversation(conversationId: string, message: WebSocketMessage, excludeUserId?: string) {
  const participants = conversationRooms.get(conversationId)
  if (!participants) return

  const messageStr = JSON.stringify(message)

  participants.forEach(userId => {
    if (userId === excludeUserId) return
    
    const connection = connections.get(userId)
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(messageStr)
    }
  })
}

function broadcastUserStatus(userId: string, status: 'online' | 'offline' | 'away') {
  const message: WebSocketMessage = {
    type: 'user_status',
    data: { userId, status },
    timestamp: Date.now()
  }

  const messageStr = JSON.stringify(message)

  // Broadcast para todos os usuários conectados
  connections.forEach((connection, connUserId) => {
    if (connUserId !== userId && connection.readyState === WebSocket.OPEN) {
      connection.send(messageStr)
    }
  })
}

// Para desenvolvimento, vamos simular o WebSocket Server
export async function GET(request: NextRequest) {
  return new Response('WebSocket endpoint - use ws://localhost:8080 para conectar', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

// Inicializar servidor WebSocket quando o módulo for carregado
if (typeof window === 'undefined') {
  // Apenas no servidor
  try {
    initializeWebSocketServer()
  } catch (error) {
    console.log('WebSocket Server será inicializado quando necessário')
  }
}