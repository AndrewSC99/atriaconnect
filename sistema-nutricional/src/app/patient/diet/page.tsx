'use client'

import { PatientLayout } from '@/components/layouts/patient-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Apple, 
  Clock,
  Utensils,
  Zap,
  Target,
  Download,
  Calendar
} from 'lucide-react'

const dietPlan = {
  name: "Plano de Emagrecimento Saudável",
  startDate: "01/11/2024",
  endDate: "30/11/2024",
  calories: 1800,
  protein: 135,
  carbs: 180,
  fat: 70,
  meals: {
    "Segunda": [
      {
        time: "08:00",
        type: "Café da Manhã",
        foods: [
          "1 xícara de café com leite desnatado",
          "2 fatias de pão integral",
          "1 col. sopa de requeijão light",
          "1 banana média"
        ],
        calories: 320,
        completed: true
      },
      {
        time: "10:30",
        type: "Lanche da Manhã",
        foods: [
          "1 iogurte natural desnatado",
          "1 col. sopa de granola"
        ],
        calories: 150,
        completed: true
      },
      {
        time: "12:30",
        type: "Almoço",
        foods: [
          "100g de peito de frango grelhado",
          "4 col. sopa de arroz integral",
          "2 col. sopa de feijão",
          "Salada verde à vontade",
          "1 col. chá de azeite"
        ],
        calories: 480,
        completed: true
      },
      {
        time: "15:30",
        type: "Lanche da Tarde",
        foods: [
          "1 maçã média",
          "10 castanhas do Brasil"
        ],
        calories: 180,
        completed: false
      },
      {
        time: "19:00",
        type: "Jantar",
        foods: [
          "100g de salmão grelhado",
          "2 col. sopa de quinoa",
          "Legumes refogados",
          "Salada de folhas verdes"
        ],
        calories: 420,
        completed: false
      },
      {
        time: "21:00",
        type: "Ceia",
        foods: [
          "1 xícara de chá de camomila",
          "2 biscoitos integrais"
        ],
        calories: 80,
        completed: false
      }
    ],
    "Terça": [
      // Similar structure for other days...
    ]
  }
}

export default function PatientDiet() {
  const todayMeals = dietPlan.meals["Segunda"] // Example for Monday

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Minha Dieta
            </h1>
            <p className="text-muted-foreground">
              Plano alimentar personalizado
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Ver Semana
            </Button>
          </div>
        </div>

        {/* Informações do Plano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>{dietPlan.name}</span>
            </CardTitle>
            <CardDescription>
              Período: {dietPlan.startDate} até {dietPlan.endDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{dietPlan.calories}</p>
                <p className="text-sm text-muted-foreground">kcal/dia</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-lg font-bold">{dietPlan.protein}g</p>
                <p className="text-sm text-muted-foreground">Proteína</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-lg font-bold">{dietPlan.carbs}g</p>
                <p className="text-sm text-muted-foreground">Carboidrato</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-bold">{dietPlan.fat}g</p>
                <p className="text-sm text-muted-foreground">Gordura</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para dias da semana */}
        <Card>
          <CardHeader>
            <CardTitle>Plano Semanal</CardTitle>
            <CardDescription>
              Selecione o dia para ver as refeições programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hoje" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="hoje">Hoje</TabsTrigger>
                <TabsTrigger value="segunda">Seg</TabsTrigger>
                <TabsTrigger value="terca">Ter</TabsTrigger>
                <TabsTrigger value="quarta">Qua</TabsTrigger>
                <TabsTrigger value="quinta">Qui</TabsTrigger>
                <TabsTrigger value="sexta">Sex</TabsTrigger>
                <TabsTrigger value="sabado">Sáb</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hoje" className="space-y-4 mt-6">
                <div className="space-y-4">
                  {todayMeals.map((meal, index) => (
                    <Card key={index} className={`${
                      meal.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                              meal.completed ? 'bg-green-600' : 'bg-slate-200'
                            }`}>
                              <Utensils className={`h-4 w-4 ${
                                meal.completed ? 'text-white' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-medium">{meal.type}</h3>
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{meal.time}</span>
                                <span>•</span>
                                <span>{meal.calories} kcal</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={meal.completed ? "default" : "outline"}>
                            {meal.completed ? "Concluído" : "Pendente"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          {meal.foods.map((food, foodIndex) => (
                            <div key={foodIndex} className="flex items-center space-x-2">
                              <Apple className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{food}</span>
                            </div>
                          ))}
                        </div>
                        
                        {!meal.completed && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <Button size="sm" variant="outline" className="w-full">
                              Marcar como Consumido
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="segunda" className="space-y-4 mt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Plano detalhado para Segunda-feira</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Funcionalidade em desenvolvimento
                  </p>
                </div>
              </TabsContent>

              {/* Outras tabs seguem o mesmo padrão */}
            </Tabs>
          </CardContent>
        </Card>

        {/* Progresso do Dia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Progresso de Hoje</CardTitle>
              <CardDescription>
                Calorias e macronutrientes consumidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calorias</span>
                    <span>950 / 1800 kcal</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '52%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Proteína</span>
                    <span>68 / 135g</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-red-600 h-2 rounded-full" style={{width: '50%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Carboidrato</span>
                    <span>95 / 180g</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '53%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Gordura</span>
                    <span>32 / 70g</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '46%'}}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dicas do Nutricionista</CardTitle>
              <CardDescription>
                Orientações para hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm">
                    💧 Lembre-se de beber pelo menos 2 litros de água ao longo do dia
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm">
                    🥗 Priorize os vegetais no almoço - eles ajudam na saciedade
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm">
                    ⏰ Mantenha os horários das refeições para regular o metabolismo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientLayout>
  )
}