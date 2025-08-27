'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NutritionistLayout } from '@/components/layouts/nutritionist-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// Select removido - usando elementos HTML nativos
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus,
  Search,
  Users,
  Eye,
  Edit,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  X
} from 'lucide-react'

// Mock data para pacientes
const mockPatients = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-1111",
    age: 34,
    gender: "MALE",
    currentWeight: 78.5,
    goalWeight: 75,
    startWeight: 82,
    lastConsultation: "2024-11-10",
    nextConsultation: "2024-11-24",
    status: "ACTIVE",
    adherence: 92,
    weightTrend: "down"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "(11) 99999-2222",
    age: 28,
    gender: "FEMALE",
    currentWeight: 65.2,
    goalWeight: 62,
    startWeight: 68,
    lastConsultation: "2024-11-12",
    nextConsultation: "2024-11-26",
    status: "ACTIVE",
    adherence: 85,
    weightTrend: "down"
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@email.com",
    phone: "(11) 99999-3333",
    age: 42,
    gender: "MALE",
    currentWeight: 95.8,
    goalWeight: 90,
    startWeight: 98,
    lastConsultation: "2024-11-08",
    nextConsultation: "2024-11-22",
    status: "ATTENTION",
    adherence: 68,
    weightTrend: "up"
  },
  {
    id: 4,
    name: "Ana Oliveira",
    email: "ana@email.com",
    phone: "(11) 99999-4444",
    age: 31,
    gender: "FEMALE",
    currentWeight: 58.9,
    goalWeight: 55,
    startWeight: 62,
    lastConsultation: "2024-11-15",
    nextConsultation: "2024-11-29",
    status: "ACTIVE",
    adherence: 96,
    weightTrend: "down"
  },
  {
    id: 5,
    name: "Carlos Pereira",
    email: "carlos@email.com",
    phone: "(11) 99999-5555",
    age: 38,
    gender: "MALE",
    currentWeight: 88.3,
    goalWeight: 85,
    startWeight: 92,
    lastConsultation: "2024-11-05",
    nextConsultation: "2024-11-19",
    status: "INACTIVE",
    adherence: 45,
    weightTrend: "stable"
  }
]

const statusConfig: Record<string, { label: string; color: string; textColor: string }> = {
  ACTIVE: { label: "Ativo", color: "bg-green-600", textColor: "text-green-600" },
  ATTENTION: { label: "Atenção", color: "bg-yellow-600", textColor: "text-yellow-600" },
  INACTIVE: { label: "Inativo", color: "bg-red-600", textColor: "text-red-600" }
}

export default function NutritionistPatients() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isAddingPatient, setIsAddingPatient] = useState(false)
  
  // Estado para dados da anamnese
  const [anamneseData, setAnamneseData] = useState({
    // Dados Pessoais
    nomeCompleto: '',
    dataNascimento: '',
    sexo: '',
    cpf: '',
    email: '',
    telefone: '',
    whatsapp: '',
    endereco: '',
    estadoCivil: '',
    profissao: '',
    nivelAtividade: '',
    
    // Anamnese Clínica
    objetivoConsulta: '',
    historicoDoencas: [],
    medicamentosUso: '',
    alergias: '',
    historicoFamiliar: '',
    cirurgias: '',
    funcionamentoIntestinal: '',
    qualidadeSono: '',
    consumoAgua: '',
    
    // Anamnese Alimentar
    numeroRefeicoes: '',
    horariosRefeicoes: '',
    localRefeicoes: '',
    quemPrepara: '',
    alimentosPreferidos: '',
    alimentosEvita: '',
    bebidaAlcoolica: '',
    tabagismo: '',
    ultraprocessados: '',
    
    // Avaliação Antropométrica
    pesoAtual: '',
    altura: '',
    imc: '',
    circunferenciaAbdominal: '',
    circunferenciaQuadril: '',
    circunferenciaBraco: '',
    percentualGordura: '',
    massaMuscular: '',
    metaPeso: ''
  })

  // Estados para edição de paciente
  const [isEditingPatient, setIsEditingPatient] = useState(false)
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null)
  const [editingPatientData, setEditingPatientData] = useState<any>({})

  // Funções para os botões de ação
  const handleViewPatient = (patient: any) => {
    // Navega para a página de perfil do paciente
    router.push(`/nutritionist/patients/${patient.id}`)
  }

  const handleEditPatient = (patient: any) => {
    // Abre modal de edição com dados pré-carregados
    setEditingPatientData({
      nomeCompleto: patient.name,
      email: patient.email,
      telefone: patient.phone,
      idade: patient.age.toString(),
      sexo: patient.gender.toLowerCase(),
      pesoAtual: patient.currentWeight.toString(),
      metaPeso: patient.goalWeight.toString(),
      // Adicionar outros campos conforme necessário
    })
    setEditingPatientId(patient.id)
    setIsEditingPatient(true)
  }

  const handleMessagePatient = (patient: any) => {
    // Redireciona para a página de mensagens com dados do paciente
    router.push(`/nutritionist/messages?patientId=${patient.id}&patientName=${encodeURIComponent(patient.name)}`)
  }

  const handleReviewPatient = (patientId: number) => {
    // TODO: Implementar página de revisão
    alert(`Revisando paciente ID: ${patientId}\n\nEsta funcionalidade será implementada em breve.`)
  }

  // Função para atualizar dados da anamnese
  const updateAnamneseData = (field: string, value: any) => {
    setAnamneseData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Calcular IMC automaticamente quando peso ou altura mudarem
    if (field === 'pesoAtual' || field === 'altura') {
      const peso = field === 'pesoAtual' ? parseFloat(value) : parseFloat(anamneseData.pesoAtual)
      const altura = field === 'altura' ? parseFloat(value) : parseFloat(anamneseData.altura)
      
      if (peso && altura) {
        const imc = (peso / (altura * altura)).toFixed(2)
        setAnamneseData(prev => ({
          ...prev,
          imc: imc
        }))
      }
    }
  }

  // Função para atualizar dados de edição
  const updateEditingPatientData = (field: string, value: any) => {
    setEditingPatientData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSavePatient = () => {
    // TODO: Implementar salvamento no banco de dados
    console.log('Dados da anamnese:', anamneseData)
    alert('Paciente cadastrado com sucesso!\n\nDados da anamnese salvos no console para desenvolvimento.')
    setIsAddingPatient(false)
    // Limpar formulário
    setAnamneseData({
      nomeCompleto: '', dataNascimento: '', sexo: '', cpf: '', email: '', telefone: '', whatsapp: '',
      endereco: '', estadoCivil: '', profissao: '', nivelAtividade: '', objetivoConsulta: '',
      historicoDoencas: [], medicamentosUso: '', alergias: '', historicoFamiliar: '', cirurgias: '',
      funcionamentoIntestinal: '', qualidadeSono: '', consumoAgua: '', numeroRefeicoes: '',
      horariosRefeicoes: '', localRefeicoes: '', quemPrepara: '', alimentosPreferidos: '',
      alimentosEvita: '', bebidaAlcoolica: '', tabagismo: '', ultraprocessados: '', pesoAtual: '',
      altura: '', imc: '', circunferenciaAbdominal: '', circunferenciaQuadril: '', circunferenciaBraco: '',
      percentualGordura: '', massaMuscular: '', metaPeso: ''
    })
  }

  const handleUpdatePatient = () => {
    // TODO: Implementar atualização no banco de dados
    console.log('Dados atualizados do paciente:', editingPatientData)
    alert(`Dados do paciente ID ${editingPatientId} atualizados com sucesso!\n\nDados salvos no console para desenvolvimento.`)
    setIsEditingPatient(false)
    setEditingPatientId(null)
    setEditingPatientData({})
  }

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: mockPatients.length,
    active: mockPatients.filter(p => p.status === 'ACTIVE').length,
    attention: mockPatients.filter(p => p.status === 'ATTENTION').length,
    inactive: mockPatients.filter(p => p.status === 'INACTIVE').length,
    avgAdherence: Math.round(mockPatients.reduce((sum, p) => sum + p.adherence, 0) / mockPatients.length)
  }

  return (
    <NutritionistLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Gestão de Pacientes
            </h1>
            <p className="text-muted-foreground">
              Acompanhe e gerencie todos os seus pacientes
            </p>
          </div>
          <Button onClick={() => setIsAddingPatient(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Atenção</p>
                  <p className="text-2xl font-bold">{stats.attention}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <div>
                  <p className="text-sm text-muted-foreground">Inativos</p>
                  <p className="text-2xl font-bold">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Adesão Média</p>
                  <p className="text-2xl font-bold">{stats.avgAdherence}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={selectedStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={selectedStatus === 'ACTIVE' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('ACTIVE')}
                  size="sm"
                >
                  Ativos
                </Button>
                <Button
                  variant={selectedStatus === 'ATTENTION' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('ATTENTION')}
                  size="sm"
                >
                  Atenção
                </Button>
                <Button
                  variant={selectedStatus === 'INACTIVE' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('INACTIVE')}
                  size="sm"
                >
                  Inativos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pacientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pacientes ({filteredPatients.length})</CardTitle>
            <CardDescription>
              Lista completa de pacientes cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Peso Atual</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Adesão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Próxima Consulta</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-muted-foreground">{patient.age} anos • {patient.gender === 'MALE' ? 'M' : 'F'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{patient.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{patient.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{patient.currentWeight}kg</p>
                          <p className="text-sm text-muted-foreground">Meta: {patient.goalWeight}kg</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {patient.weightTrend === 'down' && (
                            <TrendingDown className="h-4 w-4 text-green-600" />
                          )}
                          {patient.weightTrend === 'up' && (
                            <TrendingUp className="h-4 w-4 text-red-600" />
                          )}
                          {patient.weightTrend === 'stable' && (
                            <div className="w-4 h-4 border-2 border-muted-foreground rounded"></div>
                          )}
                          <span className="text-sm">
                            {(patient.startWeight - patient.currentWeight).toFixed(1)}kg
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${
                                patient.adherence >= 80 ? 'bg-green-500' :
                                patient.adherence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${patient.adherence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{patient.adherence}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[patient.status].color}>
                          {statusConfig[patient.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(patient.nextConsultation).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewPatient(patient)}
                            title="Ver perfil do paciente"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditPatient(patient)}
                            title="Editar dados do paciente"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMessagePatient(patient)}
                            title="Enviar mensagem para o paciente"
                          >
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pacientes que Precisam de Atenção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span>Pacientes que Precisam de Atenção</span>
            </CardTitle>
            <CardDescription>
              Pacientes com baixa adesão ou outros alertas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPatients.filter(p => p.status === 'ATTENTION' || p.adherence < 70).map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.adherence < 70 ? 
                          `Baixa adesão: ${patient.adherence}%` : 
                          'Requer acompanhamento especial'
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    onClick={() => handleReviewPatient(patient.id)}
                  >
                    Revisar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Anamnese Nutricional */}
        {isAddingPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop escuro */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsAddingPatient(false)}
            />
            
            {/* Card Modal */}
            <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-hidden">
              <Card className="overflow-hidden">
                <CardHeader className="relative">
                  <CardTitle className="pr-8">Anamnese Nutricional - Novo Paciente</CardTitle>
                  <CardDescription>
                    Preencha todos os dados para um atendimento nutricional completo
                  </CardDescription>
                  {/* Botão Fechar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => setIsAddingPatient(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="max-h-[calc(90vh-120px)] overflow-y-auto">
              <Tabs defaultValue="dados-pessoais" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
                  <TabsTrigger value="anamnese-clinica">Anamnese Clínica</TabsTrigger>
                  <TabsTrigger value="anamnese-alimentar">Anamnese Alimentar</TabsTrigger>
                  <TabsTrigger value="antropometria">Antropometria</TabsTrigger>
                </TabsList>

                {/* DADOS PESSOAIS */}
                <TabsContent value="dados-pessoais" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                      <Input 
                        id="nomeCompleto"
                        value={anamneseData.nomeCompleto}
                        onChange={(e) => updateAnamneseData('nomeCompleto', e.target.value)}
                        placeholder="Nome completo do paciente"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                      <Input 
                        id="dataNascimento"
                        type="date"
                        value={anamneseData.dataNascimento}
                        onChange={(e) => updateAnamneseData('dataNascimento', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sexo">Sexo *</Label>
                      <select 
                        id="sexo"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={anamneseData.sexo} 
                        onChange={(e) => updateAnamneseData('sexo', e.target.value)}
                      >
                        <option value="">Selecione o sexo</option>
                        <option value="feminino">Feminino</option>
                        <option value="masculino">Masculino</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input 
                        id="cpf"
                        value={anamneseData.cpf}
                        onChange={(e) => updateAnamneseData('cpf', e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={anamneseData.email}
                        onChange={(e) => updateAnamneseData('email', e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input 
                        id="telefone"
                        value={anamneseData.telefone}
                        onChange={(e) => updateAnamneseData('telefone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input 
                        id="whatsapp"
                        value={anamneseData.whatsapp}
                        onChange={(e) => updateAnamneseData('whatsapp', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="estadoCivil">Estado Civil</Label>
                      <select 
                        id="estadoCivil"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={anamneseData.estadoCivil} 
                        onChange={(e) => updateAnamneseData('estadoCivil', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        <option value="solteiro">Solteiro(a)</option>
                        <option value="casado">Casado(a)</option>
                        <option value="divorciado">Divorciado(a)</option>
                        <option value="viuvo">Viúvo(a)</option>
                        <option value="uniao-estavel">União Estável</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="profissao">Profissão</Label>
                      <Input 
                        id="profissao"
                        value={anamneseData.profissao}
                        onChange={(e) => updateAnamneseData('profissao', e.target.value)}
                        placeholder="Profissão do paciente"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço Completo</Label>
                    <Textarea 
                      id="endereco"
                      value={anamneseData.endereco}
                      onChange={(e) => updateAnamneseData('endereco', e.target.value)}
                      placeholder="Rua, número, bairro, cidade, CEP"
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nível de Atividade Física</Label>
                    <RadioGroup 
                      value={anamneseData.nivelAtividade} 
                      onValueChange={(value) => updateAnamneseData('nivelAtividade', value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sedentario" id="sedentario" />
                        <Label htmlFor="sedentario">Sedentário (sem exercícios)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="leve" id="leve" />
                        <Label htmlFor="leve">Leve (1-3 dias/semana)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderado" id="moderado" />
                        <Label htmlFor="moderado">Moderado (3-5 dias/semana)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="intenso" id="intenso" />
                        <Label htmlFor="intenso">Intenso (6-7 dias/semana)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="muito-intenso" id="muito-intenso" />
                        <Label htmlFor="muito-intenso">Muito Intenso (2x por dia)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </TabsContent>

                {/* ANAMNESE CLÍNICA */}
                <TabsContent value="anamnese-clinica" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Objetivo da Consulta *</Label>
                      <RadioGroup 
                        value={anamneseData.objetivoConsulta} 
                        onValueChange={(value) => updateAnamneseData('objetivoConsulta', value)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="emagrecimento" id="emagrecimento" />
                          <Label htmlFor="emagrecimento">Emagrecimento</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ganho-massa" id="ganho-massa" />
                          <Label htmlFor="ganho-massa">Ganho de massa muscular</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="reeducacao" id="reeducacao" />
                          <Label htmlFor="reeducacao">Reeducação alimentar</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manutencao" id="manutencao" />
                          <Label htmlFor="manutencao">Manutenção do peso</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="esportivo" id="esportivo" />
                          <Label htmlFor="esportivo">Performance esportiva</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="outros" id="outros" />
                          <Label htmlFor="outros">Outros</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="medicamentos">Medicamentos em Uso</Label>
                        <Textarea 
                          id="medicamentos"
                          value={anamneseData.medicamentosUso}
                          onChange={(e) => updateAnamneseData('medicamentosUso', e.target.value)}
                          placeholder="Liste os medicamentos, dosagens e horários"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="alergias">Alergias e Intolerâncias</Label>
                        <Textarea 
                          id="alergias"
                          value={anamneseData.alergias}
                          onChange={(e) => updateAnamneseData('alergias', e.target.value)}
                          placeholder="Alergias alimentares, medicamentosas ou outras"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="historico-familiar">Histórico Familiar</Label>
                        <Textarea 
                          id="historico-familiar"
                          value={anamneseData.historicoFamiliar}
                          onChange={(e) => updateAnamneseData('historicoFamiliar', e.target.value)}
                          placeholder="Diabetes, hipertensão, obesidade, doenças cardíacas, etc."
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cirurgias">Cirurgias Realizadas</Label>
                        <Textarea 
                          id="cirurgias"
                          value={anamneseData.cirurgias}
                          onChange={(e) => updateAnamneseData('cirurgias', e.target.value)}
                          placeholder="Descreva cirurgias anteriores e datas"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="funcionamentoIntestinal">Funcionamento Intestinal</Label>
                        <select 
                          id="funcionamentoIntestinal"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={anamneseData.funcionamentoIntestinal} 
                          onChange={(e) => updateAnamneseData('funcionamentoIntestinal', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="normal">Normal (1x/dia)</option>
                          <option value="constipacao">Constipação (&lt; 3x/semana)</option>
                          <option value="diarreia">Diarreia frequente</option>
                          <option value="irregular">Irregular</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="qualidadeSono">Qualidade do Sono</Label>
                        <select 
                          id="qualidadeSono"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={anamneseData.qualidadeSono} 
                          onChange={(e) => updateAnamneseData('qualidadeSono', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="excelente">Excelente (7-9h)</option>
                          <option value="boa">Boa (6-7h)</option>
                          <option value="regular">Regular (5-6h)</option>
                          <option value="ruim">Ruim (&lt; 5h)</option>
                          <option value="insonia">Insônia</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="consumoAgua">Consumo de Água (litros/dia)</Label>
                        <select 
                          id="consumoAgua"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={anamneseData.consumoAgua} 
                          onChange={(e) => updateAnamneseData('consumoAgua', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="menos-1">Menos de 1L</option>
                          <option value="1-2">1 a 2L</option>
                          <option value="2-3">2 a 3L</option>
                          <option value="mais-3">Mais de 3L</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ANAMNESE ALIMENTAR */}
                <TabsContent value="anamnese-alimentar" className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numeroRefeicoes">Número de Refeições/Dia</Label>
                        <select 
                          id="numeroRefeicoes"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={anamneseData.numeroRefeicoes} 
                          onChange={(e) => updateAnamneseData('numeroRefeicoes', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="2">2 refeições</option>
                          <option value="3">3 refeições</option>
                          <option value="4">4 refeições</option>
                          <option value="5">5 refeições</option>
                          <option value="6">6 ou mais refeições</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="localRefeicoes">Local das Refeições</Label>
                        <select 
                          id="localRefeicoes"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={anamneseData.localRefeicoes} 
                          onChange={(e) => updateAnamneseData('localRefeicoes', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="casa">Casa</option>
                          <option value="trabalho">Trabalho</option>
                          <option value="restaurante">Restaurante</option>
                          <option value="misto">Misto</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quemPrepara">Quem Prepara as Refeições</Label>
                        <select 
                          id="quemPrepara"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={anamneseData.quemPrepara} 
                          onChange={(e) => updateAnamneseData('quemPrepara', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="proprio">Eu mesmo</option>
                          <option value="familia">Família</option>
                          <option value="cozinheiro">Cozinheiro(a)</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="alimentos-preferidos">Alimentos Preferidos</Label>
                        <Textarea 
                          id="alimentos-preferidos"
                          value={anamneseData.alimentosPreferidos}
                          onChange={(e) => updateAnamneseData('alimentosPreferidos', e.target.value)}
                          placeholder="Liste os alimentos que mais gosta"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="alimentos-evita">Alimentos que Evita/Não Gosta</Label>
                        <Textarea 
                          id="alimentos-evita"
                          value={anamneseData.alimentosEvita}
                          onChange={(e) => updateAnamneseData('alimentosEvita', e.target.value)}
                          placeholder="Liste os alimentos que não gosta ou evita"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bebidaAlcoolica">Consumo de Bebida Alcoólica</Label>
                        <select 
                          id="bebidaAlcoolica"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={anamneseData.bebidaAlcoolica} 
                          onChange={(e) => updateAnamneseData('bebidaAlcoolica', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="nao">Não bebo</option>
                          <option value="ocasional">Ocasionalmente</option>
                          <option value="fins-semana">Fins de semana</option>
                          <option value="diario">Diariamente</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="tabagismo">Tabagismo</Label>
                        <select 
                          id="tabagismo"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={anamneseData.tabagismo} 
                          onChange={(e) => updateAnamneseData('tabagismo', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="nao">Não fumo</option>
                          <option value="ex-fumante">Ex-fumante</option>
                          <option value="ocasional">Ocasionalmente</option>
                          <option value="diario">Diariamente</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ultraprocessados">Freq. Ultraprocessados</Label>
                        <select 
                          id="ultraprocessados"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={anamneseData.ultraprocessados} 
                          onChange={(e) => updateAnamneseData('ultraprocessados', e.target.value)}
                        >
                          <option value="">Selecione</option>
                          <option value="nunca">Nunca</option>
                          <option value="raramente">Raramente</option>
                          <option value="as-vezes">Às vezes</option>
                          <option value="frequentemente">Frequentemente</option>
                          <option value="diario">Diariamente</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horarios-refeicoes">Horários Típicos das Refeições</Label>
                      <Textarea 
                        id="horarios-refeicoes"
                        value={anamneseData.horariosRefeicoes}
                        onChange={(e) => updateAnamneseData('horariosRefeicoes', e.target.value)}
                        placeholder="Ex: Café da manhã: 7h, Almoço: 12h, Jantar: 19h"
                        rows={2}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* AVALIAÇÃO ANTROPOMÉTRICA */}
                <TabsContent value="antropometria" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Medidas Corporais</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso-atual">Peso Atual (kg) *</Label>
                        <Input 
                          id="peso-atual"
                          type="number"
                          step="0.1"
                          value={anamneseData.pesoAtual}
                          onChange={(e) => updateAnamneseData('pesoAtual', e.target.value)}
                          placeholder="Ex: 70.5"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="altura">Altura (m) *</Label>
                        <Input 
                          id="altura"
                          type="number"
                          step="0.01"
                          value={anamneseData.altura}
                          onChange={(e) => updateAnamneseData('altura', e.target.value)}
                          placeholder="Ex: 1.70"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="imc">IMC (calculado automaticamente)</Label>
                        <Input 
                          id="imc"
                          value={anamneseData.imc}
                          disabled
                          placeholder="Será calculado automaticamente"
                        />
                        {anamneseData.imc && (
                          <p className="text-sm text-muted-foreground">
                            {parseFloat(anamneseData.imc) < 18.5 ? 'Abaixo do peso' :
                             parseFloat(anamneseData.imc) < 25 ? 'Peso normal' :
                             parseFloat(anamneseData.imc) < 30 ? 'Sobrepeso' : 'Obesidade'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="circunferencia-abdominal">Circunferência Abdominal (cm)</Label>
                        <Input 
                          id="circunferencia-abdominal"
                          type="number"
                          value={anamneseData.circunferenciaAbdominal}
                          onChange={(e) => updateAnamneseData('circunferenciaAbdominal', e.target.value)}
                          placeholder="Ex: 85"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="circunferencia-quadril">Circunferência Quadril (cm)</Label>
                        <Input 
                          id="circunferencia-quadril"
                          type="number"
                          value={anamneseData.circunferenciaQuadril}
                          onChange={(e) => updateAnamneseData('circunferenciaQuadril', e.target.value)}
                          placeholder="Ex: 95"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="circunferencia-braco">Circunferência Braço (cm)</Label>
                        <Input 
                          id="circunferencia-braco"
                          type="number"
                          value={anamneseData.circunferenciaBraco}
                          onChange={(e) => updateAnamneseData('circunferenciaBraco', e.target.value)}
                          placeholder="Ex: 30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="percentual-gordura">Percentual de Gordura (%)</Label>
                        <Input 
                          id="percentual-gordura"
                          type="number"
                          step="0.1"
                          value={anamneseData.percentualGordura}
                          onChange={(e) => updateAnamneseData('percentualGordura', e.target.value)}
                          placeholder="Ex: 18.5"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="massa-muscular">Massa Muscular (kg)</Label>
                        <Input 
                          id="massa-muscular"
                          type="number"
                          step="0.1"
                          value={anamneseData.massaMuscular}
                          onChange={(e) => updateAnamneseData('massaMuscular', e.target.value)}
                          placeholder="Ex: 45.2"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="meta-peso">Meta de Peso (kg)</Label>
                        <Input 
                          id="meta-peso"
                          type="number"
                          step="0.1"
                          value={anamneseData.metaPeso}
                          onChange={(e) => updateAnamneseData('metaPeso', e.target.value)}
                          placeholder="Ex: 65.0"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Botões de Ação */}
                <div className="flex justify-between pt-6 border-t">
                  <Button variant="outline" onClick={() => setIsAddingPatient(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePatient} className="bg-green-600 hover:bg-green-700">
                    Salvar Anamnese Completa
                  </Button>
                </div>
              </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Modal de Edição de Paciente */}
        {isEditingPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop escuro */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsEditingPatient(false)}
            />
            
            {/* Card Modal */}
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <Card className="overflow-hidden">
                <CardHeader className="relative">
                  <CardTitle className="pr-8">Editar Dados do Paciente</CardTitle>
                  <CardDescription>
                    Altere as informações básicas do paciente
                  </CardDescription>
                  {/* Botão Fechar */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => setIsEditingPatient(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="max-h-[calc(90vh-120px)] overflow-y-auto space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-nome">Nome Completo</Label>
                      <Input 
                        id="edit-nome"
                        value={editingPatientData.nomeCompleto || ''}
                        onChange={(e) => updateEditingPatientData('nomeCompleto', e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input 
                        id="edit-email"
                        type="email"
                        value={editingPatientData.email || ''}
                        onChange={(e) => updateEditingPatientData('email', e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-telefone">Telefone</Label>
                      <Input 
                        id="edit-telefone"
                        value={editingPatientData.telefone || ''}
                        onChange={(e) => updateEditingPatientData('telefone', e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-idade">Idade</Label>
                      <Input 
                        id="edit-idade"
                        type="number"
                        value={editingPatientData.idade || ''}
                        onChange={(e) => updateEditingPatientData('idade', e.target.value)}
                        placeholder="30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-sexo">Sexo</Label>
                      <select 
                        id="edit-sexo"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={editingPatientData.sexo || ''} 
                        onChange={(e) => updateEditingPatientData('sexo', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        <option value="male">Masculino</option>
                        <option value="female">Feminino</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-peso">Peso Atual (kg)</Label>
                      <Input 
                        id="edit-peso"
                        type="number"
                        step="0.1"
                        value={editingPatientData.pesoAtual || ''}
                        onChange={(e) => updateEditingPatientData('pesoAtual', e.target.value)}
                        placeholder="70.5"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-meta">Meta de Peso (kg)</Label>
                      <Input 
                        id="edit-meta"
                        type="number"
                        step="0.1"
                        value={editingPatientData.metaPeso || ''}
                        onChange={(e) => updateEditingPatientData('metaPeso', e.target.value)}
                        placeholder="65.0"
                      />
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-between pt-6 border-t">
                    <Button variant="outline" onClick={() => setIsEditingPatient(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleUpdatePatient} className="bg-blue-600 hover:bg-blue-700">
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </NutritionistLayout>
  )
}