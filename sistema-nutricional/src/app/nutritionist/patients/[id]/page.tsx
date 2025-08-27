'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { NutritionistLayout } from '@/components/layouts/nutritionist-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Edit,
  Phone,
  Mail,
  MapPin,
  Activity,
  Heart,
  Weight,
  Ruler
} from 'lucide-react'

// Mock data para um paciente específico
const mockPatientData = {
  id: 1,
  name: "João Silva",
  email: "joao@email.com",
  phone: "(11) 99999-1111",
  age: 34,
  gender: "MALE",
  currentWeight: 78.5,
  goalWeight: 75,
  startWeight: 82,
  height: 1.75,
  imc: 25.6,
  lastConsultation: "2024-11-10",
  nextConsultation: "2024-11-24",
  status: "ACTIVE",
  adherence: 92,
  weightTrend: "down",
  address: "Rua das Flores, 123 - Centro, São Paulo - SP",
  profession: "Engenheiro",
  objective: "Emagrecimento",
  medicalHistory: "Hipertensão controlada",
  allergies: "Lactose",
  medications: "Losartan 50mg - 1x ao dia",
  consultations: [
    {
      date: "2024-11-10",
      weight: 78.5,
      notes: "Paciente relatou melhora na disposição. Mantendo a dieta conforme orientado.",
      type: "Acompanhamento"
    },
    {
      date: "2024-10-27",
      weight: 79.2,
      notes: "Primeira consulta. Elaborado plano alimentar personalizado.",
      type: "Primeira Consulta"
    }
  ],
  evolutionData: [
    { date: "2024-10-01", weight: 82.0, imc: 26.8 },
    { date: "2024-10-15", weight: 80.5, imc: 26.3 },
    { date: "2024-10-27", weight: 79.2, imc: 25.9 },
    { date: "2024-11-10", weight: 78.5, imc: 25.6 }
  ]
}

export default function PatientProfile() {
  const router = useRouter()
  const params = useParams()
  const [patient, setPatient] = useState(mockPatientData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Aqui futuramente buscaremos os dados do paciente pela API
    // const patientId = params.id
    // fetchPatientData(patientId)
  }, [params.id])

  const handleBackToList = () => {
    router.push('/nutritionist/patients')
  }

  const handleEditPatient = () => {
    // TODO: Implementar edição
    alert('Edição do paciente será implementada')
  }

  const handleSendMessage = () => {
    router.push(`/nutritionist/messages?patientId=${patient.id}&patientName=${patient.name}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-600'
      case 'ATTENTION': return 'bg-yellow-600'
      case 'INACTIVE': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo'
      case 'ATTENTION': return 'Atenção'
      case 'INACTIVE': return 'Inativo'
      default: return 'Desconhecido'
    }
  }

  return (
    <NutritionistLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
              <p className="text-muted-foreground">Perfil completo do paciente</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleSendMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensagem
            </Button>
            <Button onClick={handleEditPatient}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Weight className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Peso Atual</p>
                  <p className="text-2xl font-bold">{patient.currentWeight}kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Ruler className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">IMC</p>
                  <p className="text-2xl font-bold">{patient.imc}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Progresso</p>
                  <p className="text-2xl font-bold">-{(patient.startWeight - patient.currentWeight).toFixed(1)}kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Adesão</p>
                  <p className="text-2xl font-bold">{patient.adherence}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conteúdo Principal em Tabs */}
        <Tabs defaultValue="dados-pessoais" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="historico-clinico">Histórico Clínico</TabsTrigger>
            <TabsTrigger value="evolucao">Evolução</TabsTrigger>
            <TabsTrigger value="consultas">Consultas</TabsTrigger>
            <TabsTrigger value="anotacoes">Anotações</TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="dados-pessoais">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{patient.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Idade</p>
                      <p className="font-medium">{patient.age} anos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sexo</p>
                      <p className="font-medium">{patient.gender === 'MALE' ? 'Masculino' : 'Feminino'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Profissão</p>
                      <p className="font-medium">{patient.profession}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{patient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium">{patient.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p className="font-medium">{patient.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Histórico Clínico */}
          <TabsContent value="historico-clinico">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Objetivo do Tratamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-blue-600">{patient.objective}</Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Meta de peso: {patient.goalWeight}kg
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico Médico</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Condições médicas:</p>
                    <p className="text-sm text-muted-foreground">{patient.medicalHistory}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Alergias:</p>
                    <p className="text-sm text-muted-foreground">{patient.allergies}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Medicamentos:</p>
                    <p className="text-sm text-muted-foreground">{patient.medications}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Evolução */}
          <TabsContent value="evolucao">
            <Card>
              <CardHeader>
                <CardTitle>Gráfico de Evolução</CardTitle>
                <CardDescription>Progresso de peso e IMC ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.evolutionData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(data.date).toLocaleDateString('pt-BR')}</p>
                        <p className="text-sm text-muted-foreground">Peso: {data.weight}kg | IMC: {data.imc}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {index > 0 && (
                          patient.evolutionData[index].weight < patient.evolutionData[index - 1].weight ? (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consultas */}
          <TabsContent value="consultas">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Consultas</CardTitle>
                <CardDescription>Registro de todas as consultas realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patient.consultations.map((consultation, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{consultation.type}</p>
                          <p className="text-sm text-muted-foreground">{new Date(consultation.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <Badge variant="outline">Peso: {consultation.weight}kg</Badge>
                      </div>
                      <p className="text-sm text-foreground mt-2">{consultation.notes}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Anotações */}
          <TabsContent value="anotacoes">
            <Card>
              <CardHeader>
                <CardTitle>Anotações do Nutricionista</CardTitle>
                <CardDescription>Observações e anotações importantes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800">Observação importante:</p>
                    <p className="text-sm text-yellow-700">
                      Paciente demonstra boa adesão ao tratamento. Manter acompanhamento regular.
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">10/11/2024</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Plano para próxima consulta:</p>
                    <p className="text-sm text-blue-700">
                      Ajustar cardápio para incluir mais proteínas no pós-treino.
                    </p>
                    <p className="text-xs text-blue-600 mt-2">27/10/2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </NutritionistLayout>
  )
}