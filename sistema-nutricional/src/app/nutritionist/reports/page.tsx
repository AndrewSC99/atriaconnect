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
import { 
  FileText,
  Download,
  Eye,
  Share,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  Target,
  PieChart,
  BarChart3,
  Filter,
  Search,
  Plus,
  Settings,
  Mail,
  Printer
} from 'lucide-react'

interface Report {
  id: number
  title: string
  type: 'individual' | 'group' | 'progress' | 'nutritional'
  patient?: string
  dateRange: string
  createdAt: string
  status: 'ready' | 'generating' | 'scheduled'
  format: 'pdf' | 'excel' | 'csv'
  size: string
  description: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'individual' | 'group' | 'progress' | 'nutritional'
  sections: string[]
  estimatedPages: number
}

const mockReports: Report[] = [
  {
    id: 1,
    title: "Relatório de Progresso - João Silva",
    type: "individual",
    patient: "João Silva",
    dateRange: "01/11/2024 - 30/11/2024",
    createdAt: "15/11/2024 14:30",
    status: "ready",
    format: "pdf",
    size: "2.3 MB",
    description: "Análise completa do progresso mensal incluindo métricas, adesão à dieta e evolução antropométrica"
  },
  {
    id: 2,
    title: "Relatório Nutricional - Maria Santos",
    type: "nutritional",
    patient: "Maria Santos",
    dateRange: "Última semana",
    createdAt: "14/11/2024 09:15",
    status: "ready",
    format: "pdf",
    size: "1.8 MB",
    description: "Avaliação do consumo alimentar e adequação nutricional"
  },
  {
    id: 3,
    title: "Relatório Mensal - Todos os Pacientes",
    type: "group",
    dateRange: "Outubro 2024",
    createdAt: "01/11/2024 16:45",
    status: "ready",
    format: "excel",
    size: "4.1 MB",
    description: "Estatísticas gerais de atendimento e resultados dos pacientes"
  },
  {
    id: 4,
    title: "Análise de Progresso - Pedro Costa",
    type: "progress",
    patient: "Pedro Costa",
    dateRange: "Últimos 3 meses",
    createdAt: "10/11/2024 11:20",
    status: "generating",
    format: "pdf",
    size: "-",
    description: "Relatório trimestral de evolução e metas alcançadas"
  }
]

const reportTemplates: ReportTemplate[] = [
  {
    id: "individual_complete",
    name: "Relatório Individual Completo",
    description: "Análise detalhada de um paciente incluindo todas as métricas",
    type: "individual",
    sections: [
      "Dados do paciente",
      "Objetivos e metas",
      "Evolução antropométrica",
      "Análise dietética",
      "Adesão ao tratamento",
      "Recomendações"
    ],
    estimatedPages: 8
  },
  {
    id: "nutritional_analysis",
    name: "Análise Nutricional",
    description: "Foco na avaliação do consumo alimentar e adequação nutricional",
    type: "nutritional",
    sections: [
      "Registro alimentar",
      "Adequação calórica",
      "Distribuição de macronutrientes",
      "Micronutrientes",
      "Recomendações nutricionais"
    ],
    estimatedPages: 5
  },
  {
    id: "progress_report",
    name: "Relatório de Progresso",
    description: "Evolução do paciente ao longo do tempo",
    type: "progress",
    sections: [
      "Gráficos de evolução",
      "Comparativo de metas",
      "Marcos alcançados",
      "Ajustes realizados",
      "Próximos passos"
    ],
    estimatedPages: 6
  },
  {
    id: "group_statistics",
    name: "Estatísticas do Grupo",
    description: "Visão geral de múltiplos pacientes",
    type: "group",
    sections: [
      "Resumo geral",
      "Estatísticas de adesão",
      "Resultados médios",
      "Casos de destaque",
      "Análise comparativa"
    ],
    estimatedPages: 10
  }
]

const mockPatients = [
  { id: 1, name: "João Silva" },
  { id: 2, name: "Maria Santos" },
  { id: 3, name: "Pedro Costa" },
  { id: 4, name: "Ana Oliveira" },
  { id: 5, name: "Carlos Pereira" }
]

export default function NutritionistReports() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [isCreatingReport, setIsCreatingReport] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [reportData, setReportData] = useState({
    patient: '',
    dateFrom: '',
    dateTo: '',
    sections: [] as string[],
    notes: ''
  })

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.patient?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || report.type === selectedType
    return matchesSearch && matchesType
  })

  const statusConfig = {
    ready: { label: 'Pronto', color: 'bg-green-600', textColor: 'text-green-600' },
    generating: { label: 'Gerando', color: 'bg-yellow-600', textColor: 'text-yellow-600' },
    scheduled: { label: 'Agendado', color: 'bg-blue-600', textColor: 'text-blue-600' }
  }

  const typeConfig = {
    individual: { label: 'Individual', icon: Users, color: 'text-blue-600' },
    group: { label: 'Grupo', icon: Users, color: 'text-green-600' },
    progress: { label: 'Progresso', icon: TrendingUp, color: 'text-purple-600' },
    nutritional: { label: 'Nutricional', icon: Activity, color: 'text-orange-600' }
  }

  const generateReport = () => {
    if (!selectedTemplate || !reportData.patient) return

    // Simular geração de relatório
    const newReport: Report = {
      id: mockReports.length + 1,
      title: `${selectedTemplate.name} - ${mockPatients.find(p => p.id.toString() === reportData.patient)?.name}`,
      type: selectedTemplate.type,
      patient: mockPatients.find(p => p.id.toString() === reportData.patient)?.name,
      dateRange: `${reportData.dateFrom} - ${reportData.dateTo}`,
      createdAt: new Date().toLocaleString('pt-BR'),
      status: 'generating',
      format: 'pdf',
      size: '-',
      description: selectedTemplate.description
    }

    console.log('Gerando relatório:', newReport)
    setIsCreatingReport(false)
    setSelectedTemplate(null)
    setReportData({
      patient: '',
      dateFrom: '',
      dateTo: '',
      sections: [],
      notes: ''
    })
  }

  return (
    <NutritionistLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Relatórios e Análises
            </h1>
            <p className="text-muted-foreground">
              Gere relatórios detalhados para seus pacientes
            </p>
          </div>
          <Button onClick={() => setIsCreatingReport(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Relatórios Gerados</p>
                  <p className="text-2xl font-bold">{mockReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Download className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                  <p className="text-2xl font-bold">127</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Agendados</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">Meus Relatórios</TabsTrigger>
            <TabsTrigger value="templates">Modelos</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
          </TabsList>

          {/* Lista de Relatórios */}
          <TabsContent value="reports" className="space-y-4 mt-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Buscar relatórios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <select 
                      className="px-3 py-2 border rounded-md"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="all">Todos os tipos</option>
                      <option value="individual">Individual</option>
                      <option value="group">Grupo</option>
                      <option value="progress">Progresso</option>
                      <option value="nutritional">Nutricional</option>
                    </select>
                    
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Relatórios */}
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const TypeIcon = typeConfig[report.type].icon
                return (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{report.title}</h3>
                              <Badge className={statusConfig[report.status].color}>
                                {statusConfig[report.status].label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                              <div className="flex items-center space-x-1">
                                <TypeIcon className={`h-3 w-3 ${typeConfig[report.type].color}`} />
                                <span>{typeConfig[report.type].label}</span>
                              </div>
                              <span>📅 {report.dateRange}</span>
                              <span>📁 {report.size}</span>
                              <span>⏰ {report.createdAt}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {report.status === 'ready' && (
                            <>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Visualizar
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                              <Button size="sm" variant="outline">
                                <Share className="h-3 w-3 mr-1" />
                                Compartilhar
                              </Button>
                            </>
                          )}
                          {report.status === 'generating' && (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                              <span className="text-sm text-yellow-600">Gerando...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Modelos de Relatório */}
          <TabsContent value="templates" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportTemplates.map((template) => {
                const TypeIcon = typeConfig[template.type].icon
                return (
                  <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TypeIcon className={`h-6 w-6 ${typeConfig[template.type].color}`} />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            <h4 className="text-sm font-medium">Seções incluídas:</h4>
                            <div className="flex flex-wrap gap-1">
                              {template.sections.map((section, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {section}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              ~{template.estimatedPages} páginas
                            </span>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate(template)
                                setIsCreatingReport(true)
                              }}
                            >
                              Usar Modelo
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Análises e Gráficos */}
          <TabsContent value="analytics" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Tipos de Relatórios</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Individual</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                        <span className="text-sm font-medium">60%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Nutricional</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{width: '25%'}}></div>
                        </div>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Progresso</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '10%'}}></div>
                        </div>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Grupo</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '5%'}}></div>
                        </div>
                        <span className="text-sm font-medium">5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Relatórios por Mês</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'].map((month, index) => (
                      <div key={month} className="flex items-center justify-between">
                        <span className="text-sm">{month}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${Math.random() * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.floor(Math.random() * 20)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Insights e Recomendações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📈 Tendência Crescente</h4>
                    <p className="text-sm text-blue-700">
                      Aumento de 25% na geração de relatórios individuais este mês
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">⭐ Mais Popular</h4>
                    <p className="text-sm text-green-700">
                      Relatório Individual Completo é o modelo mais usado
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">💡 Sugestão</h4>
                    <p className="text-sm text-purple-700">
                      Considere automatizar relatórios mensais para pacientes frequentes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Criação de Relatório */}
        {isCreatingReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Novo Relatório</CardTitle>
                    <CardDescription>
                      {selectedTemplate ? `Modelo: ${selectedTemplate.name}` : 'Selecione um modelo'}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setIsCreatingReport(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedTemplate ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Escolha um modelo:</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {reportTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="patient">Paciente</Label>
                      <select 
                        id="patient"
                        className="w-full mt-2 p-2 border rounded-md"
                        value={reportData.patient}
                        onChange={(e) => setReportData(prev => ({ ...prev, patient: e.target.value }))}
                      >
                        <option value="">Selecione um paciente</option>
                        {mockPatients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateFrom">Data Inicial</Label>
                        <Input
                          id="dateFrom"
                          type="date"
                          value={reportData.dateFrom}
                          onChange={(e) => setReportData(prev => ({ ...prev, dateFrom: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="dateTo">Data Final</Label>
                        <Input
                          id="dateTo"
                          type="date"
                          value={reportData.dateTo}
                          onChange={(e) => setReportData(prev => ({ ...prev, dateTo: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Seções a incluir:</Label>
                      <div className="mt-2 space-y-2">
                        {selectedTemplate.sections.map((section, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked />
                            <span className="text-sm">{section}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Observações Adicionais</Label>
                      <Textarea
                        id="notes"
                        placeholder="Informações específicas para incluir no relatório..."
                        value={reportData.notes}
                        onChange={(e) => setReportData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button onClick={generateReport} className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
                        Gerar Relatório
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                        Voltar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </NutritionistLayout>
  )
}