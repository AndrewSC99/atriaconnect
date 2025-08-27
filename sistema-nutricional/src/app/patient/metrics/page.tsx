'use client'

import { useState } from 'react'
import { PatientLayout } from '@/components/layouts/patient-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp,
  TrendingDown,
  Target,
  Plus,
  Calendar,
  Scale,
  Ruler,
  Activity
} from 'lucide-react'

// Mock data para os gráficos
const weightData = [
  { date: '01/11', weight: 82.5, goal: 80 },
  { date: '08/11', weight: 81.8, goal: 80 },
  { date: '15/11', weight: 80.9, goal: 80 },
  { date: '22/11', weight: 80.2, goal: 80 },
  { date: '29/11', weight: 79.8, goal: 80 },
  { date: '06/12', weight: 79.2, goal: 80 },
  { date: '13/12', weight: 78.9, goal: 80 }
]

const bodyCompositionData = [
  { date: '01/11', bodyFat: 22.5, muscleMass: 28.2 },
  { date: '15/11', bodyFat: 21.8, muscleMass: 28.8 },
  { date: '29/11', bodyFat: 21.2, muscleMass: 29.1 },
  { date: '13/12', bodyFat: 20.6, muscleMass: 29.5 }
]

const measurementsData = [
  { date: '01/11', waist: 92, hip: 98, arm: 32, thigh: 58 },
  { date: '15/11', waist: 90, hip: 97, arm: 32.5, thigh: 57 },
  { date: '29/11', waist: 88, hip: 96, arm: 33, thigh: 56 },
  { date: '13/12', waist: 86, hip: 95, arm: 33.2, thigh: 55 }
]

const currentMetrics = {
  weight: 78.9,
  height: 175,
  bmi: 25.8,
  bodyFat: 20.6,
  muscleMass: 29.5,
  waist: 86,
  goal: 'Perder 3kg até dezembro'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function PatientMetrics() {
  const [isAddingMetric, setIsAddingMetric] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('weight')

  const bmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-600' }
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-600' }
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-600' }
    return { text: 'Obesidade', color: 'text-red-600' }
  }

  const weightTrend = weightData.length > 1 
    ? weightData[weightData.length - 1].weight - weightData[weightData.length - 2].weight
    : 0

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Minhas Métricas
            </h1>
            <p className="text-muted-foreground">
              Acompanhe sua evolução física
            </p>
          </div>
          <Button onClick={() => setIsAddingMetric(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Medição
          </Button>
        </div>

        {/* Métricas Atuais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Scale className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Peso Atual</p>
                  <p className="text-2xl font-bold">{currentMetrics.weight}kg</p>
                  <div className="flex items-center space-x-1">
                    {weightTrend < 0 ? (
                      <TrendingDown className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingUp className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs ${weightTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(weightTrend).toFixed(1)}kg
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Ruler className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">IMC</p>
                  <p className="text-2xl font-bold">{currentMetrics.bmi}</p>
                  <p className={`text-xs ${bmiCategory(currentMetrics.bmi).color}`}>
                    {bmiCategory(currentMetrics.bmi).text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gordura Corporal</p>
                  <p className="text-2xl font-bold">{currentMetrics.bodyFat}%</p>
                  <p className="text-xs text-green-600">↓ 1.9% este mês</p>
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
                  <p className="text-sm text-muted-foreground">Massa Muscular</p>
                  <p className="text-2xl font-bold">{currentMetrics.muscleMass}kg</p>
                  <p className="text-xs text-green-600">↑ 1.3kg este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meta Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Meta Atual</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentMetrics.goal}</p>
                <p className="text-sm text-muted-foreground">Progresso: 2.6kg perdidos de 3kg meta</p>
              </div>
              <div className="text-right">
                <Badge variant="default" className="bg-green-600">87% completo</Badge>
                <div className="w-32 bg-slate-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução das Métricas</CardTitle>
            <CardDescription>
              Acompanhe seu progresso ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="weight" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="weight">Peso</TabsTrigger>
                <TabsTrigger value="composition">Composição</TabsTrigger>
                <TabsTrigger value="measurements">Medidas</TabsTrigger>
                <TabsTrigger value="summary">Resumo</TabsTrigger>
              </TabsList>
              
              <TabsContent value="weight" className="space-y-4 mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#2563eb" 
                        strokeWidth={3}
                        name="Peso (kg)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="goal" 
                        stroke="#dc2626" 
                        strokeDasharray="5 5"
                        name="Meta (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="composition" className="space-y-4 mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bodyCompositionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="bodyFat" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        name="Gordura Corporal (%)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="muscleMass" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Massa Muscular (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="measurements" className="space-y-4 mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={measurementsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="waist" fill="#8884d8" name="Cintura (cm)" />
                      <Bar dataKey="hip" fill="#82ca9d" name="Quadril (cm)" />
                      <Bar dataKey="arm" fill="#ffc658" name="Braço (cm)" />
                      <Bar dataKey="thigh" fill="#ff7300" name="Coxa (cm)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="summary" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribuição Corporal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Massa Muscular', value: currentMetrics.muscleMass },
                                { name: 'Gordura', value: (currentMetrics.weight * currentMetrics.bodyFat / 100) },
                                { name: 'Outros', value: currentMetrics.weight - currentMetrics.muscleMass - (currentMetrics.weight * currentMetrics.bodyFat / 100) }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: 'Massa Muscular', value: currentMetrics.muscleMass },
                                { name: 'Gordura', value: (currentMetrics.weight * currentMetrics.bodyFat / 100) },
                                { name: 'Outros', value: currentMetrics.weight - currentMetrics.muscleMass - (currentMetrics.weight * currentMetrics.bodyFat / 100) }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estatísticas do Mês</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Peso perdido:</span>
                        <span className="font-bold text-green-600">-2.6kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gordura reduzida:</span>
                        <span className="font-bold text-green-600">-1.9%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Músculo ganho:</span>
                        <span className="font-bold text-blue-600">+1.3kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cintura reduzida:</span>
                        <span className="font-bold text-green-600">-6cm</span>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between">
                          <span className="font-medium">Progresso geral:</span>
                          <Badge className="bg-green-600">Excelente</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Form para adicionar nova medição */}
        {isAddingMetric && (
          <Card>
            <CardHeader>
              <CardTitle>Nova Medição</CardTitle>
              <CardDescription>
                Registre suas medidas atuais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input id="weight" type="number" placeholder="78.5" />
                </div>
                <div>
                  <Label htmlFor="bodyFat">Gordura (%)</Label>
                  <Input id="bodyFat" type="number" placeholder="20.5" />
                </div>
                <div>
                  <Label htmlFor="muscleMass">Massa Muscular (kg)</Label>
                  <Input id="muscleMass" type="number" placeholder="29.5" />
                </div>
                <div>
                  <Label htmlFor="waist">Cintura (cm)</Label>
                  <Input id="waist" type="number" placeholder="86" />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button>Salvar Medição</Button>
                <Button variant="outline" onClick={() => setIsAddingMetric(false)}>
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