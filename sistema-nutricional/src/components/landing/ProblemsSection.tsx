'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  FileText, 
  Clock, 
  TrendingDown, 
  AlertTriangle,
  Users,
  Calculator
} from 'lucide-react'

export function ProblemsSection() {
  const problems = [
    {
      icon: FileText,
      title: "Ainda gerencia pacientes no papel?",
      description: "Prontuários físicos, planilhas desorganizadas e informações perdidas atrasam seu atendimento e prejudicam a qualidade do cuidado.",
      impact: "2-3 horas perdidas por dia"
    },
    {
      icon: Calculator,
      title: "Perde tempo criando dietas manualmente?", 
      description: "Cálculos manuais de TMB, distribuição de macros e busca por alimentos na tabela TACO consomem tempo precioso.",
      impact: "1-2 horas por dieta"
    },
    {
      icon: TrendingDown,
      title: "Seus pacientes abandonam o tratamento?",
      description: "Sem acompanhamento contínuo e motivação, a taxa de abandono pode chegar a 60% nos primeiros 3 meses.",
      impact: "60% de abandono"
    },
    {
      icon: AlertTriangle,
      title: "Dificuldade para acompanhar progresso?",
      description: "Sem dados organizados e visualização clara, fica difícil avaliar a evolução e ajustar o tratamento rapidamente.",
      impact: "Decisões imprecisas"
    },
    {
      icon: Users,
      title: "Limitado no número de pacientes?",
      description: "Gestão manual limita sua capacidade de atender mais pessoas e crescer profissionalmente.",
      impact: "Crescimento limitado"
    },
    {
      icon: Clock,
      title: "Comunicação ineficiente?",
      description: "WhatsApp pessoal, ligações constantes e falta de organização nas mensagens prejudicam o relacionamento profissional.",
      impact: "Comunicação confusa"
    }
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Reconhece esses{' '}
            <span className="text-red-600">Desafios</span> na sua prática?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            A maioria dos nutricionistas enfrenta os mesmos obstáculos que impedem o crescimento profissional e a satisfação dos pacientes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {problems.map((problem, index) => {
            const IconComponent = problem.icon
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-red-100 dark:border-red-900/20">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/40 transition-colors">
                        <IconComponent className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-red-600 transition-colors">
                        {problem.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {problem.description}
                      </p>
                      <div className="inline-flex items-center px-2 py-1 bg-red-50 dark:bg-red-900/10 rounded text-xs font-medium text-red-700 dark:text-red-400">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {problem.impact}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pain Point Summary */}
        <div className="mt-16 text-center">
          <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-8 max-w-4xl mx-auto border border-red-200 dark:border-red-800/30">
            <h3 className="text-2xl font-bold text-red-600 mb-4">
              O Resultado Desses Problemas?
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-red-600 mb-2">-40%</div>
                <p className="text-sm text-muted-foreground">Produtividade perdida</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600 mb-2">60%</div>
                <p className="text-sm text-muted-foreground">Taxa de abandono</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600 mb-2">R$ 50k</div>
                <p className="text-sm text-muted-foreground">Receita perdida/ano</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}