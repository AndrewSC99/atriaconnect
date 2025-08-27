'use client'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
  silent?: boolean
  requireInteraction?: boolean
}

export class NotificationService {
  private static instance: NotificationService | null = null
  private permission: NotificationPermission = 'default'
  private isSupported = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.isSupported = 'Notification' in window
      this.permission = this.isSupported ? Notification.permission : 'denied'
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Verificar se notificações são suportadas
  isNotificationSupported(): boolean {
    return this.isSupported
  }

  // Obter status da permissão
  getPermission(): NotificationPermission {
    return this.permission
  }

  // Solicitar permissão para notificações
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied'
    }

    if (this.permission === 'default') {
      try {
        this.permission = await Notification.requestPermission()
      } catch (error) {
        console.error('Erro ao solicitar permissão de notificação:', error)
        this.permission = 'denied'
      }
    }

    return this.permission
  }

  // Mostrar notificação
  async showNotification(options: NotificationOptions): Promise<Notification | null> {
    // Verificar suporte
    if (!this.isSupported) {
      console.warn('Notificações não são suportadas neste navegador')
      return null
    }

    // Verificar permissão
    if (this.permission !== 'granted') {
      console.warn('Permissão de notificação não concedida')
      return null
    }

    // Verificar se a aba está visível (evitar spam)
    if (document.visibilityState === 'visible') {
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        image: options.image,
        tag: options.tag,
        data: options.data,
        silent: options.silent || false,
        requireInteraction: options.requireInteraction || false
      })

      // Auto-fechar após 5 segundos se não for interativo
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification

    } catch (error) {
      console.error('Erro ao mostrar notificação:', error)
      return null
    }
  }

  // Notificação específica para nova mensagem
  async showMessageNotification(
    senderName: string, 
    messageContent: string, 
    conversationId: string,
    avatar?: string
  ): Promise<Notification | null> {
    const truncatedContent = messageContent.length > 100 
      ? messageContent.substring(0, 100) + '...'
      : messageContent

    return this.showNotification({
      title: `Nova mensagem de ${senderName}`,
      body: truncatedContent,
      icon: avatar || '/favicon.ico',
      tag: `message-${conversationId}`,
      data: {
        type: 'message',
        conversationId,
        senderName
      },
      requireInteraction: true
    })
  }

  // Notificação para lembrete
  async showReminderNotification(
    title: string,
    message: string,
    reminderData?: any
  ): Promise<Notification | null> {
    return this.showNotification({
      title: `🔔 ${title}`,
      body: message,
      icon: '/favicon.ico',
      tag: 'reminder',
      data: {
        type: 'reminder',
        ...reminderData
      },
      requireInteraction: true
    })
  }

  // Notificação de status do sistema
  async showSystemNotification(
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' = 'info'
  ): Promise<Notification | null> {
    const icons = {
      info: '💡',
      warning: '⚠️',
      error: '❌'
    }

    return this.showNotification({
      title: `${icons[type]} ${title}`,
      body: message,
      tag: `system-${type}`,
      data: {
        type: 'system',
        level: type
      },
      silent: type === 'error' ? false : true
    })
  }

  // Limpar todas as notificações com tag específica
  clearNotificationsByTag(tag: string): void {
    // Esta funcionalidade requer Service Worker
    // Por enquanto, apenas fechamos notificações ativas
    console.log(`Limpando notificações com tag: ${tag}`)
  }

  // Configurar event listeners para notificações
  setupNotificationHandlers(): void {
    if (!this.isSupported) return

    // Lidar com cliques na notificação
    window.addEventListener('beforeunload', () => {
      // Limpar notificações quando a página for fechada
      this.clearNotificationsByTag('message')
    })

    // Lidar com visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Quando a aba ficar visível, limpar notificações de mensagens
        this.clearNotificationsByTag('message')
      }
    })
  }

  // Verificar se deve mostrar notificação
  shouldShowNotification(): boolean {
    // Não mostrar se a página estiver visível
    if (document.visibilityState === 'visible') {
      return false
    }

    // Não mostrar se não há permissão
    if (this.permission !== 'granted') {
      return false
    }

    return true
  }

  // Configurações padrão para diferentes tipos de notificação
  static getDefaultOptions(type: 'message' | 'reminder' | 'system'): Partial<NotificationOptions> {
    const baseOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    }

    switch (type) {
      case 'message':
        return {
          ...baseOptions,
          requireInteraction: true,
          silent: false
        }
      case 'reminder':
        return {
          ...baseOptions,
          requireInteraction: true,
          silent: false
        }
      case 'system':
        return {
          ...baseOptions,
          requireInteraction: false,
          silent: true
        }
      default:
        return baseOptions
    }
  }
}

// Hook para usar o serviço de notificações
export function useNotifications() {
  const notificationService = NotificationService.getInstance()

  return {
    isSupported: notificationService.isNotificationSupported(),
    permission: notificationService.getPermission(),
    requestPermission: () => notificationService.requestPermission(),
    showNotification: (options: NotificationOptions) => notificationService.showNotification(options),
    showMessageNotification: (senderName: string, content: string, conversationId: string, avatar?: string) =>
      notificationService.showMessageNotification(senderName, content, conversationId, avatar),
    showReminderNotification: (title: string, message: string, data?: any) =>
      notificationService.showReminderNotification(title, message, data),
    showSystemNotification: (title: string, message: string, type?: 'info' | 'warning' | 'error') =>
      notificationService.showSystemNotification(title, message, type),
    shouldShowNotification: () => notificationService.shouldShowNotification(),
    setupHandlers: () => notificationService.setupNotificationHandlers()
  }
}