'use client'

import { PatientLayout } from '@/components/layouts/patient-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Apple, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'

export default function PatientDashboard() {
  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso nutricional
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Apple className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Refeições Hoje</p>
                  <p className="text-2xl font-bold">3/5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Peso Atual</p>
                  <p className="text-2xl font-bold">78.5kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Meta Semanal</p>
                  <p className="text-2xl font-bold">-0.5kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Próxima Consulta</p>
                  <p className="text-sm font-bold">15 Nov</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dieta de Hoje */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Apple className="h-5 w-5" />
                <span>Minha Dieta de Hoje</span>
              </CardTitle>
              <CardDescription>
                Acompanhe suas refeições programadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Café da Manhã</p>
                  <p className="text-sm text-muted-foreground">8:00 - Concluído</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Lanche da Manhã</p>
                  <p className="text-sm text-muted-foreground">10:30 - Concluído</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Almoço</p>
                  <p className="text-sm text-muted-foreground">12:30 - Concluído</p>
                </div>
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Lanche da Tarde</p>
                  <p className="text-sm text-muted-foreground">15:30 - Pendente</p>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Jantar</p>
                  <p className="text-sm text-muted-foreground">19:00 - Pendente</p>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Checklist de Hábitos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>Checklist de Hoje</span>
              </CardTitle>
              <CardDescription>
                Hábitos saudáveis para manter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Beber 2L de água</span>
                <Badge variant="default">Concluído</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">30min de exercício</span>
                <Badge variant="default">Concluído</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Comer 5 porções de frutas/vegetais</span>
                <Badge variant="secondary">3/5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Dormir 8 horas</span>
                <Badge variant="outline">Pendente</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tomar medicamentos</span>
                <Badge variant="outline">Pendente</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progresso Semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Progresso da Semana</CardTitle>
            <CardDescription>
              Seu desempenho nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                <div key={day} className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">{day}</p>
                  <div className={`h-16 rounded ${
                    index < 5 ? 'bg-green-200' : 'bg-muted'
                  } flex items-center justify-center`}>
                    {index < 5 && (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  )
}