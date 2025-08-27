'use client'

import { useState } from 'react'
import { PatientLayout } from '@/components/layouts/patient-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  AlertCircle
} from 'lucide-react'

const mockAppointments = [
  {
    id: 1,
    date: "2024-11-24",
    time: "14:00",
    type: "CONSULTATION",
    status: "SCHEDULED",
    nutritionist: "Dra. Maria Silva",
    location: "Presencial - Consultório",
    notes: "Consulta de acompanhamento mensal"
  },
  {
    id: 2,
    date: "2024-11-10",
    time: "10:30",
    type: "FOLLOWUP",
    status: "COMPLETED",
    nutritionist: "Dra. Maria Silva", 
    location: "Online - Zoom",
    notes: "Avaliação de progresso"
  },
  {
    id: 3,
    date: "2024-10-27",
    time: "15:00",
    type: "CONSULTATION",
    status: "COMPLETED",
    nutritionist: "Dra. Maria Silva",
    location: "Presencial - Consultório", 
    notes: "Primeira consulta - avaliação inicial"
  }
]

const availableSlots = [
  { date: "2024-11-20", time: "09:00", available: true },
  { date: "2024-11-20", time: "10:00", available: true },
  { date: "2024-11-20", time: "14:00", available: false },
  { date: "2024-11-20", time: "15:00", available: true },
  { date: "2024-11-21", time: "09:00", available: true },
  { date: "2024-11-21", time: "11:00", available: true },
  { date: "2024-11-22", time: "08:30", available: true },
  { date: "2024-11-22", time: "16:00", available: true }
]

const appointmentTypes = {
  CONSULTATION: "Consulta",
  FOLLOWUP: "Acompanhamento",
  EVALUATION: "Avaliação"
}

const statusConfig = {
  SCHEDULED: { label: "Agendado", color: "bg-blue-600", textColor: "text-blue-600" },
  CONFIRMED: { label: "Confirmado", color: "bg-green-600", textColor: "text-green-600" },
  COMPLETED: { label: "Realizado", color: "bg-slate-600", textColor: "text-muted-foreground" },
  CANCELLED: { label: "Cancelado", color: "bg-red-600", textColor: "text-red-600" }
}

export default function PatientAppointments() {
  const [isScheduling, setIsScheduling] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('CONSULTATION')
  const [notes, setNotes] = useState('')

  const upcomingAppointments = mockAppointments.filter(apt => 
    apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
  )
  const pastAppointments = mockAppointments.filter(apt => 
    apt.status === 'COMPLETED' || apt.status === 'CANCELLED'
  )

  const nextAppointment = upcomingAppointments[0]

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Meus Agendamentos
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas consultas e acompanhamentos
            </p>
          </div>
          <Button onClick={() => setIsScheduling(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agendar Consulta
          </Button>
        </div>

        {/* Próxima Consulta */}
        {nextAppointment && (
          <Card className="border-l-4 border-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Próxima Consulta</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(nextAppointment.date).toLocaleDateString('pt-BR')} às {nextAppointment.time}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{nextAppointment.nutritionist}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {nextAppointment.location.includes('Online') ? (
                      <Video className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{nextAppointment.location}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge className={statusConfig[nextAppointment.status].color}>
                    {statusConfig[nextAppointment.status].label}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="h-3 w-3 mr-1" />
                      Ligar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="h-3 w-3 mr-1" />
                      Video
                    </Button>
                    <Button size="sm" variant="outline">
                      <X className="h-3 w-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
              {nextAppointment.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-foreground">{nextAppointment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Consultas Agendadas */}
        <Card>
          <CardHeader>
            <CardTitle>Consultas Agendadas</CardTitle>
            <CardDescription>
              Suas próximas consultas e acompanhamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {new Date(appointment.date).getDate()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(appointment.date).toLocaleDateString('pt-BR', { month: 'short' })}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{appointmentTypes[appointment.type]}</p>
                        <p className="text-sm text-muted-foreground">{appointment.time} - {appointment.nutritionist}</p>
                        <p className="text-xs text-muted-foreground">{appointment.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={statusConfig[appointment.status].color}>
                        {statusConfig[appointment.status].label}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma consulta agendada</p>
                <Button className="mt-4" onClick={() => setIsScheduling(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar primeira consulta
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Consultas</CardTitle>
            <CardDescription>
              Consultas anteriores realizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {new Date(appointment.date).getDate()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString('pt-BR', { month: 'short' })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{appointmentTypes[appointment.type]}</p>
                      <p className="text-xs text-muted-foreground">{appointment.time} - {appointment.nutritionist}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className={statusConfig[appointment.status].color}>
                      {statusConfig[appointment.status].label}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      Ver relatório
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Form de Agendamento */}
        {isScheduling && (
          <Card>
            <CardHeader>
              <CardTitle>Agendar Nova Consulta</CardTitle>
              <CardDescription>
                Escolha o melhor horário para sua consulta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seleção de Tipo */}
              <div>
                <Label>Tipo de Consulta</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {Object.entries(appointmentTypes).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={appointmentType === key ? "default" : "outline"}
                      onClick={() => setAppointmentType(key)}
                      size="sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Seleção de Data e Horário */}
              <div>
                <Label>Horários Disponíveis</Label>
                <div className="mt-2 space-y-4">
                  {Object.values(
                    availableSlots.reduce((acc, slot) => {
                      if (!acc[slot.date]) acc[slot.date] = []
                      acc[slot.date].push(slot)
                      return acc
                    }, {} as Record<string, typeof availableSlots>)
                  ).map((daySlots) => (
                    <div key={daySlots[0].date}>
                      <p className="font-medium mb-2">
                        {new Date(daySlots[0].date).toLocaleDateString('pt-BR', { 
                          weekday: 'long', 
                          day: 'numeric', 
                          month: 'long' 
                        })}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {daySlots.map((slot) => (
                          <Button
                            key={`${slot.date}-${slot.time}`}
                            variant={
                              selectedDate === slot.date && selectedTime === slot.time 
                                ? "default" 
                                : "outline"
                            }
                            disabled={!slot.available}
                            onClick={() => {
                              setSelectedDate(slot.date)
                              setSelectedTime(slot.time)
                            }}
                            size="sm"
                            className={!slot.available ? "opacity-50" : ""}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Descreva o motivo da consulta ou questões específicas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Resumo da Consulta */}
              {selectedDate && selectedTime && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Resumo da Consulta</h4>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p><strong>Tipo:</strong> {appointmentTypes[appointmentType]}</p>
                    <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                    <p><strong>Nutricionista:</strong> Dra. Maria Silva</p>
                    <p><strong>Local:</strong> Consultório - Rua das Flores, 123</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button 
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1"
                >
                  Confirmar Agendamento
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsScheduling(false)
                    setSelectedDate('')
                    setSelectedTime('')
                    setNotes('')
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientLayout>
  )
}