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
  Plus,
  Search,
  Utensils,
  Calendar,
  TrendingUp,
  Edit,
  Trash2
} from 'lucide-react'

const mockFoodLog = [
  {
    id: 1,
    date: "2024-11-16",
    mealType: "BREAKFAST",
    foodName: "Pão integral",
    quantity: 2,
    unit: "fatias",
    calories: 160,
    protein: 6,
    carbs: 30,
    fat: 2
  },
  {
    id: 2,
    date: "2024-11-16",
    mealType: "BREAKFAST",
    foodName: "Café com leite desnatado",
    quantity: 1,
    unit: "xícara",
    calories: 80,
    protein: 4,
    carbs: 8,
    fat: 1
  },
  {
    id: 3,
    date: "2024-11-16",
    mealType: "LUNCH",
    foodName: "Peito de frango grelhado",
    quantity: 100,
    unit: "g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6
  }
]

const mealTypes = {
  BREAKFAST: "Café da Manhã",
  MORNING_SNACK: "Lanche da Manhã", 
  LUNCH: "Almoço",
  AFTERNOON_SNACK: "Lanche da Tarde",
  DINNER: "Jantar",
  EVENING_SNACK: "Ceia"
}

export default function PatientFoodLog() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingFood, setIsAddingFood] = useState(false)

  const todayLogs = mockFoodLog.filter(log => log.date === selectedDate)
  
  const totalCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0)
  const totalProtein = todayLogs.reduce((sum, log) => sum + log.protein, 0)
  const totalCarbs = todayLogs.reduce((sum, log) => sum + log.carbs, 0)
  const totalFat = todayLogs.reduce((sum, log) => sum + log.fat, 0)

  const logsByMeal = Object.keys(mealTypes).reduce((acc, mealType) => {
    acc[mealType] = todayLogs.filter(log => log.mealType === mealType)
    return acc
  }, {} as Record<string, typeof todayLogs>)

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Registro Alimentar
            </h1>
            <p className="text-muted-foreground">
              Registre suas refeições diárias
            </p>
          </div>
          <div className="flex space-x-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <Button onClick={() => setIsAddingFood(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Resumo Nutricional do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Resumo Nutricional</span>
            </CardTitle>
            <CardDescription>
              {new Date(selectedDate).toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{totalCalories}</p>
                <p className="text-sm text-muted-foreground">kcal consumidas</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{totalProtein.toFixed(1)}g</p>
                <p className="text-sm text-muted-foreground">Proteína</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{totalCarbs.toFixed(1)}g</p>
                <p className="text-sm text-muted-foreground">Carboidrato</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{totalFat.toFixed(1)}g</p>
                <p className="text-sm text-muted-foreground">Gordura</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Meta calórica: 1800 kcal</span>
                <span className={totalCalories > 1800 ? 'text-red-600' : 'text-green-600'}>
                  {totalCalories > 1800 ? '+' : ''}{totalCalories - 1800} kcal
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${totalCalories > 1800 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{width: `${Math.min((totalCalories / 1800) * 100, 100)}%`}}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refeições do Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Refeições Registradas</CardTitle>
            <CardDescription>
              Alimentos consumidos por refeição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="BREAKFAST">Café</TabsTrigger>
                <TabsTrigger value="MORNING_SNACK">L. Manhã</TabsTrigger>
                <TabsTrigger value="LUNCH">Almoço</TabsTrigger>
                <TabsTrigger value="AFTERNOON_SNACK">L. Tarde</TabsTrigger>
                <TabsTrigger value="DINNER">Jantar</TabsTrigger>
                <TabsTrigger value="EVENING_SNACK">Ceia</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4 mt-6">
                {Object.entries(mealTypes).map(([mealType, mealName]) => {
                  const mealLogs = logsByMeal[mealType]
                  if (mealLogs.length === 0) return null
                  
                  const mealCalories = mealLogs.reduce((sum, log) => sum + log.calories, 0)
                  
                  return (
                    <Card key={mealType} className="border-l-4 border-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Utensils className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-medium">{mealName}</h3>
                            <Badge variant="secondary">{mealCalories} kcal</Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {mealLogs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{log.foodName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {log.quantity} {log.unit} • {log.calories} kcal • 
                                  P: {log.protein}g • C: {log.carbs}g • G: {log.fat}g
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                
                {todayLogs.length === 0 && (
                  <div className="text-center py-8">
                    <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma refeição registrada para este dia</p>
                    <Button className="mt-4" onClick={() => setIsAddingFood(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar primeiro alimento
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Tabs individuais para cada refeição */}
              {Object.entries(mealTypes).map(([mealType, mealName]) => (
                <TabsContent key={mealType} value={mealType} className="space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{mealName}</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar alimento
                    </Button>
                  </div>
                  
                  {logsByMeal[mealType].length > 0 ? (
                    <div className="space-y-2">
                      {logsByMeal[mealType].map((log) => (
                        <Card key={log.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{log.foodName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {log.quantity} {log.unit} • {log.calories} kcal
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Proteína: {log.protein}g • Carboidrato: {log.carbs}g • Gordura: {log.fat}g
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum alimento registrado para {mealName.toLowerCase()}</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Busca de Alimentos */}
        {isAddingFood && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Buscar Alimento</span>
              </CardTitle>
              <CardDescription>
                Encontre e adicione alimentos ao seu registro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Digite o nome do alimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button>Buscar</Button>
                <Button variant="outline" onClick={() => setIsAddingFood(false)}>
                  Cancelar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alimentos sugeridos */}
                <Card className="cursor-pointer hover:bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium">Banana média</h4>
                    <p className="text-sm text-muted-foreground">105 kcal por unidade</p>
                    <p className="text-xs text-muted-foreground">P: 1.3g • C: 27g • G: 0.3g</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium">Arroz integral cozido</h4>
                    <p className="text-sm text-muted-foreground">112 kcal por 100g</p>
                    <p className="text-xs text-muted-foreground">P: 2.6g • C: 22g • G: 0.9g</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientLayout>
  )
}