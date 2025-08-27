'use client'

import { useState, useRef, useEffect } from 'react'
import { NutritionistLayout } from '@/components/layouts/nutritionist-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { WhatsAppConfigModal } from '@/components/dashboard/modals/WhatsAppConfigModal'
import { WhatsAppConfig } from '@/components/messages/WhatsAppConfig'
import { FileUploadModal } from '@/components/messages/FileUploadModal'
import { AdvancedSearch } from '@/components/messages/AdvancedSearch'
import { useWhatsApp } from '@/hooks/useWhatsApp'
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages'
import { useSession } from 'next-auth/react'
import { 
  Send,
  Paperclip,
  Image,
  FileText,
  User,
  Clock,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Search,
  Archive,
  Star,
  Pin,
  Users,
  MessageCircle,
  AlertCircle,
  Zap,
  Bell,
  Smartphone,
  ArchiveRestore
} from 'lucide-react'

interface Message {
  id: string
  content: string
  timestamp: string
  senderId: string
  senderName: string
  senderType: 'patient' | 'nutritionist'
  type: 'text' | 'image' | 'file'
  attachments?: Array<{
    name: string
    type: string
    size: string
    url: string
  }>
  read: boolean
  priority?: 'normal' | 'high' | 'urgent'
  conversationId: string
}

interface Conversation {
  id: string
  patient?: {
    id: string
    name: string
    avatar: string
    status: 'online' | 'offline' | 'away'
    lastSeen?: string
  }
  nutritionist?: {
    id: string
    name: string
    avatar: string
    status: 'online' | 'offline' | 'away'
  }
  lastMessage: string
  timestamp: string
  unreadCount: number
  priority: 'normal' | 'high' | 'urgent'
  tags?: string[]
  pinned?: boolean
  archived: boolean
  messages: Message[]
  isWhatsApp?: boolean
  whatsappNumber?: string
}

export default function NutritionistMessages() {
  const { data: session } = useSession()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [whatsappConfigOpen, setWhatsappConfigOpen] = useState(false)
  const [whatsappConfigModalOpen, setWhatsappConfigModalOpen] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [fileUploadOpen, setFileUploadOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { 
    isConnected: whatsappConnected, 
    sendMessage: sendWhatsAppMessage, 
    config: whatsappConfig,
    updateConfig: updateWhatsAppConfig,
    error: whatsappError
  } = useWhatsApp()

  const {
    conversations,
    typingUsers,
    isConnected: wsConnected,
    isLoading,
    error: wsError,
    sendMessage: sendRealTimeMessage,
    markMessagesAsRead,
    sendTypingIndicator,
    requestNotificationPermission
  } = useRealTimeMessages()

  const archiveConversation = async (conversationId: string) => {
    try {
      const response = await fetch('/api/messages/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversationId, action: 'archive' })
      })

      if (response.ok) {
        // Atualizar localmente
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, archived: true }
              : conv
          )
        )

        // Se a conversa arquivada estava selecionada, limpar seleção
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null)
        }
      }
    } catch (error) {
      console.error('Erro ao arquivar conversa:', error)
    }
  }

  const unarchiveConversation = async (conversationId: string) => {
    try {
      const response = await fetch('/api/messages/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversationId, action: 'unarchive' })
      })

      if (response.ok) {
        // Atualizar localmente
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, archived: false }
              : conv
          )
        )
      }
    } catch (error) {
      console.error('Erro ao desarquivar conversa:', error)
    }
  }

  const togglePinConversation = async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId)
      if (!conversation) return

      const response = await fetch('/api/messages/pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          conversationId, 
          pinned: !conversation.pinned 
        })
      })

      if (response.ok) {
        // Atualizar localmente
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, pinned: !conv.pinned }
              : conv
          )
        )
      }
    } catch (error) {
      console.error('Erro ao fixar/desafixar conversa:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  // Auto-selecionar primeira conversa quando carregar
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0])
    }
  }, [conversations, selectedConversation])

  // Marcar mensagens como lidas quando selecionar conversa
  useEffect(() => {
    if (selectedConversation && session?.user?.id) {
      const unreadMessages = selectedConversation.messages
        .filter(msg => !msg.read && msg.senderId !== session.user.id)
        .map(msg => msg.id)
      
      if (unreadMessages.length > 0) {
        markMessagesAsRead(selectedConversation.id, unreadMessages)
      }
    }
  }, [selectedConversation, session?.user?.id, markMessagesAsRead])

  // Solicitar permissão de notificação na inicialização
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  // Lidar com indicador de digitação
  const handleMessageChange = (value: string) => {
    setNewMessage(value)
    
    if (!selectedConversation) return

    // Enviar indicador de digitação
    if (value.trim() && !isTyping) {
      setIsTyping(true)
      sendTypingIndicator(selectedConversation.id, true)
    } else if (!value.trim() && isTyping) {
      setIsTyping(false)
      sendTypingIndicator(selectedConversation.id, false)
    }

    // Reset timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Parar digitação após 3 segundos de inatividade
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        sendTypingIndicator(selectedConversation.id, false)
      }, 3000)
    }
  }

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Verificar se alguém está digitando na conversa atual
  const isCurrentConversationTyping = selectedConversation
    ? typingUsers.some(user => user.conversationId === selectedConversation.id)
    : false
  
  const currentTypingUser = selectedConversation
    ? typingUsers.find(user => user.conversationId === selectedConversation.id)
    : null

  const sendMessage = async (messageContent?: string, attachments?: Array<{ url: string; name: string; type: string; size: number }>) => {
    const content = messageContent || newMessage.trim()
    if (!content && !attachments?.length) return
    if (!selectedConversation) return

    try {
      // Se a conversa for do WhatsApp e estiver conectado, tentar enviar via WhatsApp primeiro
      if (selectedConversation.isWhatsApp && whatsappConnected && selectedConversation.whatsappNumber) {
        const success = await sendWhatsAppMessage(selectedConversation.whatsappNumber, content)
        if (!success) {
          console.warn('Falha no WhatsApp, enviando via sistema interno')
        }
      }

      // Montar conteúdo da mensagem com anexos
      let finalContent = content
      if (attachments?.length) {
        const attachmentText = attachments.map(att => `📎 ${att.name}`).join('\n')
        finalContent = content ? `${content}\n\n${attachmentText}` : attachmentText
      }

      // Enviar via sistema interno (sempre)
      const success = await sendRealTimeMessage(selectedConversation.id, finalContent)
      
      if (success) {
        setNewMessage('')
        // Parar indicador de digitação
        if (isTyping) {
          setIsTyping(false)
          sendTypingIndicator(selectedConversation.id, false)
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    }
  }

  const handleFilesUploaded = (files: Array<{ url: string; name: string; type: string; size: number }>) => {
    sendMessage('', files)
  }

  const handleSearch = async (filters: any) => {
    try {
      const response = await fetch('/api/messages/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      })

      if (response.ok) {
        const data = await response.json()
        return data.results
      }
      
      return []
    } catch (error) {
      console.error('Erro na busca:', error)
      return []
    }
  }

  const handleSelectMessage = (messageId: string, conversationId: string) => {
    // Encontrar a conversa correspondente e selecioná-la
    const conversation = conversations.find(c => c.id === conversationId)
    if (conversation) {
      setSelectedConversation(conversation)
      
      // Scroll para a mensagem específica (se necessário)
      setTimeout(() => {
        const messageElement = document.getElementById(`message-${messageId}`)
        if (messageElement) {
          messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          messageElement.classList.add('highlight-message')
          setTimeout(() => {
            messageElement.classList.remove('highlight-message')
          }, 3000)
        }
      }, 100)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const patientName = conv.patient?.name || conv.nutritionist?.name || 'Usuário'
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase())
    
    switch (selectedTab) {
      case 'unread':
        return conv.unreadCount > 0 && matchesSearch
      case 'pinned':
        return conv.pinned && matchesSearch
      case 'priority':
        return conv.priority !== 'normal' && matchesSearch
      case 'reminders':
        return conv.messages.some(msg => msg.content.startsWith('🔔')) && matchesSearch
      case 'whatsapp':
        return conv.isWhatsApp && matchesSearch
      case 'archived':
        return conv.archived && matchesSearch
      default:
        return !conv.archived && matchesSearch
    }
  })

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
  const priorityMessages = conversations.filter(conv => conv.priority !== 'normal').length
  const pinnedMessages = conversations.filter(conv => conv.pinned).length
  const reminderMessages = conversations.filter(conv => 
    conv.messages.some(msg => msg.content.startsWith('🔔'))
  ).length
  const whatsappMessages = conversations.filter(conv => conv.isWhatsApp).length
  const archivedMessages = conversations.filter(conv => conv.archived).length

  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online' },
    offline: { color: 'bg-gray-400', label: 'Offline' },
    away: { color: 'bg-yellow-500', label: 'Ausente' }
  }

  const priorityConfig = {
    normal: { color: 'border-border', bgColor: '' },
    high: { color: 'border-yellow-400', bgColor: 'bg-yellow-50' },
    urgent: { color: 'border-red-400', bgColor: 'bg-red-50' }
  }

  return (
    <NutritionistLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Central de Mensagens
              </h1>
              <p className="text-muted-foreground">
                Gerencie a comunicação com seus pacientes
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                wsConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  wsConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span>{wsConnected ? 'Conectado' : 'Desconectado'}</span>
              </div>
              {whatsappConnected && (
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                  <Smartphone className="w-3 h-3" />
                  <span>WhatsApp OK</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Não Lidas</p>
                  <p className="text-2xl font-bold">{totalUnread}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Prioridade</p>
                  <p className="text-2xl font-bold">{priorityMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="text-2xl font-bold">{whatsappMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Bell className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Lembretes Enviados</p>
                  <p className="text-2xl font-bold">{reminderMessages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Lista de Conversas */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversas</CardTitle>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setWhatsappConfigModalOpen(true)}
                        title={whatsappConnected ? "WhatsApp Conectado" : "Configurar WhatsApp Business"}
                        className={whatsappConnected ? "border-green-500 text-green-600" : ""}
                      >
                        <Smartphone className={`h-4 w-4 ${whatsappConnected ? "text-green-600" : ""}`} />
                        {whatsappConnected && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedTab(selectedTab === 'archived' ? 'all' : 'archived')}
                        title={selectedTab === 'archived' ? 'Ver todas' : 'Ver arquivadas'}
                      >
                        <Archive className="h-4 w-4" />
                        {selectedTab === 'archived' && <span className="ml-1 text-xs">({archivedMessages})</span>}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar pacientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <AdvancedSearch
                      onSearch={handleSearch}
                      onSelectMessage={handleSelectMessage}
                      availableTags={['emagrecimento', 'diabetes', 'hipertensão', 'vegetariano', 'primeira-consulta']}
                    />
                  </div>

                  <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-7 text-xs">
                      <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                      <TabsTrigger value="unread" className="text-xs">Não Lidas</TabsTrigger>
                      <TabsTrigger value="pinned" className="text-xs">Fixadas</TabsTrigger>
                      <TabsTrigger value="priority" className="text-xs">Prioridade</TabsTrigger>
                      <TabsTrigger value="reminders" className="text-xs">Lembretes</TabsTrigger>
                      <TabsTrigger value="whatsapp" className="text-xs">WhatsApp</TabsTrigger>
                      <TabsTrigger value="archived" className="text-xs">Arquivadas ({archivedMessages})</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Carregando conversas...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 cursor-pointer hover:bg-muted/50 border-l-4 ${
                          selectedConversation?.id === conversation.id 
                            ? 'border-green-500 bg-green-50' 
                            : priorityConfig[conversation.priority].color
                        } ${priorityConfig[conversation.priority].bgColor}`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="font-semibold text-green-600">
                                {conversation.patient?.avatar || conversation.patient?.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusConfig[conversation.patient?.status || 'offline'].color} rounded-full border-2 border-white`}></div>
                            {conversation.pinned && (
                              <Pin className="absolute -top-1 -left-1 w-3 h-3 text-blue-600" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">
                                {conversation.patient?.name || 'Usuário'}
                              </h3>
                              <div className="flex items-center space-x-1">
                                {conversation.isWhatsApp && (
                                  <Smartphone className="h-3 w-3 text-green-500" title="WhatsApp" />
                                )}
                                {conversation.priority !== 'normal' && (
                                  <AlertCircle className={`h-3 w-3 ${
                                    conversation.priority === 'urgent' ? 'text-red-500' : 'text-yellow-500'
                                  }`} />
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {conversation.timestamp}
                                </span>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation()
                                      togglePinConversation(conversation.id)
                                    }}>
                                      <Pin className="h-4 w-4 mr-2" />
                                      {conversation.pinned ? 'Desafixar' : 'Fixar'}
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation()
                                      if (conversation.archived) {
                                        unarchiveConversation(conversation.id)
                                      } else {
                                        archiveConversation(conversation.id)
                                      }
                                    }}>
                                      {conversation.archived ? (
                                        <>
                                          <ArchiveRestore className="h-4 w-4 mr-2" />
                                          Desarquivar
                                        </>
                                      ) : (
                                        <>
                                          <Archive className="h-4 w-4 mr-2" />
                                          Arquivar
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuSeparator />
                                    
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation()
                                      markMessagesAsRead(
                                        conversation.id,
                                        conversation.messages.filter(msg => !msg.read).map(msg => msg.id)
                                      )
                                    }}>
                                      <CheckCheck className="h-4 w-4 mr-2" />
                                      Marcar como lida
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex flex-wrap gap-1">
                                {conversation.tags?.slice(0, 2).map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-green-600">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Header do Chat */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-green-600">
                            {selectedConversation.patient?.avatar || selectedConversation.patient?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusConfig[selectedConversation.patient?.status || 'offline'].color} rounded-full border-2 border-white`}></div>
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedConversation.patient?.name || 'Usuário'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.patient?.status === 'offline' && selectedConversation.patient?.lastSeen
                            ? `Visto ${selectedConversation.patient.lastSeen}`
                            : statusConfig[selectedConversation.patient?.status || 'offline'].label
                          }
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedConversation.tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Mensagens */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'nutritionist' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${message.senderType === 'nutritionist' ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`p-3 rounded-lg ${
                            message.senderType === 'nutritionist'
                              ? 'bg-green-600 text-white'
                              : message.priority === 'urgent'
                              ? 'bg-red-100 text-red-900 border border-red-200'
                              : message.priority === 'high'
                              ? 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className={`flex items-center space-x-1 mt-1 ${message.senderType === 'nutritionist' ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.senderType === 'nutritionist' && (
                            <CheckCheck className={`h-3 w-3 ${message.read ? 'text-green-500' : 'text-muted-foreground'}`} />
                          )}
                          {message.priority && message.priority !== 'normal' && (
                            <AlertCircle className={`h-3 w-3 ${
                              message.priority === 'urgent' ? 'text-red-500' : 'text-yellow-500'
                            }`} />
                          )}
                        </div>
                      </div>
                      
                      {message.senderType === 'patient' && (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 order-0">
                          <span className="text-xs font-semibold text-green-600">
                            {selectedConversation.patient?.avatar || selectedConversation.patient?.name?.charAt(0).toUpperCase() || 'P'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Indicador de digitação */}
                  {isCurrentConversationTyping && currentTypingUser && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-xs font-semibold text-green-600">
                          {selectedConversation.patient?.avatar || selectedConversation.patient?.name?.charAt(0).toUpperCase() || 'P'}
                        </span>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input de Mensagem */}
                <div className="border-t p-4">
                  {/* Respostas Rápidas */}
                  {showQuickReplies && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setNewMessage("Obrigada por compartilhar! Vou analisar e te respondo em breve.")
                            setShowQuickReplies(false)
                          }}
                        >
                          Resposta padrão
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setNewMessage("Parabéns pelo progresso! Continue assim.")
                            setShowQuickReplies(false)
                          }}
                        >
                          Parabenizar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setNewMessage("Vamos ajustar seu plano. Quando pode conversar?")
                            setShowQuickReplies(false)
                          }}
                        >
                          Ajustar plano
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setNewMessage("Vou enviar algumas receitas novas para você.")
                            setShowQuickReplies(false)
                          }}
                        >
                          Enviar receitas
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-end space-x-2">
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setFileUploadOpen(true)}
                        title="Anexar arquivos"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setFileUploadOpen(true)}
                        title="Enviar imagem"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setFileUploadOpen(true)}
                        title="Enviar documento"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setShowQuickReplies(!showQuickReplies)}
                        className={showQuickReplies ? "bg-blue-100 text-blue-600" : ""}
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1">
                      <Textarea
                        placeholder="Digite sua resposta..."
                        value={newMessage}
                        onChange={(e) => handleMessageChange(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendMessage()
                          }
                        }}
                        className="min-h-[40px] max-h-32 resize-none"
                      />
                    </div>
                    
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="h-10"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
                      {showQuickReplies && (
                        <span className="text-blue-600">⚡ Respostas rápidas ativas</span>
                      )}
                    </div>
                    <span>{newMessage.length}/1000</span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
                  <p>Escolha uma conversa para começar a enviar mensagens</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Modal de Configuração WhatsApp */}
        <WhatsAppConfig
          isOpen={whatsappConfigModalOpen}
          onClose={() => setWhatsappConfigModalOpen(false)}
        />

        {/* Modal de Upload de Arquivos */}
        <FileUploadModal
          isOpen={fileUploadOpen}
          onClose={() => setFileUploadOpen(false)}
          onFilesUploaded={handleFilesUploaded}
          maxFiles={5}
        />

        {/* Erro de conexão */}
        {(wsError || whatsappError) && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">
                {wsError || whatsappError}
              </span>
            </div>
          </div>
        )}
      </div>
    </NutritionistLayout>
  )
}