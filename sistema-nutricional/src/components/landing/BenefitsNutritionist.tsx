'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign,
  Calculator,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  MessageSquare,
  Clock,
  Shield,
  Zap,
  Heart
} from 'lucide-react'

export function BenefitsNutritionist() {
  const benefitCategories = [
    {
      icon: DollarSign,
      title: "Gestão Profissional Completa",
      color: "green",
      benefits: [
        {
          icon: BarChart3,
          title: "Dashboard Administrativo Inteligente",
          description: "Visão 360° da prática com métricas em tempo real, receita mensal, taxa de conversão e acompanhamento de KPIs"
        },
        {
          icon: DollarSign,
          title: "Gestão Financeira Integrada",
          description: "Controle completo de receitas, pagamentos pendentes, inadimplência e relatórios financeiros detalhados"
        },
        {
          icon: Calendar,
          title: "Agenda Automatizada",
          description: "Sistema completo de agendamento com lembretes automáticos, sincronização com Google Calendar e redução de no-show"
        },
        {
          icon: TrendingUp,
          title: "Taxa de Conversão",
          description: "Acompanhamento de novos pacientes, retenção, análise de churn e otimização do atendimento"
        }
      ]
    },
    {
      icon: Calculator,
      title: "Ferramentas Científicas Avançadas",
      color: "blue",
      benefits: [
        {
          icon: Calculator,
          title: "Calculadora Nutricional Profissional",
          description: "TMB por 4 equações diferentes (Mifflin, Harris-Benedict, Katch-McArdle), GET personalizado com 5 níveis de atividade"
        },
        {
          icon: FileText,
          title: "Tabela TACO Completa",
          description: "Base de dados com 597 alimentos brasileiros, busca avançada, filtros por nutrientes e composição nutricional detalhada"
        },
        {
          icon: Zap,
          title: "Criador de Dietas Inteligente",
          description: "Sistema drag-and-drop com cálculo automático de macros, distribuição por refeições e validação nutricional"
        },
        {
          icon: Heart,
          title: "Biblioteca de Templates",
          description: "Reutilização de planos alimentares bem-sucedidos, categorização por objetivos e personalização rápida"
        }
      ]
    },
    {
      icon: FileText,
      title: "Prontuário Eletrônico Completo",
      color: "purple",
      benefits: [
        {
          icon: FileText,
          title: "Anamnese Detalhada",
          description: "Histórico médico completo, alimentar, familiar, medicamentos e condições especiais organizados digitalmente"
        },
        {
          icon: BarChart3,
          title: "Antropometria Completa",
          description: "23 medidas corporais diferentes, bioimpedância, evolução fotográfica e comparativos automáticos"
        },
        {
          icon: TrendingUp,
          title: "Evolução com Gráficos",
          description: "Visualização clara do progresso do paciente com gráficos interativos, tendências e marcos importantes"
        },
        {
          icon: Clock,
          title: "Histórico de Consultas",
          description: "Timeline completa do acompanhamento, notas de evolução, prescrições e planejamento futuro"
        }
      ]
    },
    {
      icon: Clock,
      title: "Produtividade e Eficiência",
      color: "orange",
      benefits: [
        {
          icon: Clock,
          title: "Economia de Tempo",
          description: "Automatização de tarefas repetitivas economiza 3+ horas por dia, permitindo foco no atendimento"
        },
        {
          icon: FileText,
          title: "Relatórios em PDF",
          description: "Geração instantânea de documentos profissionais, planos alimentares, evolução e relatórios médicos"
        },
        {
          icon: MessageSquare,
          title: "Comunicação Integrada",
          description: "Chat seguro direto com pacientes, histórico de conversas e notificações organizadas"
        },
        {
          icon: Shield,
          title: "Notificações Inteligentes",
          description: "Alertas automáticos de pacientes em risco, consultas pendentes e metas não atingidas"
        }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      green: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800", 
      purple: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
      orange: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getIconColorClasses = (color: string) => {
    const colors = {
      green: "text-green-600",
      blue: "text-blue-600",
      purple: "text-purple-600", 
      orange: "text-orange-600"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section id="benefits" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Users className="mr-2 h-4 w-4" />
            Para Nutricionistas
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Transforme sua{' '}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Prática Profissional
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Ferramentas avançadas que elevam o nível do seu atendimento, aumentam sua produtividade 
            e impulsionam o crescimento do seu consultório.
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-16">
          {benefitCategories.map((category, categoryIndex) => {
            const CategoryIcon = category.icon
            return (
              <div key={categoryIndex} className="space-y-8">
                {/* Category Header */}
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full ${getColorClasses(category.color)}`}>
                    <CategoryIcon className={`h-6 w-6 ${getIconColorClasses(category.color)}`} />
                    <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
                  </div>
                </div>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {category.benefits.map((benefit, benefitIndex) => {
                    const BenefitIcon = benefit.icon
                    return (
                      <Card key={benefitIndex} className="group hover:shadow-lg transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${getColorClasses(category.color)} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <BenefitIcon className={`h-6 w-6 ${getIconColorClasses(category.color)}`} />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                                {benefit.title}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-muted-foreground leading-relaxed">
                            {benefit.description}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-2xl p-8 max-w-4xl mx-auto border border-green-200 dark:border-green-800/30">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Resultados Comprovados para Nutricionistas
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">+40%</div>
                <p className="text-sm text-muted-foreground">Produtividade</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">+35%</div>
                <p className="text-sm text-muted-foreground">Faturamento</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">3h</div>
                <p className="text-sm text-muted-foreground">Economia/dia</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">92%</div>
                <p className="text-sm text-muted-foreground">Satisfação</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}