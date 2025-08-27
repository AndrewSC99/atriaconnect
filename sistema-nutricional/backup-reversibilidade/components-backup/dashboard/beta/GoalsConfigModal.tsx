'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Target, 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp,
  Save,
  RotateCcw
} from 'lucide-react'

interface Goal {
  id: string
  title: string
  current: number
  target: number
  unit: string
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  category: 'financial' | 'patients' | 'consultations' | 'growth'
}

interface GoalsConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (goals: Goal[]) => void
  currentGoals?: Goal[]
}

const defaultGoals: Goal[] = [
  {
    id: 'monthly-revenue',
    title: 'Receita Mensal',
    current: 8450,
    target: 10000,
    unit: 'R$',
    period: 'monthly',
    category: 'financial'
  },
  {
    id: 'active-patients',
    title: 'Pacientes Ativos',
    current: 12,
    target: 20,
    unit: '',
    period: 'monthly',
    category: 'patients'
  },
  {
    id: 'daily-consultations',
    title: 'Consultas por Dia',
    current: 5,
    target: 8,
    unit: '',
    period: 'daily',
    category: 'consultations'
  },
  {
    id: 'weekly-new-patients',
    title: 'Novos Pacientes por Semana',
    current: 2,
    target: 5,
    unit: '',
    period: 'weekly',
    category: 'growth'
  }
]

const getCategoryIcon = (category: Goal['category']) => {
  switch (category) {
    case 'financial':
      return <DollarSign className="h-4 w-4" />
    case 'patients':
      return <Users className="h-4 w-4" />
    case 'consultations':
      return <Calendar className="h-4 w-4" />
    case 'growth':
      return <TrendingUp className="h-4 w-4" />
    default:
      return <Target className="h-4 w-4" />
  }
}

const getCategoryColor = (category: Goal['category']) => {
  switch (category) {
    case 'financial':
      return 'text-green-600 bg-green-50'
    case 'patients':
      return 'text-blue-600 bg-blue-50'
    case 'consultations':
      return 'text-purple-600 bg-purple-50'
    case 'growth':
      return 'text-orange-600 bg-orange-50'
    default:
      return 'text-zinc-600 bg-zinc-50'
  }
}

export function GoalsConfigModal({ isOpen, onClose, onSave, currentGoals }: GoalsConfigModalProps) {
  const [goals, setGoals] = useState<Goal[]>(currentGoals || defaultGoals)
  const [selectedCategory, setSelectedCategory] = useState<'all' | Goal['category']>('all')

  const updateGoal = (id: string, field: keyof Goal, value: any) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, [field]: value } : goal
    ))
  }

  const resetToDefaults = () => {
    setGoals([...defaultGoals])
  }

  const handleSave = () => {
    onSave(goals)
    onClose()
  }

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory)

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Configurar Metas
          </DialogTitle>
          <DialogDescription>
            Defina suas metas e acompanhe o progresso do seu consultório
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="consultations">Consultas</TabsTrigger>
            <TabsTrigger value="growth">Crescimento</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGoals.map((goal) => (
                <Card key={goal.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{goal.title}</CardTitle>
                      <div className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}>
                        {getCategoryIcon(goal.category)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {goal.period === 'daily' && 'Diário'}
                        {goal.period === 'weekly' && 'Semanal'}
                        {goal.period === 'monthly' && 'Mensal'}
                        {goal.period === 'yearly' && 'Anual'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {getProgress(goal.current, goal.target).toFixed(0)}% da meta
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`current-${goal.id}`} className="text-xs">
                        Valor Atual
                      </Label>
                      <div className="flex items-center gap-2">
                        {goal.unit && <span className="text-sm text-muted-foreground">{goal.unit}</span>}
                        <Input
                          id={`current-${goal.id}`}
                          type="number"
                          value={goal.current}
                          onChange={(e) => updateGoal(goal.id, 'current', parseFloat(e.target.value) || 0)}
                          className="text-sm"
                          disabled
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`target-${goal.id}`} className="text-xs">
                        Meta
                      </Label>
                      <div className="flex items-center gap-2">
                        {goal.unit && <span className="text-sm text-muted-foreground">{goal.unit}</span>}
                        <Input
                          id={`target-${goal.id}`}
                          type="number"
                          value={goal.target}
                          onChange={(e) => updateGoal(goal.id, 'target', parseFloat(e.target.value) || 0)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{getProgress(goal.current, goal.target).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            getProgress(goal.current, goal.target) >= 100 
                              ? 'bg-green-500' 
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(getProgress(goal.current, goal.target), 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={resetToDefaults} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrão
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar Metas
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}