'use client'

import { useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  MessageCircle,
  Calendar,
  Activity,
  ChefHat,
  X
} from 'lucide-react'
import Link from 'next/link'

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

const notificationIcons = {
  INFO: Bell,
  SUCCESS: Check,
  WARNING: AlertCircle,
  ERROR: AlertCircle,
  APPOINTMENT: Calendar,
  MESSAGE: MessageCircle,
  METRIC: Activity,
  DIET: ChefHat
}

const notificationColors = {
  INFO: 'text-blue-600 bg-blue-100',
  SUCCESS: 'text-green-600 bg-green-100',
  WARNING: 'text-yellow-600 bg-yellow-100',
  ERROR: 'text-red-600 bg-red-100',
  APPOINTMENT: 'text-purple-600 bg-purple-100',
  MESSAGE: 'text-indigo-600 bg-indigo-100',
  METRIC: 'text-orange-600 bg-orange-100',
  DIET: 'text-emerald-600 bg-emerald-100'
}

const priorityColors = {
  LOW: 'border-l-slate-300',
  MEDIUM: 'border-l-blue-400',
  HIGH: 'border-l-yellow-400',
  URGENT: 'border-l-red-500'
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { 
    notifications, 
    unreadCount, 
    isConnected, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications()

  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  if (!isOpen) return null

  const handleNotificationClick = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      await markAsRead([notificationId])
    }
    
    if (notification?.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.length > 0) {
      await markAsRead(selectedNotifications)
      setSelectedNotifications([])
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d atrás`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end p-4 z-50">
      <Card className="w-96 max-h-[80vh] shadow-2xl">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notificações</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="default" className="bg-red-600">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex items-center space-x-2 mt-2">
              {selectedNotifications.length > 0 ? (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleMarkSelectedAsRead}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Marcar {selectedNotifications.length} como lida{selectedNotifications.length > 1 ? 's' : ''}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedNotifications([])}
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <Bell className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma notificação</p>
                <p className="text-sm">Você está em dia! 🎉</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type]
                  const isSelected = selectedNotifications.includes(notification.id)
                  
                  return (
                    <div
                      key={notification.id}
                      className={`
                        p-4 border-l-4 hover:bg-slate-50 cursor-pointer transition-colors
                        ${priorityColors[notification.priority]}
                        ${!notification.read ? 'bg-blue-50' : ''}
                        ${isSelected ? 'bg-slate-100' : ''}
                      `}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className={`p-2 rounded-full ${notificationColors[notification.type]}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                        </div>
                        
                        <div 
                          className="flex-1 min-w-0"
                          onClick={() => handleNotificationClick(notification.id)}
                        >
                          <div className="flex items-start justify-between">
                            <h4 className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                notification.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                                notification.priority === 'HIGH' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {notification.priority.toLowerCase()}
                            </Badge>
                            
                            {notification.actionUrl && (
                              <Button size="sm" variant="ghost">
                                Ver mais
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}