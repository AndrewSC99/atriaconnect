'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Smartphone,
  Heart,
  MessageSquare,
  Target,
  TrendingUp,
  CheckCircle,
  Apple,
  Camera,
  Bell,
  BookOpen,
  Award,
  Clock
} from 'lucide-react'

export function BenefitsPatient() {
  const benefitCategories = [
    {
      icon: Smartphone,
      title: "Acompanhamento Personalizado 24/7",
      color: "blue",
      benefits: [
        {
          icon: Target,
          title: "Dashboard Personalizado",
          description: "Visão clara e motivadora do progresso nutricional com gráficos interativos, metas atingidas e evolução personalizada"
        },
        {
          icon: Apple,
          title: "Dieta na Palma da Mão",
          description: "Acesso mobile completo ao plano alimentar, lista de compras automática e receitas detalhadas para cada refeição"
        },
        {
          icon: Camera,
          title: "Registro Alimentar Digital",
          description: "Diário alimentar com fotos das refeições, análise automática de calorias e feedback do nutricionista"
        },
        {
          icon: TrendingUp,
          title: "Métricas Automáticas",
          description: "Gráficos de evolução de peso, medidas corporais, aderência à dieta e comparativos mensais"
        }
      ]
    },
    {
      icon: Award,
      title: "Motivação e Engajamento",
      color: "green",
      benefits: [
        {
          icon: Award,
          title: "Gamificação",
          description: "Sistema de conquistas, badges por metas atingidas, desafios semanais e ranking de progresso para manter a motivação"
        },
        {
          icon: CheckCircle,
          title: "Checklist Diário",
          description: "Hábitos saudáveis com feedback visual, lembretes personalizados e acompanhamento de rotina"
        },
        {
          icon: TrendingUp,
          title: "Progresso Semanal",
          description: "Visualização clara dos resultados alcançados, celebração de conquistas e ajustes motivacionais"
        },
        {
          icon: Bell,
          title: "Lembretes Inteligentes",
          description: "Notificações personalizadas para refeições, água, medicamentos e atividades físicas"
        }
      ]
    },
    {
      icon: Heart,
      title: "Suporte Contínuo",
      color: "purple",
      benefits: [
        {
          icon: MessageSquare,
          title: "Chat com Nutricionista",
          description: "Comunicação direta e segura para tirar dúvidas, relatar dificuldades e receber orientações em tempo real"
        },
        {
          icon: BookOpen,
          title: "Biblioteca de Receitas",
          description: "Mais de 200 receitas saudáveis categorizadas, vídeos explicativos e adaptações para restrições alimentares"
        },
        {
          icon: Apple,
          title: "Substituições Inteligentes",
          description: "Sugestões automáticas de alimentos alternativos baseados em preferências, disponibilidade e objetivos"
        },
        {
          icon: Clock,
          title: "Educação Nutricional",
          description: "Conteúdo educativo personalizado, dicas diárias, artigos relevantes e webinars exclusivos"
        }
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
      green: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      purple: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getIconColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600", 
      purple: "text-purple-600"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Heart className="mr-2 h-4 w-4" />
            Para Pacientes
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Uma Jornada de{' '}
            <span className="bg-gradient-to-r from-green-600 to-purple-600 bg-clip-text text-transparent">
              Transformação
            </span>{' '}
            Personalizada
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Experiência digital completa que motiva, educa e acompanha cada passo da sua 
            jornada de saúde e bem-estar.
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
                      <Card key={benefitIndex} className="group hover:shadow-lg transition-all duration-300 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
                        <CardHeader className="pb-4">
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${getColorClasses(category.color)} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <BenefitIcon className={`h-6 w-6 ${getIconColorClasses(category.color)}`} />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-purple-600 transition-colors">
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

        {/* Patient Journey Visualization */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Sua Jornada de Transformação
            </h3>
            <p className="text-muted-foreground">
              Acompanhamento completo desde o primeiro dia até a conquista dos seus objetivos
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { 
                step: "1", 
                title: "Cadastro", 
                description: "Criação do perfil e definição de objetivos",
                icon: Target,
                color: "blue"
              },
              { 
                step: "2", 
                title: "Plano Personalizado", 
                description: "Receba sua dieta customizada",
                icon: Apple,
                color: "green"
              },
              { 
                step: "3", 
                title: "Acompanhamento", 
                description: "Registre progresso e receba feedback",
                icon: TrendingUp,
                color: "purple"
              },
              { 
                step: "4", 
                title: "Resultados", 
                description: "Celebre suas conquistas!",
                icon: Award,
                color: "yellow"
              }
            ].map((journey, index) => {
              const JourneyIcon = journey.icon
              return (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-${journey.color}-500 to-${journey.color}-600 flex items-center justify-center text-white font-bold text-xl mb-3 group-hover:scale-110 transition-transform`}>
                        {journey.step}
                      </div>
                      <JourneyIcon className={`h-8 w-8 mx-auto text-${journey.color}-600`} />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">{journey.title}</h4>
                    <p className="text-sm text-muted-foreground">{journey.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Patient Success Stats */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8 max-w-4xl mx-auto border border-purple-200 dark:border-purple-800/30">
            <h3 className="text-2xl font-bold text-foreground mb-6">
              Resultados dos Nossos Pacientes
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                <p className="text-sm text-muted-foreground">Taxa de Adesão</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">92%</div>
                <p className="text-sm text-muted-foreground">Satisfação</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">78%</div>
                <p className="text-sm text-muted-foreground">Atingem Metas</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">4.8★</div>
                <p className="text-sm text-muted-foreground">Avaliação App</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}