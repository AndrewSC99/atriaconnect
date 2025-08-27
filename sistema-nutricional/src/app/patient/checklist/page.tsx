'use client'

import { useState } from 'react'
import { PatientLayout } from '@/components/layouts/patient-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { 
  CheckCircle,
  Calendar,
  TrendingUp,
  Target,
  Droplets,
  Activity,
  Moon,
  Apple,
  Pill,
  Plus
} from 'lucide-react'

const defaultHabits = [
  {
    id: 'water',
    label: 'Beber 2L de água',
    icon: Droplets,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    target: '2L',
    current: '1.5L'
  },
  {
    id: 'exercise',
    label: '30min de exercício',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    target: '30min',
    current: '45min'
  },
  {
    id: 'sleep',
    label: 'Dormir 8 horas',
    icon: Moon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    target: '8h',
    current: '7h'
  },
  {
    id: 'fruits',
    label: 'Comer 5 porções de frutas/vegetais',
    icon: Apple,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    target: '5 porções',
    current: '3 porções'
  },
  {
    id: 'medication',
    label: 'Tomar medicamentos prescritos',
    icon: Pill,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    target: 'Todos',
    current: 'Pendente'
  }
]

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

// Mock data para histórico semanal
const weeklyProgress = [
  { day: 'Dom', completed: 3, total: 5 },
  { day: 'Seg', completed: 5, total: 5 },
  { day: 'Ter', completed: 4, total: 5 },
  { day: 'Qua', completed: 5, total: 5 },
  { day: 'Qui', completed: 4, total: 5 },
  { day: 'Sex', completed: 3, total: 5 },
  { day: 'Sáb', completed: 2, total: 5 }
]

export default function PatientChecklist() {
  const [checkedHabits, setCheckedHabits] = useState<Record<string, boolean>>({
    water: true,
    exercise: true,
    sleep: false,
    fruits: false,
    medication: false
  })

  const [customHabit, setCustomHabit] = useState('')
  const [isAddingHabit, setIsAddingHabit] = useState(false)

  const completedCount = Object.values(checkedHabits).filter(Boolean).length
  const totalHabits = defaultHabits.length
  const completionPercentage = Math.round((completedCount / totalHabits) * 100)

  const handleHabitToggle = (habitId: string) => {
    setCheckedHabits(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }))
  }

  const weeklyAverage = Math.round(
    weeklyProgress.reduce((sum, day) => sum + (day.completed / day.total * 100), 0) / weeklyProgress.length
  )

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Checklist de Hábitos
            </h1>
            <p className="text-muted-foreground">
              Acompanhe seus hábitos saudáveis diários
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Hoje, {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Resumo do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hábitos Concluídos</p>
                  <p className="text-2xl font-bold">{completedCount}/{totalHabits}</p>
                  <p className="text-xs text-green-600">{completionPercentage}% do dia</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Média Semanal</p>
                  <p className="text-2xl font-bold">{weeklyAverage}%</p>
                  <p className="text-xs text-blue-600">Últimos 7 dias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meta Diária</p>
                  <p className="text-2xl font-bold">80%</p>
                  <p className="text-xs text-purple-600">4 de 5 hábitos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progresso do Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso de Hoje</CardTitle>
            <CardDescription>
              {completionPercentage}% dos hábitos concluídos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {completedCount === totalHabits 
                ? "🎉 Parabéns! Você completou todos os hábitos hoje!" 
                : `Faltam ${totalHabits - completedCount} hábitos para completar o dia`
              }
            </p>
          </CardContent>
        </Card>

        {/* Lista de Hábitos */}
        <Card>
          <CardHeader>
            <CardTitle>Hábitos de Hoje</CardTitle>
            <CardDescription>
              Marque os hábitos conforme você os completa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultHabits.map((habit) => {
              const Icon = habit.icon
              const isCompleted = checkedHabits[habit.id]
              
              return (
                <div
                  key={habit.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    isCompleted 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-border bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => handleHabitToggle(habit.id)}
                      className="h-5 w-5"
                    />
                    
                    <div className={`p-2 rounded-full ${habit.bgColor}`}>
                      <Icon className={`h-5 w-5 ${habit.color}`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                          {habit.label}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant={isCompleted ? "default" : "outline"}>
                            {isCompleted ? "Concluído" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-muted-foreground">
                          Meta: {habit.target}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Atual: {habit.current}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Botão para adicionar hábito customizado */}
            {!isAddingHabit ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsAddingHabit(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Hábito Personalizado
              </Button>
            ) : (
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Digite seu hábito personalizado..."
                    value={customHabit}
                    onChange={(e) => setCustomHabit(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm">Adicionar</Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsAddingHabit(false)
                      setCustomHabit('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico Semanal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Histórico da Semana</span>
            </CardTitle>
            <CardDescription>
              Seu desempenho nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {weeklyProgress.map((day, index) => {
                const percentage = (day.completed / day.total) * 100
                const isToday = index === new Date().getDay()
                
                return (
                  <div key={day.day} className="text-center">
                    <p className="text-xs text-muted-foreground mb-2">{day.day}</p>
                    <div className={`h-20 rounded-lg border-2 flex flex-col items-center justify-center ${
                      isToday 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-border bg-muted/50'
                    }`}>
                      <div className={`text-lg font-bold ${
                        percentage >= 80 ? 'text-green-600' :
                        percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(percentage)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {day.completed}/{day.total}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dicas e Motivação */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Dicas para Manter os Hábitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Consistência é a chave</h4>
                <p className="text-sm text-blue-700">
                  Fazer um pouco todos os dias é melhor que fazer muito esporadicamente.
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Comemore pequenas vitórias</h4>
                <p className="text-sm text-green-700">
                  Cada hábito completado é um passo em direção aos seus objetivos.
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Não seja muito rígido</h4>
                <p className="text-sm text-purple-700">
                  Se falhar um dia, apenas retome no dia seguinte. O importante é não desistir.
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Ajuste conforme necessário</h4>
                <p className="text-sm text-orange-700">
                  Adapte seus hábitos conforme sua rotina e necessidades mudam.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  )
}