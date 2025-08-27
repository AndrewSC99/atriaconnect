import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'APPOINTMENT' | 'MESSAGE' | 'METRIC' | 'DIET'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  read: boolean
  actionUrl?: string
  metadata?: any
  createdAt: string
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  markAsRead: (notificationIds: string[]) => Promise<void>
  markAllAsRead: () => Promise<void>
  fetchNotifications: () => Promise<void>
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => Promise<void>
}

export function useNotifications(): UseNotificationsReturn {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  // Buscar notificações do servidor
  const fetchNotifications = useCallback(async () => {
    if (!session) return

    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }, [session])

  // Conectar ao stream de notificações em tempo real
  useEffect(() => {
    if (!session) return

    // Buscar notificações iniciais
    fetchNotifications()

    // Configurar Server-Sent Events
    const eventSource = new EventSource('/api/notifications/stream')
    
    eventSource.onopen = () => {
      setIsConnected(true)
      console.log('Conectado ao sistema de notificações')
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'connected':
            console.log('Conexão estabelecida:', data.message)
            break
            
          case 'notification':
            // Nova notificação recebida
            setNotifications(prev => [data, ...prev])
            
            // Mostrar notificação do browser (se permitido)
            if (Notification.permission === 'granted') {
              new Notification(data.title, {
                body: data.message,
                icon: '/favicon.ico',
                tag: data.id
              })
            }
            break
            
          case 'broadcast':
            // Notificação broadcast
            setNotifications(prev => [data, ...prev])
            break
            
          case 'heartbeat':
            // Manter conexão viva
            break
            
          default:
            console.log('Evento desconhecido:', data)
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error)
      setIsConnected(false)
      
      // Tentar reconectar após 5 segundos
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CLOSED) {
          // A conexão será reestabelecida na próxima renderização
        }
      }, 5000)
    }

    setEventSource(eventSource)

    // Cleanup
    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [session, fetchNotifications])

  // Solicitar permissão para notificações do browser
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Marcar notificações como lidas
  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notificationIds,
          markAsRead: true
        })
      })

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notification =>
            notificationIds.includes(notification.id)
              ? { ...notification, read: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    }
  }, [])

  // Marcar todas as notificações como lidas
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }, [notifications, markAsRead])

  // Adicionar nova notificação
  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      })

      if (!response.ok) {
        throw new Error('Failed to create notification')
      }
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    addNotification
  }
}