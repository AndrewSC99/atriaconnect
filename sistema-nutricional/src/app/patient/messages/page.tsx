'use client'

import { useState, useRef, useEffect } from 'react'
import { PatientLayout } from '@/components/layouts/patient-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Send,
  Paperclip,
  Smile,
  Image,
  FileText,
  User,
  Clock,
  CheckCheck,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react'

interface Message {
  id: number
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
}

interface Conversation {
  id: number
  nutritionist: {
    name: string
    avatar: string
    status: 'online' | 'offline' | 'busy'
  }
  lastMessage: string
  timestamp: string
  unreadCount: number
  messages: Message[]
}

const mockConversations: Conversation[] = [
  {
    id: 1,
    nutritionist: {
      name: "Dra. Maria Silva",
      avatar: "MS",
      status: "online"
    },
    lastMessage: "Ótimo progresso esta semana! Continue assim 👏",
    timestamp: "10:30",
    unreadCount: 2,
    messages: [
      {
        id: 1,
        content: "Olá! Como foi o seu fim de semana?",
        timestamp: "Hoje 09:15",
        senderId: "nutritionist1",
        senderName: "Dra. Maria Silva",
        senderType: "nutritionist",
        type: "text",
        read: true
      },
      {
        id: 2,
        content: "Oi Dra.! Foi bem tranquilo. Consegui seguir a dieta certinho, só no domingo que acabei comendo um pouco mais no almoço da família.",
        timestamp: "Hoje 09:20",
        senderId: "patient1",
        senderName: "João Silva",
        senderType: "patient",
        type: "text",
        read: true
      },
      {
        id: 3,
        content: "Que bom! Não se preocupe com o domingo, é normal ter essas situações sociais. O importante é voltar à rotina na segunda-feira. Como você se sentiu esta semana?",
        timestamp: "Hoje 09:25",
        senderId: "nutritionist1",
        senderName: "Dra. Maria Silva",
        senderType: "nutritionist",
        type: "text",
        read: true
      },
      {
        id: 4,
        content: "Me senti muito bem! Tive mais energia durante os treinos e não senti aquela sonolência depois do almoço.",
        timestamp: "Hoje 10:15",
        senderId: "patient1",
        senderName: "João Silva",
        senderType: "patient",
        type: "text",
        read: true
      },
      {
        id: 5,
        content: "Ótimo progresso esta semana! Continue assim 👏",
        timestamp: "Hoje 10:30",
        senderId: "nutritionist1",
        senderName: "Dra. Maria Silva",
        senderType: "nutritionist",
        type: "text",
        read: false
      },
      {
        id: 6,
        content: "Vou enviar algumas receitas novas para você variar o cardápio da próxima semana.",
        timestamp: "Hoje 10:31",
        senderId: "nutritionist1",
        senderName: "Dra. Maria Silva",
        senderType: "nutritionist",
        type: "text",
        read: false
      }
    ]
  }
]

export default function PatientMessages() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(mockConversations[0])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation.messages])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: selectedConversation.messages.length + 1,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      senderId: "patient1",
      senderName: "Você",
      senderType: "patient",
      type: "text",
      read: true
    }

    setSelectedConversation(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))

    setNewMessage('')

    // Simular resposta automática da nutricionista
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        const autoReply: Message = {
          id: selectedConversation.messages.length + 2,
          content: "Obrigada por compartilhar! Vou analisar e te respondo em breve 😊",
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          senderId: "nutritionist1",
          senderName: "Dra. Maria Silva",
          senderType: "nutritionist",
          type: "text",
          read: false
        }

        setSelectedConversation(prev => ({
          ...prev,
          messages: [...prev.messages, autoReply]
        }))
        setIsTyping(false)
      }, 2000)
    }, 1000)
  }

  const formatTimestamp = (timestamp: string) => {
    if (timestamp.includes('Hoje')) {
      return timestamp
    }
    return timestamp
  }

  const statusConfig = {
    online: { color: 'bg-green-500', label: 'Online' },
    offline: { color: 'bg-gray-400', label: 'Offline' },
    busy: { color: 'bg-yellow-500', label: 'Ocupado' }
  }

  return (
    <PatientLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">
            Mensagens
          </h1>
          <p className="text-muted-foreground">
            Converse com sua nutricionista
          </p>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Lista de Conversas */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Conversas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {mockConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-muted/50 border-l-4 ${
                        selectedConversation.id === conversation.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-blue-600">
                              {conversation.nutritionist.avatar}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${statusConfig[conversation.nutritionist.status].color} rounded-full border-2 border-white`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">
                              {conversation.nutritionist.name}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {conversation.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-blue-600">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              {/* Header do Chat */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600">
                          {selectedConversation.nutritionist.avatar}
                        </span>
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusConfig[selectedConversation.nutritionist.status].color} rounded-full border-2 border-white`}></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedConversation.nutritionist.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {statusConfig[selectedConversation.nutritionist.status].label}
                      </p>
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
                    className={`flex ${message.senderType === 'patient' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${message.senderType === 'patient' ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.senderType === 'patient'
                            ? 'bg-blue-600 text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className={`flex items-center space-x-1 mt-1 ${message.senderType === 'patient' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.senderType === 'patient' && (
                          <CheckCheck className={`h-3 w-3 ${message.read ? 'text-blue-500' : 'text-muted-foreground'}`} />
                        )}
                      </div>
                    </div>
                    
                    {message.senderType === 'nutritionist' && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 order-0">
                        <span className="text-xs font-semibold text-blue-600">
                          {selectedConversation.nutritionist.avatar}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-semibold text-blue-600">
                        {selectedConversation.nutritionist.avatar}
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
                <div className="flex items-end space-x-2">
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Image className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
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
                  <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
                  <span>{newMessage.length}/500</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Dicas Rápidas */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Resposta em até 2 horas durante horário comercial</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>Você pode enviar fotos e documentos</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>Para emergências, ligue: (11) 99999-9999</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  )
}