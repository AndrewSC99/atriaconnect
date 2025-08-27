'use client'

import { useState, useEffect } from 'react'

interface MessageCount {
  total: number
  reminders: number
  conversations: number
}

export function useMessages() {
  const [messageCount, setMessageCount] = useState<MessageCount>({
    total: 0,
    reminders: 0,
    conversations: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchMessageCount = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/messages?count=true')
      
      if (response.ok) {
        const data = await response.json()
        
        // Simular contagem de mensagens por tipo
        // Na implementação real, a API retornaria essas informações
        const mockCounts = {
          total: data.length || 0,
          reminders: data.filter((msg: any) => msg.type === 'REMINDER' && !msg.read).length || 0,
          conversations: data.filter((msg: any) => msg.type !== 'REMINDER' && !msg.read).length || 0
        }
        
        setMessageCount(mockCounts)
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de mensagens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessageCount()
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchMessageCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const refreshCount = () => {
    fetchMessageCount()
  }

  return {
    messageCount,
    isLoading,
    refreshCount
  }
}