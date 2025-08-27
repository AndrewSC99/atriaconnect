'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  Users,
  Calculator,
  FileText,
  MessageSquare,
  Calendar,
  Smartphone,
  Heart,
  CheckCircle,
  BookOpen,
  Shield,
  Lock,
  Eye,
  Database,
  Zap
} from 'lucide-react'

export function FeaturesGrid() {
  const featureModules = [
    {
      title: "Módulo Nutricionista",
      description: "Ferramentas profissionais completas para gestão e atendimento",
      color: "blue",
      features: [
        {
          icon: BarChart3,
          title: "Dashboard Financeiro e Operacional",
          description: "Receita mensal/anual, taxa de inadimplência, ticket médio, consultas realizadas e novos pacientes",
          highlights: ["Métricas em tempo real", "Relatórios financeiros", "KPIs automáticos"]
        },
        {
          icon: Users,
          title: "Gestão Completa de Pacientes", 
          description: "Cadastro com anamnese, classificação por status, score de aderência e alertas de risco",
          highlights: ["Prontuário digital", "Classificação automática", "Alertas inteligentes"]
        },
        {
          icon: Calculator,
          title: "Ferramentas Nutricionais Profissionais",
          description: "Calculadora TMB/GET, Tabela TACO com 597 alimentos, criador visual de dietas e análise de micronutrientes",
          highlights: ["4 equações TMB", "597 alimentos TACO", "Análise completa"]
        },
        {
          icon: FileText,
          title: "Prontuário Eletrônico Avançado",
          description: "23 medidas antropométricas, bioimpedância, exames laboratoriais, evolução fotográfica e histórico completo",
          highlights: ["23 medidas corporais", "Evolução visual", "Histórico completo"]
        },
        {
          icon: MessageSquare,
          title: "Comunicação e Agendamento Integrados",
          description: "Agenda com Google Calendar, chat seguro, notificações push/email e videochamada integrada",
          highlights: ["Google Calendar", "Chat seguro", "Videochamada"]
        }
      ]
    },
    {
      title: "Módulo Paciente",
      description: "Experiência mobile-first para acompanhamento e motivação",
      color: "green",
      features: [
        {
          icon: Smartphone,
          title: "Dashboard Motivacional",
          description: "Progresso visual em gráficos, conquistas desbloqueadas, comparativo antes/depois e metas semanais/mensais",
          highlights: ["Gráficos interativos", "Sistema de conquistas", "Comparativos visuais"]
        },
        {
          icon: Heart,
          title: "Gestão Alimentar Completa",
          description: "Plano alimentar detalhado, lista de compras automática, registro fotográfico e cálculo de calorias",
          highlights: ["Lista automática", "Registro com foto", "Cálculo automático"]
        },
        {
          icon: CheckCircle,
          title: "Acompanhamento Detalhado",
          description: "Checklist de hábitos, registro de sintomas, qualidade do sono e nível de energia",
          highlights: ["Checklist diário", "Monitoramento sintomas", "Qualidade de vida"]
        },
        {
          icon: BookOpen,
          title: "Educação e Suporte Contínuo",
          description: "Biblioteca de receitas, vídeos educativos, dicas diárias e FAQ nutricional",
          highlights: ["200+ receitas", "Conteúdo educativo", "Suporte 24/7"]
        }
      ]
    },
    {
      title: "Módulo Segurança",
      description: "Proteção máxima de dados e conformidade legal",
      color: "purple",
      features: [
        {
          icon: Shield,
          title: "Autenticação 2FA",
          description: "Google Authenticator, códigos de backup criptografados e login seguro com validação em duas etapas",
          highlights: ["Google Authenticator", "Códigos backup", "Login seguro"]
        },
        {
          icon: Lock,
          title: "Criptografia AES-256",
          description: "Dados sensíveis protegidos com criptografia de nível bancário e armazenamento seguro",
          highlights: ["Nível bancário", "Dados protegidos", "Armazenamento seguro"]
        },
        {
          icon: Eye,
          title: "LGPD Compliance",
          description: "Adequação total à Lei Geral de Proteção de Dados, consentimento e direitos do usuário",
          highlights: ["LGPD total", "Consentimento", "Direitos garantidos"]
        },
        {
          icon: Database,
          title: "Backup Automático",
          description: "Backup automático em nuvem, redundância de dados e recuperação rápida em caso de emergência",
          highlights: ["Backup automático", "Redundância", "Recuperação rápida"]
        }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      green: "from-green-500 to-green-600",
      purple: "from-purple-500 to-purple-600"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getBorderColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-200 dark:border-blue-800",
      green: "border-green-200 dark:border-green-800", 
      purple: "border-purple-200 dark:border-purple-800"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Zap className="mr-2 h-4 w-4" />
            Funcionalidades Completas
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Tudo que você precisa em{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Uma Plataforma
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Sistema completo e integrado que atende todas as necessidades de nutricionistas 
            e pacientes com tecnologia de ponta e segurança máxima.
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-20">
          {featureModules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="space-y-8">
              {/* Module Header */}
              <div className="text-center">
                <div className={`inline-block p-1 rounded-2xl bg-gradient-to-r ${getColorClasses(module.color)} mb-6`}>
                  <div className="bg-background rounded-xl px-8 py-4">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{module.title}</h3>
                    <p className="text-muted-foreground">{module.description}</p>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {module.features.map((feature, featureIndex) => {
                  const FeatureIcon = feature.icon
                  return (
                    <Card key={featureIndex} className={`group hover:shadow-xl transition-all duration-300 ${getBorderColorClasses(module.color)} hover:border-opacity-60`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start space-x-4">
                          <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-r ${getColorClasses(module.color)} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                            <FeatureIcon className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-blue-600 transition-colors leading-tight">
                              {feature.title}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <p className="text-muted-foreground leading-relaxed text-sm">
                          {feature.description}
                        </p>
                        
                        {/* Feature Highlights */}
                        <div className="space-y-2">
                          {feature.highlights.map((highlight, highlightIndex) => (
                            <div key={highlightIndex} className="flex items-center space-x-2">
                              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${getColorClasses(module.color)}`} />
                              <span className="text-xs text-muted-foreground font-medium">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Integration Message */}
        <div className="mt-20 text-center">
          <Card className="max-w-4xl mx-auto border-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Integração Total Entre Módulos
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Todos os módulos trabalham em perfeita sincronização, compartilhando dados 
                em tempo real para uma experiência fluida e eficiente para nutricionistas e pacientes.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Sincronização em tempo real</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Dados unificados</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-purple-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Experiência fluida</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}