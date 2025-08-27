'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { 
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  BookOpen,
  Clock
} from 'lucide-react'

export function FAQSection() {
  const faqs = [
    {
      category: "Geral",
      questions: [
        {
          question: "O que é o Átria Connect?",
          answer: "O Átria Connect é um sistema nutricional completo que conecta nutricionistas e pacientes em uma plataforma digital moderna. Oferece ferramentas profissionais para gestão de consultório, criação de dietas, acompanhamento de pacientes e muito mais."
        },
        {
          question: "Como funciona o teste gratuito de 7 dias?",
          answer: "Você pode testar todas as funcionalidades do plano escolhido por 7 dias completos, sem cobrança e sem necessidade de cartão de crédito. Se gostar, pode continuar; caso contrário, pode cancelar sem qualquer custo."
        },
        {
          question: "Preciso de conhecimento técnico para usar?",
          answer: "Não! O Átria Connect foi desenvolvido para ser intuitivo e fácil de usar. Oferecemos onboarding completo, tutoriais em vídeo e suporte especializado para que você domine a plataforma rapidamente."
        },
        {
          question: "Meus dados estão seguros?",
          answer: "Sim! Utilizamos criptografia AES-256 (nível bancário), autenticação 2FA, backup automático e somos totalmente compliance com a LGPD. Seus dados e dos seus pacientes estão 100% protegidos."
        }
      ]
    },
    {
      category: "Funcionalidades",
      questions: [
        {
          question: "A Tabela TACO está completa?",
          answer: "Sim! Temos a Tabela TACO mais completa do mercado com 597 alimentos brasileiros, incluindo composição nutricional detalhada, busca avançada por nutrientes e atualizações constantes baseadas na versão oficial."
        },
        {
          question: "Posso criar dietas personalizadas?",
          answer: "Claro! Nosso criador de dietas permite total personalização: cálculo automático de TMB/GET, distribuição de macros, substituições inteligentes, templates personalizados e muito mais. Economize horas na criação de planos alimentares."
        },
        {
          question: "Como funciona o app para pacientes?",
          answer: "Os pacientes têm acesso a um app mobile completo onde podem visualizar sua dieta, registrar refeições com fotos, acompanhar evolução, conversar com você e muito mais. Aumenta drasticamente a adesão ao tratamento."
        },
        {
          question: "Posso agendar consultas pelo sistema?",
          answer: "Sim! Temos agenda integrada com Google Calendar, lembretes automáticos por email/SMS, videoconferência integrada e gestão completa de horários. Reduz no-show em até 80%."
        }
      ]
    },
    {
      category: "Planos e Pagamento",
      questions: [
        {
          question: "Qual a diferença entre os planos?",
          answer: "O Plano Essencial (R$ 97/mês) é ideal para iniciantes com até 20 pacientes. O Profissional (R$ 197/mês) oferece pacientes ilimitados, Tabela TACO completa, app mobile, recursos avançados e suporte prioritário."
        },
        {
          question: "Posso trocar de plano depois?",
          answer: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As mudanças são aplicadas imediatamente e você paga apenas a diferença proporcional (no caso de upgrade)."
        },
        {
          question: "Como funciona o cancelamento?",
          answer: "Sem pegadinhas! Você pode cancelar a qualquer momento pelo próprio sistema. Seus dados ficam disponíveis por mais 30 dias para download. Não há multas, taxas ou burocracia."
        },
        {
          question: "Aceita qual forma de pagamento?",
          answer: "Aceitamos cartão de crédito (Visa, Mastercard, Elo), PIX e boleto bancário. O pagamento é 100% seguro através do Stripe, uma das maiores empresas de pagamento do mundo."
        }
      ]
    },
    {
      category: "Suporte e Implementação",
      questions: [
        {
          question: "Como é feita a migração dos meus dados?",
          answer: "Nossa equipe faz a migração gratuita dos seus dados atuais (planilhas, outros sistemas, etc.). Agendamos uma consultoria para entender suas necessidades e garantir que tudo seja transferido corretamente."
        },
        {
          question: "Que tipo de suporte vocês oferecem?",
          answer: "Oferecemos suporte especializado em nutrição via chat, email e WhatsApp (plano Profissional). Também temos tutoriais em vídeo, webinars ao vivo e uma comunidade ativa de usuários."
        },
        {
          question: "Preciso instalar algum software?",
          answer: "Não! O Átria Connect funciona 100% no navegador (Chrome, Safari, Firefox, Edge). Também temos apps nativos para iOS e Android. Funciona em qualquer computador, tablet ou celular."
        },
        {
          question: "O sistema funciona offline?",
          answer: "O app mobile funciona parcialmente offline - você pode visualizar dados já carregados e fazer registros que são sincronizados quando voltar a conexão. A versão web requer internet."
        }
      ]
    }
  ]

  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Chat ao Vivo",
      description: "Atendimento imediato via chat",
      availability: "24/7",
      color: "blue"
    },
    {
      icon: Phone,
      title: "WhatsApp",
      description: "Suporte prioritário via WhatsApp",
      availability: "Seg-Sex, 8h-18h",
      color: "green"
    },
    {
      icon: Mail,
      title: "Email",
      description: "Suporte técnico por email",
      availability: "Resposta em 2h",
      color: "purple"
    },
    {
      icon: BookOpen,
      title: "Base de Conhecimento",
      description: "Tutoriais e documentação",
      availability: "Sempre disponível",
      color: "orange"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "text-blue-600",
      green: "text-green-600",
      purple: "text-purple-600",
      orange: "text-orange-600"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <section id="faq" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <HelpCircle className="mr-2 h-4 w-4" />
            Perguntas Frequentes
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Tire suas{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dúvidas
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Respostas para as principais dúvidas sobre o Átria Connect. Não encontrou sua pergunta? 
            Entre em contato conosco!
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                {category.category}
              </h3>
              
              <Card>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`} className="border-b last:border-b-0">
                        <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                          <span className="font-medium text-foreground pr-4">
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Support Options */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Canais de Suporte
            </h3>
            <p className="text-muted-foreground">
              Estamos sempre disponíveis para ajudar você
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {supportOptions.map((option, index) => {
              const OptionIcon = option.icon
              return (
                <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <OptionIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">
                      {option.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {option.description}
                    </p>
                    <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{option.availability}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Ainda tem dúvidas?
              </h3>
              <p className="text-muted-foreground mb-6">
                Nossa equipe especializada está pronta para esclarecer qualquer questão 
                e ajudar você a escolher o melhor plano para suas necessidades.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Conversar no Chat
                </Button>
                <Button variant="outline" size="lg">
                  <Phone className="mr-2 h-4 w-4" />
                  Agendar Demonstração
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}