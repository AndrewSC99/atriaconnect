'use client'

interface WebSocketMessage {
  type: 'new_message' | 'message_read' | 'typing' | 'user_status'
  data: any
  conversationId?: string
  userId?: string
  timestamp: number
}

interface WebSocketConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private config: WebSocketConfig
  private reconnectAttempts = 0
  private isConnecting = false
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map()
  private heartbeatInterval: NodeJS.Timeout | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private isDevelopmentMode = process.env.NODE_ENV === 'development'
  private mockMode = false

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: config.url || (typeof window !== 'undefined' 
        ? `ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host}/ws`
        : 'ws://localhost:3000/ws'),
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5
    }
    
    // Em desenvolvimento, usar modo mock se WebSocket falhar
    if (this.isDevelopmentMode) {
      console.log('WebSocket em modo desenvolvimento - fallback para mock se necessário')
    }
  }

  connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Se já em modo mock, resolver imediatamente
      if (this.mockMode) {
        console.log('WebSocket em modo mock - conexão simulada')
        resolve()
        return
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (this.isConnecting) {
        resolve()
        return
      }

      this.isConnecting = true

      try {
        const wsUrl = `${this.config.url}?userId=${userId}`
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('WebSocket conectado')
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket desconectado:', event.code, event.reason)
          this.isConnecting = false
          this.stopHeartbeat()
          
          if (event.code !== 1000) { // Não foi fechamento normal
            this.attemptReconnect(userId)
          }
        }

        this.ws.onerror = (error) => {
          console.warn('WebSocket falhou, ativando modo mock para desenvolvimento')
          this.isConnecting = false
          
          // Em modo desenvolvimento, ativar mock ao invés de rejeitar
          if (this.isDevelopmentMode) {
            this.mockMode = true
            console.log('Modo mock ativado - sistema funcionará sem WebSocket real')
            resolve()
          } else {
            console.error('Erro WebSocket:', error)
            reject(error)
          }
        }

      } catch (error) {
        this.isConnecting = false
        reject(error)
      }
    })
  }

  disconnect(): void {
    this.stopHeartbeat()
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close(1000, 'Desconexão manual')
      this.ws = null
    }

    this.reconnectAttempts = 0
  }

  sendMessage(message: Omit<WebSocketMessage, 'timestamp'>): void {
    const messageWithTimestamp: WebSocketMessage = {
      ...message,
      timestamp: Date.now()
    }

    if (this.mockMode) {
      // Em modo mock, simular resposta após delay
      console.log('Mock WebSocket - simulando envio:', messageWithTimestamp.type)
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(messageWithTimestamp))
    } else {
      console.warn('WebSocket não conectado. Tentando reconectar...')
    }
  }

  // Eventos específicos do chat
  sendNewMessage(conversationId: string, message: any): void {
    this.sendMessage({
      type: 'new_message',
      data: message,
      conversationId
    })
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    this.sendMessage({
      type: 'typing',
      data: { isTyping },
      conversationId
    })
  }

  sendMessageRead(conversationId: string, messageIds: string[]): void {
    this.sendMessage({
      type: 'message_read',
      data: { messageIds },
      conversationId
    })
  }

  sendUserStatus(status: 'online' | 'away' | 'offline'): void {
    this.sendMessage({
      type: 'user_status',
      data: { status }
    })
  }

  // Sistema de eventos
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Verificar se está conectado (incluindo modo mock)
  isConnected(): boolean {
    return this.mockMode || (this.ws?.readyState === WebSocket.OPEN)
  }

  private handleMessage(message: WebSocketMessage): void {
    // Emitir evento específico do tipo
    this.emit(message.type, message.data)
    
    // Emitir evento geral
    this.emit('message', message)
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Erro no listener do evento ${event}:`, error)
        }
      })
    }
  }

  private attemptReconnect(userId: string): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Máximo de tentativas de reconexão atingido')
      this.emit('max_reconnect_attempts_reached', {})
      return
    }

    this.reconnectAttempts++
    console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.config.maxReconnectAttempts}`)

    this.reconnectTimeout = setTimeout(() => {
      this.connect(userId).catch(error => {
        console.error('Erro na tentativa de reconexão:', error)
      })
    }, this.config.reconnectInterval * this.reconnectAttempts)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
      }
    }, 30000) // A cada 30 segundos
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }


  get connectionState(): 'connecting' | 'open' | 'closing' | 'closed' {
    if (!this.ws) return 'closed'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'open'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'closed'
      default: return 'closed'
    }
  }
}

// Singleton para uso global
let webSocketInstance: WebSocketService | null = null

export function getWebSocketService(): WebSocketService {
  if (typeof window === 'undefined') {
    // Retornar uma implementação mock no servidor
    return {
      connect: () => Promise.resolve(),
      disconnect: () => {},
      sendMessage: () => {},
      sendNewMessage: () => {},
      sendTypingIndicator: () => {},
      sendMessageRead: () => {},
      sendUserStatus: () => {},
      isConnected: () => false,
      on: () => {},
      off: () => {}
    } as WebSocketService
  }

  if (!webSocketInstance) {
    webSocketInstance = new WebSocketService()
  }

  return webSocketInstance
}