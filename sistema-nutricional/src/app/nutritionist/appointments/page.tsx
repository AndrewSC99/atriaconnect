'use client'

import { useState } from 'react'
import { NutritionistLayout } from '@/components/layouts/nutritionist-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  Clock,
  Plus,
  Check,
  X,
  User,
  MapPin,
  Phone,
  Video,
  AlertCircle,
  Edit,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react'

const mockAppointments = [
  {
    id: 1,
    date: "2024-11-18",
    time: "09:00",
    duration: 60,
    type: "CONSULTATION",
    status: "CONFIRMED",
    patient: {
      name: "João Silva",
      phone: "(11) 99999-1111",
      email: "joao@email.com"
    },
    notes: "Primeira consulta - avaliação inicial",
    location: "Presencial"
  },
  {
    id: 2,
    date: "2024-11-18",
    time: "10:30",
    duration: 30,
    type: "FOLLOWUP",
    status: "SCHEDULED",
    patient: {
      name: "Maria Santos",
      phone: "(11) 99999-2222", 
      email: "maria@email.com"
    },
    notes: "Acompanhamento semanal",
    location: "Online"
  },
  {
    id: 3,
    date: "2024-11-18",
    time: "14:00",
    duration: 45,
    type: "EVALUATION",
    status: "SCHEDULED",
    patient: {
      name: "Pedro Costa",
      phone: "(11) 99999-3333",
      email: "pedro@email.com"
    },
    notes: "Reavaliação após 30 dias",
    location: "Presencial"
  },
  {
    id: 4,
    date: "2024-11-19",
    time: "11:00",
    duration: 60,
    type: "CONSULTATION",
    status: "PENDING",
    patient: {
      name: "Ana Oliveira",
      phone: "(11) 99999-4444",
      email: "ana@email.com"
    },
    notes: "Consulta inicial - obesidade",
    location: "Presencial"
  }
]

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', 
  '16:00', '16:30', '17:00', '17:30'
]

const appointmentTypes = {
  CONSULTATION: "Consulta",
  FOLLOWUP: "Acompanhamento", 
  EVALUATION: "Avaliação"
}

const statusConfig = {
  PENDING: { label: "Pendente", color: "bg-yellow-600", textColor: "text-yellow-600" },
  SCHEDULED: { label: "Agendado", color: "bg-blue-600", textColor: "text-blue-600" },
  CONFIRMED: { label: "Confirmado", color: "bg-green-600", textColor: "text-green-600" },
  COMPLETED: { label: "Realizado", color: "bg-slate-600", textColor: "text-muted-foreground" },
  CANCELLED: { label: "Cancelado", color: "bg-red-600", textColor: "text-red-600" }
}

export default function NutritionistAppointments() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCreatingSlot, setIsCreatingSlot] = useState(false)
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')

  const todayAppointments = mockAppointments.filter(apt => 
    apt.date === selectedDate.toISOString().split('T')[0]
  )

  const pendingAppointments = mockAppointments.filter(apt => apt.status === 'PENDING')
  const todayStats = {
    total: todayAppointments.length,
    confirmed: todayAppointments.filter(apt => apt.status === 'CONFIRMED').length,
    pending: todayAppointments.filter(apt => apt.status === 'PENDING').length
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <NutritionistLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Agenda de Consultas
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus agendamentos e horários disponíveis
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsCreatingSlot(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar Horários
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Estatísticas do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Consultas Hoje</p>
                  <p className="text-2xl font-bold">{todayStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Check className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Confirmadas</p>
                  <p className="text-2xl font-bold">{todayStats.confirmed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold">{pendingAppointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Próxima</p>
                  <p className="text-lg font-bold">
                    {todayAppointments.length > 0 ? todayAppointments[0].time : '--:--'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navegação de Data */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold">{formatDate(selectedDate)}</h2>
                <p className="text-sm text-muted-foreground">
                  {todayAppointments.length} consultas agendadas
                </p>
              </div>
              
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="agenda" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="agenda">Agenda do Dia</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Agenda do Dia */}
          <TabsContent value="agenda" className="space-y-4 mt-6">
            {todayAppointments.length > 0 ? (
              <div className="space-y-4">
                {todayAppointments.map((appointment) => (
                  <Card key={appointment.id} className="border-l-4 border-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-xl font-bold text-green-600">{appointment.time}</p>
                            <p className="text-xs text-muted-foreground">{appointment.duration}min</p>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium">{appointment.patient.name}</h3>
                              <Badge className={statusConfig[appointment.status].color}>
                                {statusConfig[appointment.status].label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{appointmentTypes[appointment.type]}</p>
                            <p className="text-xs text-muted-foreground">{appointment.notes}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs">{appointment.patient.phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {appointment.location === 'Online' ? (
                                  <Video className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                )}
                                <span className="text-xs">{appointment.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {appointment.status === 'SCHEDULED' && (
                            <Button size="sm" variant="outline">
                              <Check className="h-3 w-3 mr-1" />
                              Confirmar
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="outline">
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma consulta agendada para hoje</p>
                <p className="text-sm text-muted-foreground">Aproveite para organizar suas atividades</p>
              </div>
            )}
          </TabsContent>

          {/* Agendamentos Pendentes */}
          <TabsContent value="pending" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span>Agendamentos Pendentes de Confirmação</span>
                </CardTitle>
                <CardDescription>
                  Solicitações de agendamento que precisam da sua aprovação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-bold text-yellow-700">
                              {new Date(appointment.date).getDate()}
                            </p>
                            <p className="text-xs text-yellow-600">
                              {new Date(appointment.date).toLocaleDateString('pt-BR', { month: 'short' })}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">{appointment.patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.time} - {appointmentTypes[appointment.type]}
                            </p>
                            <p className="text-xs text-muted-foreground">{appointment.notes}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm">
                            <Check className="h-3 w-3 mr-1" />
                            Aprovar
                          </Button>
                          <Button size="sm" variant="outline">
                            <X className="h-3 w-3 mr-1" />
                            Recusar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Check className="h-12 w-12 text-green-300 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum agendamento pendente</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendário Visual */}
          <TabsContent value="calendar" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendário da Semana</CardTitle>
                <CardDescription>
                  Visão geral dos horários e disponibilidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-2">
                  <div className="font-medium text-center p-2">Horário</div>
                  {weekDays.map(day => (
                    <div key={day} className="font-medium text-center p-2">{day}</div>
                  ))}
                  
                  {timeSlots.map(time => (
                    <div key={time} className="contents">
                      <div className="text-sm text-muted-foreground p-2 text-center">{time}</div>
                      {weekDays.map((day, dayIndex) => {
                        const hasAppointment = Math.random() > 0.7
                        return (
                          <div 
                            key={`${day}-${time}`}
                            className={`p-2 border rounded text-xs text-center cursor-pointer ${
                              hasAppointment 
                                ? 'bg-green-100 border-green-300 text-green-700' 
                                : 'bg-muted/50 border-border hover:bg-muted'
                            }`}
                          >
                            {hasAppointment ? 'Ocupado' : 'Livre'}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Agenda</CardTitle>
                <CardDescription>
                  Configure seus horários de trabalho e disponibilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Horário de Funcionamento</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="start-time" className="text-sm">Início</Label>
                      <Input id="start-time" type="time" defaultValue="08:00" />
                    </div>
                    <div>
                      <Label htmlFor="end-time" className="text-sm">Fim</Label>
                      <Input id="end-time" type="time" defaultValue="18:00" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Duração Padrão das Consultas</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button variant="outline" size="sm">30 min</Button>
                    <Button variant="default" size="sm">60 min</Button>
                    <Button variant="outline" size="sm">90 min</Button>
                  </div>
                </div>

                <div>
                  <Label>Intervalo entre Consultas</Label>
                  <Input type="number" defaultValue="15" className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">Minutos de intervalo entre consultas</p>
                </div>

                <Button>Salvar Configurações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </NutritionistLayout>
  )
}