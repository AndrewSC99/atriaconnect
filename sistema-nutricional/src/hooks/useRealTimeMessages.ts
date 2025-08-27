'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { getWebSocketService } from '@/lib/websocket-service'
import { useNotifications } from '@/lib/notification-service'

interface Message {
  id: string
  content: string
  timestamp: string
  senderId: string
  senderName: string
  senderType: 'patient' | 'nutritionist'
  type: 'text' | 'image' | 'file'
  read: boolean
  conversationId: string
  priority?: 'normal' | 'high' | 'urgent'
  attachments?: Array<{
    name: string
    type: string
    size: string
    url: string
  }>
}

interface Conversation {
  id: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  priority: 'normal' | 'high' | 'urgent'
  archived: boolean
  messages: Message[]
  patient?: {
    id: string
    name: string
    avatar: string
    status: 'online' | 'offline' | 'away'
  }
  nutritionist?: {
    id: string
    name: string
    avatar: string
    status: 'online' | 'offline' | 'away'
  }
}

interface TypingUser {
  userId: string
  userName: string
  conversationId: string
  timestamp: number
}

export function useRealTimeMessages() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const wsService = getWebSocketService()
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  
  const {
    isSupported: notificationSupported,
    showMessageNotification,
    showSystemNotification,
    requestPermission: requestNotificationPermission,
    setupHandlers: setupNotificationHandlers
  } = useNotifications()

  // Carregar conversas iniciais
  const loadConversations = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/messages')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar conversas')
      }

      const messages = await response.json()
      
      // Agrupar mensagens por conversa
      const conversationsMap = new Map<string, Conversation>()
      
      for (const message of messages) {
        const conversationId = message.conversationId
        
        if (!conversationsMap.has(conversationId)) {
          // Criar nova conversa
          const conversation: Conversation = {
            id: conversationId,
            lastMessage: message.content,
            timestamp: message.timestamp,
            unreadCount: message.read ? 0 : 1,
            priority: message.priority || 'normal',
            archived: false,
            messages: [message],
            patient: message.conversation?.patient,
            nutritionist: message.conversation?.nutritionist
          }
          conversationsMap.set(conversationId, conversation)
        } else {
          // Adicionar à conversa existente
          const conversation = conversationsMap.get(conversationId)!
          conversation.messages.push(message)
          
          if (!message.read && message.senderId !== session.user.id) {
            conversation.unreadCount++
          }
          
          // Atualizar última mensagem se for mais recente
          if (new Date(message.timestamp) > new Date(conversation.timestamp)) {
            conversation.lastMessage = message.content
            conversation.timestamp = message.timestamp
          }
        }
      }

      // Ordenar mensagens dentro de cada conversa
      conversationsMap.forEach(conversation => {
        conversation.messages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      })

      const conversationsArray = Array.from(conversationsMap.values())
      
      // Ordenar conversas por timestamp da última mensagem
      conversationsArray.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setConversations(conversationsArray)
      setError(null)

    } catch (error) {
      console.error('Erro ao carregar conversas:', error)
      setError('Erro ao carregar conversas')
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // Conectar ao WebSocket
  useEffect(() => {
    if (!session?.user?.id) return

    const connectWebSocket = async () => {
      try {
        await wsService.connect(session.user.id)
        setIsConnected(wsService.isConnected())
        setError(null)
        
        // Mostrar notificação de sistema quando conectar
        if (wsService.isConnected()) {
          showSystemNotification(
            'Conectado',
            'Mensagens em tempo real ativadas',
            'success'
          )
        } else {
          showSystemNotification(
            'Modo Desenvolvimento',
            'Sistema funcionando sem WebSocket real',
            'info'
          )
        }
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error)
        setError('Sistema em modo offline')
        setIsConnected(false)
        
        // Mostrar notificação de erro
        showSystemNotification(
          'Modo Offline',
          'Sistema funcionará sem tempo real',
          'error'
        )
      }
    }

    connectWebSocket()

    // Event listeners
    const handleNewMessage = (messageData: Message) => {
      setConversations(prev => {
        const updated = [...prev]
        const conversationIndex = updated.findIndex(c => c.id === messageData.conversationId)
        
        if (conversationIndex >= 0) {
          // Conversa existente
          const conversation = { ...updated[conversationIndex] }
          conversation.messages = [...conversation.messages, messageData]
          conversation.lastMessage = messageData.content
          conversation.timestamp = messageData.timestamp
          
          // Incrementar contador se não for do usuário atual
          if (messageData.senderId !== session.user.id) {
            conversation.unreadCount++
          }
          
          updated[conversationIndex] = conversation
          
          // Mover para o topo
          updated.splice(conversationIndex, 1)
          updated.unshift(conversation)
        } else {
          // Nova conversa
          const newConversation: Conversation = {
            id: messageData.conversationId,
            lastMessage: messageData.content,
            timestamp: messageData.timestamp,
            unreadCount: messageData.senderId !== session.user.id ? 1 : 0,
            priority: messageData.priority || 'normal',
            archived: false,
            messages: [messageData]
          }
          
          updated.unshift(newConversation)
        }
        
        return updated
      })

      // Mostrar notificação se não for do usuário atual
      if (messageData.senderId !== session.user.id) {
        showMessageNotification(
          messageData.senderName,
          messageData.content,
          messageData.conversationId
        )
      }
    }

    const handleMessageRead = (data: { messageIds: string[], conversationId: string }) => {
      setConversations(prev => {
        return prev.map(conversation => {
          if (conversation.id === data.conversationId) {
            return {
              ...conversation,
              messages: conversation.messages.map(message => {
                if (data.messageIds.includes(message.id)) {
                  return { ...message, read: true }
                }
                return message
              }),
              unreadCount: Math.max(0, conversation.unreadCount - data.messageIds.length)
            }
          }
          return conversation
        })
      })
    }

    const handleTyping = (data: { isTyping: boolean, userId: string, userName: string, conversationId: string }) => {
      const typingUser: TypingUser = {
        userId: data.userId,
        userName: data.userName,
        conversationId: data.conversationId,
        timestamp: Date.now()
      }

      if (data.isTyping) {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId)
          return [...filtered, typingUser]
        })

        // Remover após timeout
        const timeoutKey = `${data.userId}-${data.conversationId}`
        const existingTimeout = typingTimeoutRef.current.get(timeoutKey)
        if (existingTimeout) {
          clearTimeout(existingTimeout)
        }

        const newTimeout = setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
          typingTimeoutRef.current.delete(timeoutKey)
        }, 3000)

        typingTimeoutRef.current.set(timeoutKey, newTimeout)
      } else {
        setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
      }
    }

    const handleUserStatus = (data: { userId: string, status: 'online' | 'offline' | 'away' }) => {
      setConversations(prev => {
        return prev.map(conversation => {
          if (conversation.patient?.id === data.userId) {
            return {
              ...conversation,
              patient: {
                ...conversation.patient,
                status: data.status
              }
            }
          }
          if (conversation.nutritionist?.id === data.userId) {
            return {
              ...conversation,
              nutritionist: {
                ...conversation.nutritionist,
                status: data.status
              }
            }
          }
          return conversation
        })
      })
    }

    wsService.on('new_message', handleNewMessage)
    wsService.on('message_read', handleMessageRead)
    wsService.on('typing', handleTyping)
    wsService.on('user_status', handleUserStatus)

    return () => {
      wsService.off('new_message', handleNewMessage)
      wsService.off('message_read', handleMessageRead)
      wsService.off('typing', handleTyping)
      wsService.off('user_status', handleUserStatus)
      wsService.disconnect()
      
      // Limpar timeouts
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout))
      typingTimeoutRef.current.clear()
    }
  }, [session?.user?.id])

  // Carregar conversas iniciais
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Configurar notificações
  useEffect(() => {
    if (notificationSupported) {
      setupNotificationHandlers()
    }
  }, [notificationSupported, setupNotificationHandlers])

  // Enviar mensagem
  const sendMessage = useCallback(async (conversationId: string, content: string, recipientId?: string): Promise<boolean> => {
    if (!session?.user?.id || !content.trim()) return false

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content.trim(),
          conversationId: conversationId || undefined,
          recipientId: recipientId || undefined,
          type: 'TEXT'
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem')
      }

      const messageData = await response.json()

      // Enviar via WebSocket
      if (wsService.isConnected()) {
        wsService.sendNewMessage(messageData.conversationId, {
          id: messageData.id,
          content: messageData.content,
          timestamp: messageData.timestamp,
          senderId: session.user.id,
          senderName: messageData.senderName,
          senderType: session.user.role?.toLowerCase(),
          type: 'text',
          read: false,
          conversationId: messageData.conversationId
        })
      }

      return true

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setError('Erro ao enviar mensagem')
      return false
    }
  }, [session?.user, wsService])

  // Marcar mensagens como lidas
  const markMessagesAsRead = useCallback(async (conversationId: string, messageIds: string[]): Promise<void> => {
    try {
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          messageIds
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao marcar mensagens como lidas')
      }

      // Enviar via WebSocket
      if (wsService.isConnected()) {
        wsService.sendMessageRead(conversationId, messageIds)
      }

    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error)
    }
  }, [wsService])

  // Indicador de digitação
  const sendTypingIndicator = useCallback((conversationId: string, isTyping: boolean) => {
    if (wsService.isConnected()) {
      wsService.sendTypingIndicator(conversationId, isTyping)
    }
  }, [wsService])

  // Solicitar permissão de notificação
  const requestPermission = useCallback(async () => {
    return await requestNotificationPermission()
  }, [requestNotificationPermission])

  return {
    conversations,
    typingUsers,
    isConnected,
    isLoading,
    error,
    sendMessage,
    markMessagesAsRead,
    sendTypingIndicator,
    requestNotificationPermission: requestPermission,
    refreshConversations: loadConversations
  }
}