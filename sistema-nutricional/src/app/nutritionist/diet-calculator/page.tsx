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
import { AdvancedDietCreator } from '@/components/nutritionist/advanced-diet-creator'
import { 
  Calculator,
  Users,
  Target,
  Activity,
  Heart,
  Zap,
  TrendingUp,
  Save,
  Copy,
  FileText,
  Plus
} from 'lucide-react'
import { formatNutrient } from '@/utils/format'

interface PatientData {
  name: string
  age: number
  gender: 'MALE' | 'FEMALE'
  weight: number
  height: number
  activityLevel: string
  goal: string
  medicalConditions: string
}

interface NutritionalNeeds {
  bmr: number
  tdee: number
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
}

const activityLevels = {
  sedentary: { label: 'Sedentário', multiplier: 1.2, description: 'Pouco ou nenhum exercício' },
  light: { label: 'Levemente ativo', multiplier: 1.375, description: 'Exercício leve 1-3 dias/semana' },
  moderate: { label: 'Moderadamente ativo', multiplier: 1.55, description: 'Exercício moderado 3-5 dias/semana' },
  active: { label: 'Muito ativo', multiplier: 1.725, description: 'Exercício intenso 6-7 dias/semana' },
  extraActive: { label: 'Extremamente ativo', multiplier: 1.9, description: 'Exercício muito intenso, trabalho físico' }
}

const goals = {
  maintenance: { label: 'Manutenção', calorieAdjustment: 0, description: 'Manter peso atual' },
  weightLoss: { label: 'Perda de peso', calorieAdjustment: -500, description: 'Déficit de 500 kcal/dia' },
  weightGain: { label: 'Ganho de peso', calorieAdjustment: 500, description: 'Superávit de 500 kcal/dia' },
  moderateLoss: { label: 'Perda moderada', calorieAdjustment: -300, description: 'Déficit de 300 kcal/dia' },
  moderateGain: { label: 'Ganho moderado', calorieAdjustment: 300, description: 'Superávit de 300 kcal/dia' }
}

export default function DietCalculator() {
  const [patientData, setPatientData] = useState<PatientData>({
    name: '',
    age: 0,
    gender: 'FEMALE',
    weight: 0,
    height: 0,
    activityLevel: 'sedentary',
    goal: 'maintenance',
    medicalConditions: ''
  })

  const [results, setResults] = useState<NutritionalNeeds | null>(null)
  const [selectedPatient, setSelectedPatient] = useState('')
  const [activeTab, setActiveTab] = useState('calculator')

  const mockPatients = [
    { id: 1, name: "João Silva", age: 34, gender: "MALE" as const, weight: 78.5, height: 175 },
    { id: 2, name: "Maria Santos", age: 28, gender: "FEMALE" as const, weight: 65.2, height: 162 },
    { id: 3, name: "Pedro Costa", age: 42, gender: "MALE" as const, weight: 95.8, height: 180 },
    { id: 4, name: "Ana Oliveira", age: 31, gender: "FEMALE" as const, weight: 58.9, height: 158 }
  ]

  const calculateBMR = () => {
    const { age, gender, weight, height } = patientData
    
    if (!age || !weight || !height) return 0

    // Fórmula de Mifflin-St Jeor
    if (gender === 'MALE') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161
    }
  }

  const calculateNutritionalNeeds = () => {
    const bmr = calculateBMR()
    const activityMultiplier = activityLevels[patientData.activityLevel as keyof typeof activityLevels].multiplier
    const tdee = bmr * activityMultiplier
    const goalAdjustment = goals[patientData.goal as keyof typeof goals].calorieAdjustment
    const targetCalories = tdee + goalAdjustment

    // Distribuição de macronutrientes (baseada em diretrizes nutricionais)
    const proteinCalories = targetCalories * 0.15  // 15% proteína
    const carbCalories = targetCalories * 0.55     // 55% carboidrato
    const fatCalories = targetCalories * 0.30      // 30% gordura

    const protein = proteinCalories / 4  // 4 kcal/g
    const carbs = carbCalories / 4       // 4 kcal/g
    const fat = fatCalories / 9          // 9 kcal/g

    // Necessidade de água (35ml por kg de peso corporal)
    const water = patientData.weight * 35

    const nutritionalNeeds: NutritionalNeeds = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calories: Math.round(targetCalories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      water: Math.round(water)
    }

    setResults(nutritionalNeeds)
  }

  const loadPatientData = (patientId: string) => {
    const patient = mockPatients.find(p => p.id.toString() === patientId)
    if (patient) {
      setPatientData(prev => ({
        ...prev,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        weight: patient.weight,
        height: patient.height
      }))
      setSelectedPatient(patientId)
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-600', bg: 'bg-green-50' }
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { text: 'Obesidade', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const bmi = patientData.weight && patientData.height 
    ? patientData.weight / Math.pow(patientData.height / 100, 2) 
    : 0

  const bmiCategory = getBMICategory(bmi)

  return (
    <NutritionistLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Calculadora de Dieta
            </h1>
            <p className="text-muted-foreground">
              Calcule necessidades calóricas e macronutrientes, e crie planos alimentares
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              Copiar Resultados
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Salvar Plano
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Calculadora</span>
            </TabsTrigger>
            <TabsTrigger value="meal-plan" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Plano Alimentar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Dados */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Dados do Paciente</span>
                </CardTitle>
                <CardDescription>
                  Insira ou selecione os dados do paciente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Seleção de Paciente Existente */}
                <div>
                  <Label>Paciente Cadastrado (opcional)</Label>
                  <select 
                    className="w-full mt-2 p-2 border rounded-md"
                    value={selectedPatient}
                    onChange={(e) => loadPatientData(e.target.value)}
                  >
                    <option value="">Selecione um paciente existente</option>
                    {mockPatients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.age} anos
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={patientData.name}
                      onChange={(e) => setPatientData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite o nome do paciente"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={patientData.age || ''}
                      onChange={(e) => setPatientData(prev => ({ ...prev, age: Number(e.target.value) }))}
                      placeholder="anos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Sexo</Label>
                    <div className="flex space-x-2 mt-2">
                      <Button
                        variant={patientData.gender === 'FEMALE' ? 'default' : 'outline'}
                        onClick={() => setPatientData(prev => ({ ...prev, gender: 'FEMALE' }))}
                        size="sm"
                      >
                        Feminino
                      </Button>
                      <Button
                        variant={patientData.gender === 'MALE' ? 'default' : 'outline'}
                        onClick={() => setPatientData(prev => ({ ...prev, gender: 'MALE' }))}
                        size="sm"
                      >
                        Masculino
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={patientData.weight || ''}
                      onChange={(e) => setPatientData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                      placeholder="kg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={patientData.height || ''}
                      onChange={(e) => setPatientData(prev => ({ ...prev, height: Number(e.target.value) }))}
                      placeholder="cm"
                    />
                  </div>
                </div>

                {/* IMC */}
                {bmi > 0 && (
                  <div className={`p-3 rounded-lg ${bmiCategory.bg}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">IMC: {formatNutrient(bmi)}</span>
                      <Badge className={bmiCategory.color}>{bmiCategory.text}</Badge>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Nível de Atividade Física</Label>
                  <div className="space-y-2 mt-2">
                    {Object.entries(activityLevels).map(([key, level]) => (
                      <div key={key} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={key}
                          name="activityLevel"
                          checked={patientData.activityLevel === key}
                          onChange={() => setPatientData(prev => ({ ...prev, activityLevel: key }))}
                        />
                        <label htmlFor={key} className="flex-1">
                          <div className="font-medium">{level.label}</div>
                          <div className="text-sm text-muted-foreground">{level.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Objetivo</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {Object.entries(goals).map(([key, goal]) => (
                      <Button
                        key={key}
                        variant={patientData.goal === key ? 'default' : 'outline'}
                        onClick={() => setPatientData(prev => ({ ...prev, goal: key }))}
                        size="sm"
                        className="justify-start"
                      >
                        <div className="text-left">
                          <div className="font-medium">{goal.label}</div>
                          <div className="text-xs opacity-70">{goal.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="conditions">Condições Médicas (opcional)</Label>
                  <Textarea
                    id="conditions"
                    value={patientData.medicalConditions}
                    onChange={(e) => setPatientData(prev => ({ ...prev, medicalConditions: e.target.value }))}
                    placeholder="Diabetes, hipertensão, alergias alimentares, etc."
                  />
                </div>

                <Button onClick={calculateNutritionalNeeds} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular Necessidades Nutricionais
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Resultados */}
          <div className="space-y-6">
            {results ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>Necessidades Energéticas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{results.calories}</p>
                      <p className="text-sm text-muted-foreground">kcal/dia</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">TMB (Taxa Metabólica Basal)</span>
                        <span className="font-medium">{results.bmr} kcal</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">TDEE (Gasto Energético Total)</span>
                        <span className="font-medium">{results.tdee} kcal</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Calorias Alvo</span>
                        <span className="font-bold text-blue-600">{results.calories} kcal</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Macronutrientes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="font-medium text-red-700">Proteína</span>
                        <div className="text-right">
                          <p className="font-bold text-red-600">{results.protein}g</p>
                          <p className="text-xs text-red-600">15% das calorias</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="font-medium text-yellow-700">Carboidrato</span>
                        <div className="text-right">
                          <p className="font-bold text-yellow-600">{results.carbs}g</p>
                          <p className="text-xs text-yellow-600">55% das calorias</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium text-green-700">Gordura</span>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{results.fat}g</p>
                          <p className="text-xs text-green-600">30% das calorias</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="h-5 w-5" />
                      <span>Hidratação</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{results.water} ml</p>
                      <p className="text-sm text-muted-foreground">água por dia</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {Math.round(results.water / 250)} copos de 250ml
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo do Plano</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-1">
                      <p><strong>Paciente:</strong> {patientData.name}</p>
                      <p><strong>Objetivo:</strong> {goals[patientData.goal as keyof typeof goals].label}</p>
                      <p><strong>IMC:</strong> {formatNutrient(bmi)} ({bmiCategory.text})</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <FileText className="h-3 w-3 mr-1" />
                        Gerar PDF
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setActiveTab('meal-plan')}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Criar Dieta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Preencha os dados do paciente</p>
                  <p className="text-sm text-muted-foreground">Os resultados aparecerão aqui</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
          </TabsContent>

          <TabsContent value="meal-plan">
            {results ? (
              <AdvancedDietCreator 
                targetNutrition={{
                  calories: results.calories,
                  protein: results.protein,
                  carbs: results.carbs,
                  fat: results.fat
                }}
                patientData={{
                  name: patientData.name,
                  gender: patientData.gender,
                  age: patientData.age,
                  weight: patientData.weight,
                  height: patientData.height
                }}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Calcule primeiro as necessidades nutricionais</p>
                  <p className="text-sm text-muted-foreground">na aba Calculadora para criar um plano alimentar</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => setActiveTab('calculator')}
                  >
                    Ir para Calculadora
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </NutritionistLayout>
  )
}