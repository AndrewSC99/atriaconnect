import React from 'react'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MetricCard } from './metric-card'
import { ConsultationActions } from './consultation-actions'
import { 
  Calendar,
  User, 
  Weight,
  Ruler,
  Activity,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Heart,
  Droplets,
  Calculator,
  ChefHat,
  Scale
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Consultation {
  id: string
  date: string
  consultationNumber: number
  measures: {
    weight: number
    height: number
    imc: number
    waist: number
    hip: number
    neck: number
    chest: number
    abdomen: number
    shoulder: number
    armRight: number
    armLeft: number
    forearmRight: number
    forearmLeft: number
    wristRight: number
    wristLeft: number
    // Membros inferiores
    thighProximalRight: number
    thighProximalLeft: number
    thighDistalRight: number
    thighDistalLeft: number
    calfRight: number
    calfLeft: number
    // Dobras cutâneas
    triceps: number
    biceps: number
    thoracic: number
    subscapular: number
    midaxillary: number
    supraspinal: number
    suprailiac: number
    abdominal: number
    thighSkinfold: number
    calfSkinfold: number
    bodyFat: number
    muscleMass: number
    bodyWater: number
    bmr: number
  }
  energyData: {
    tmb: number
    get: number
    activityLevel: string
    carbPercentage: number
    proteinPercentage: number
    fatPercentage: number
    equation: string
  }
  dietPlan: {
    breakfast: string
    morningSnack: string
    lunch: string
    afternoonSnack: string
    dinner: string
    eveningSnack: string
    observations: string
    restrictions: string
  }
  notes: string
  progress: string
}

interface ConsultationAccordionProps {
  consultations: Consultation[]
  type: 'measures' | 'energy' | 'diet'
  expandedItems?: string[]
  onExpandedChange?: (value: string[]) => void
  className?: string
}

export function ConsultationAccordion({
  consultations,
  type,
  expandedItems = [],
  onExpandedChange,
  className
}: ConsultationAccordionProps) {
  const getConsultationType = (consultationNumber: number) => {
    if (consultationNumber === 1) return 'primeira'
    return consultationNumber <= 3 ? 'retorno' : 'acompanhamento'
  }

  const getTypeColor = (consultationType: string) => {
    switch (consultationType) {
      case 'primeira':
        return 'bg-emerald-600'
      case 'retorno':
        return 'bg-sky-600'
      case 'acompanhamento':
        return 'bg-zinc-600'
      default:
        return 'bg-zinc-600'
    }
  }

  const calculateTrend = (current: number, previous?: number) => {
    if (!previous) return null
    const diff = current - previous
    const percentage = ((diff / previous) * 100)
    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      value: Math.abs(diff),
      percentage: Math.abs(percentage)
    }
  }

  const renderMeasuresContent = (consultation: Consultation, previousConsultation?: Consultation) => {
    return (
      <div className="space-y-6">
        {/* Medidas Principais */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center">
            <Scale className="h-4 w-4 mr-2" />
            Composição Corporal
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              label="Altura"
              value={consultation.measures.height}
              unit="m"
              icon={Ruler}
              variant="detailed"
            />
            <MetricCard
              label="Massa Muscular"
              value={consultation.measures.muscleMass}
              unit="kg"
              icon={Activity}
              variant="detailed"
              trend={previousConsultation ? calculateTrend(consultation.measures.muscleMass, previousConsultation.measures.muscleMass)?.direction : undefined}
            />
            <MetricCard
              label="Água Corporal"
              value={consultation.measures.bodyWater}
              unit="%"
              icon={Droplets}
              variant="detailed"
              trend={previousConsultation ? calculateTrend(consultation.measures.bodyWater, previousConsultation.measures.bodyWater)?.direction : undefined}
            />
            <MetricCard
              label="TMB"
              value={consultation.measures.bmr}
              unit=" kcal"
              icon={Calculator}
              variant="detailed"
            />
          </div>
        </div>

        {/* Circunferências */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Circunferências (cm)
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { label: 'Quadril', value: consultation.measures.hip, key: 'hip' },
              { label: 'Pescoço', value: consultation.measures.neck, key: 'neck' },
              { label: 'Tórax', value: consultation.measures.chest, key: 'chest' },
              { label: 'Abdômen', value: consultation.measures.abdomen, key: 'abdomen' },
              { label: 'Ombro', value: consultation.measures.shoulder, key: 'shoulder' }
            ].map(item => (
              <MetricCard
                key={item.key}
                label={item.label}
                value={item.value}
                unit="cm"
                variant="compact"
                trend={previousConsultation ? calculateTrend(item.value, (previousConsultation.measures as any)[item.key])?.direction : undefined}
              />
            ))}
          </div>
        </div>

        {/* Membros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Membros Superiores (cm)
            </h4>
            <div className="space-y-2">
              {[
                { label: 'Braço Direito', value: consultation.measures.armRight },
                { label: 'Braço Esquerdo', value: consultation.measures.armLeft },
                { label: 'Antebraço Direito', value: consultation.measures.forearmRight },
                { label: 'Antebraço Esquerdo', value: consultation.measures.forearmLeft },
                { label: 'Pulso Direito', value: consultation.measures.wristRight },
                { label: 'Pulso Esquerdo', value: consultation.measures.wristLeft }
              ].map(item => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  unit="cm"
                  variant="compact"
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Membros Inferiores (cm)
            </h4>
            <div className="space-y-2">
              {[
                { label: 'Coxa Proximal Direita', value: consultation.measures.thighProximalRight },
                { label: 'Coxa Proximal Esquerda', value: consultation.measures.thighProximalLeft },
                { label: 'Coxa Distal Direita', value: consultation.measures.thighDistalRight },
                { label: 'Coxa Distal Esquerda', value: consultation.measures.thighDistalLeft },
                { label: 'Panturrilha Direita', value: consultation.measures.calfRight },
                { label: 'Panturrilha Esquerda', value: consultation.measures.calfLeft }
              ].map(item => (
                <MetricCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  unit="cm"
                  variant="compact"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dobras Cutâneas */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Dobras Cutâneas (mm)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { label: 'Tríceps', value: consultation.measures.triceps },
              { label: 'Bíceps', value: consultation.measures.biceps },
              { label: 'Torácica', value: consultation.measures.thoracic },
              { label: 'Subescapular', value: consultation.measures.subscapular },
              { label: 'Axilar Média', value: consultation.measures.midaxillary },
              { label: 'Supra-espinhal', value: consultation.measures.supraspinal },
              { label: 'Supra-ilíaca', value: consultation.measures.suprailiac },
              { label: 'Abdominal', value: consultation.measures.abdominal },
              { label: 'Coxa', value: consultation.measures.thighSkinfold },
              { label: 'Panturrilha', value: consultation.measures.calfSkinfold }
            ].map(item => (
              <MetricCard
                key={item.label}
                label={item.label}
                value={item.value}
                unit="mm"
                variant="compact"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderEnergyContent = (consultation: Consultation, previousConsultation?: Consultation) => {
    const getActivityLabel = (level: string) => {
      const labels = {
        sedentary: 'Sedentário',
        lightly_active: 'Levemente ativo',
        moderately_active: 'Moderadamente ativo',
        very_active: 'Muito ativo',
        extremely_active: 'Extremamente ativo'
      }
      return labels[level as keyof typeof labels] || level
    }

    return (
      <div className="space-y-6">
        {/* Gasto Energético */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Gasto Energético
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              label="TMB"
              value={consultation.energyData.tmb}
              unit=" kcal"
              icon={Calculator}
              variant="detailed"
            />
            <MetricCard
              label="GET Total"
              value={consultation.energyData.get}
              unit=" kcal"
              icon={Target}
              variant="detailed"
              trend={previousConsultation ? calculateTrend(consultation.energyData.get, previousConsultation.energyData.get)?.direction : undefined}
            />
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1">Nível de Atividade</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {getActivityLabel(consultation.energyData.activityLevel)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                Equação: {consultation.energyData.equation}
              </div>
            </div>
          </div>
        </div>

        {/* Distribuição de Macronutrientes */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
            Distribuição de Macronutrientes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Carboidratos</span>
                <span className="text-lg font-bold text-amber-900 dark:text-amber-100">{consultation.energyData.carbPercentage}%</span>
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300">
                {Math.round((consultation.energyData.get * consultation.energyData.carbPercentage / 100) / 4)}g por dia
              </div>
            </div>
            
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-rose-800 dark:text-rose-200">Proteínas</span>
                <span className="text-lg font-bold text-rose-900 dark:text-rose-100">{consultation.energyData.proteinPercentage}%</span>
              </div>
              <div className="text-xs text-rose-700 dark:text-rose-300">
                {Math.round((consultation.energyData.get * consultation.energyData.proteinPercentage / 100) / 4)}g por dia
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Gorduras</span>
                <span className="text-lg font-bold text-purple-900 dark:text-purple-100">{consultation.energyData.fatPercentage}%</span>
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300">
                {Math.round((consultation.energyData.get * consultation.energyData.fatPercentage / 100) / 9)}g por dia
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDietContent = (consultation: Consultation) => {
    const meals = [
      { key: 'breakfast', label: 'Café da Manhã', icon: '🍳', color: 'amber' },
      { key: 'morningSnack', label: 'Lanche da Manhã', icon: '🍎', color: 'emerald' },
      { key: 'lunch', label: 'Almoço', icon: '🍽️', color: 'blue' },
      { key: 'afternoonSnack', label: 'Lanche da Tarde', icon: '🥪', color: 'purple' },
      { key: 'dinner', label: 'Jantar', icon: '🍽️', color: 'rose' },
      { key: 'eveningSnack', label: 'Ceia', icon: '🥛', color: 'indigo' }
    ]

    return (
      <div className="space-y-6">
        {/* Plano Alimentar */}
        <div>
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center">
            <ChefHat className="h-4 w-4 mr-2" />
            Plano Alimentar
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meals.map(meal => (
              <div 
                key={meal.key} 
                className={cn(
                  "p-4 rounded-lg border",
                  meal.color === 'amber' && "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50",
                  meal.color === 'emerald' && "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50",
                  meal.color === 'blue' && "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50",
                  meal.color === 'purple' && "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/50",
                  meal.color === 'rose' && "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50",
                  meal.color === 'indigo' && "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/50"
                )}
              >
                <div className={cn(
                  "font-semibold mb-2 flex items-center",
                  meal.color === 'amber' && "text-amber-800 dark:text-amber-200",
                  meal.color === 'emerald' && "text-emerald-800 dark:text-emerald-200",
                  meal.color === 'blue' && "text-blue-800 dark:text-blue-200",
                  meal.color === 'purple' && "text-purple-800 dark:text-purple-200",
                  meal.color === 'rose' && "text-rose-800 dark:text-rose-200",
                  meal.color === 'indigo' && "text-indigo-800 dark:text-indigo-200"
                )}>
                  <span className="mr-2">{meal.icon}</span>
                  {meal.label}
                </div>
                <p className={cn(
                  "text-sm",
                  meal.color === 'amber' && "text-amber-700 dark:text-amber-300",
                  meal.color === 'emerald' && "text-emerald-700 dark:text-emerald-300",
                  meal.color === 'blue' && "text-blue-700 dark:text-blue-300",
                  meal.color === 'purple' && "text-purple-700 dark:text-purple-300",
                  meal.color === 'rose' && "text-rose-700 dark:text-rose-300",
                  meal.color === 'indigo' && "text-indigo-700 dark:text-indigo-300"
                )}>
                  {(consultation.dietPlan as any)[meal.key]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Observações e Restrições */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {consultation.dietPlan.observations && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Observações da Dieta</h5>
              <p className="text-sm text-blue-800 dark:text-blue-200">{consultation.dietPlan.observations}</p>
            </div>
          )}
          
          {consultation.dietPlan.restrictions && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800/50">
              <h5 className="font-medium text-rose-900 dark:text-rose-100 mb-2">Restrições</h5>
              <p className="text-sm text-rose-800 dark:text-rose-200">{consultation.dietPlan.restrictions}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSummaryMetrics = (consultation: Consultation, previousConsultation?: Consultation) => {
    switch (type) {
      case 'measures':
        return (
          <div className="grid grid-cols-4 gap-2">
            <MetricCard
              label="Peso"
              value={consultation.measures.weight}
              unit="kg"
              icon={Weight}
              trend={previousConsultation ? calculateTrend(consultation.measures.weight, previousConsultation.measures.weight)?.direction : undefined}
            />
            <MetricCard
              label="IMC"
              value={consultation.measures.imc}
              icon={Calculator}
              trend={previousConsultation ? calculateTrend(consultation.measures.imc, previousConsultation.measures.imc)?.direction : undefined}
            />
            <MetricCard
              label="% Gordura"
              value={consultation.measures.bodyFat}
              unit="%"
              icon={Activity}
              trend={previousConsultation ? calculateTrend(consultation.measures.bodyFat, previousConsultation.measures.bodyFat)?.direction : undefined}
            />
            <MetricCard
              label="Cintura"
              value={consultation.measures.waist}
              unit="cm"
              icon={Ruler}
              trend={previousConsultation ? calculateTrend(consultation.measures.waist, previousConsultation.measures.waist)?.direction : undefined}
            />
          </div>
        )
      case 'energy':
        return (
          <div className="grid grid-cols-4 gap-2">
            <MetricCard
              label="TMB"
              value={consultation.energyData.tmb}
              unit=" kcal"
              icon={Calculator}
            />
            <MetricCard
              label="GET"
              value={consultation.energyData.get}
              unit=" kcal"
              icon={Target}
              trend={previousConsultation ? calculateTrend(consultation.energyData.get, previousConsultation.energyData.get)?.direction : undefined}
            />
            <MetricCard
              label="Carboidratos"
              value={consultation.energyData.carbPercentage}
              unit="%"
              icon={ChefHat}
            />
            <MetricCard
              label="Proteínas"
              value={consultation.energyData.proteinPercentage}
              unit="%"
              icon={Activity}
            />
          </div>
        )
      case 'diet':
        return (
          <div className="grid grid-cols-3 gap-2">
            <MetricCard
              label="Status"
              value={consultation.consultationNumber === 1 ? 'Primeira' : 'Acompanhamento'}
              icon={Calendar}
            />
            <MetricCard
              label="Restrições"
              value={consultation.dietPlan.restrictions ? 'Sim' : 'Não'}
              icon={Heart}
            />
            <MetricCard
              label="Observações"
              value={consultation.dietPlan.observations ? 'Sim' : 'Não'}
              icon={User}
            />
          </div>
        )
      default:
        return null
    }
  }

  if (consultations.length === 0) {
    return (
      <Card className={cn("border-zinc-200 dark:border-zinc-700", className)}>
        <CardContent className="text-center py-12">
          <div className="h-12 w-12 text-zinc-400 mx-auto mb-4">
            {type === 'measures' && <Scale className="h-full w-full" />}
            {type === 'energy' && <Zap className="h-full w-full" />}
            {type === 'diet' && <ChefHat className="h-full w-full" />}
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Nenhuma consulta registrada
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Os dados das consultas aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Accordion 
        type="multiple" 
        value={expandedItems} 
        onValueChange={onExpandedChange}
        className="space-y-3"
      >
        {consultations.map((consultation, index) => {
          const previousConsultation = index > 0 ? consultations[index - 1] : undefined
          const consultationType = getConsultationType(consultation.consultationNumber)
          
          return (
            <AccordionItem 
              key={consultation.id} 
              value={consultation.id}
              className="border-0"
            >
              <Card className="border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                          getTypeColor(consultationType)
                        )}>
                          {consultation.consultationNumber}
                        </div>
                        <div className="text-left">
                          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Consulta {consultation.consultationNumber}
                          </div>
                          <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(consultation.date).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <ConsultationActions
                          consultationId={consultation.id}
                          consultationNumber={consultation.consultationNumber}
                          status="completed"
                          variant="minimal"
                          onExportPDF={(id) => console.log('Export PDF:', id)}
                          onEdit={(id) => console.log('Edit:', id)}
                          onDelete={(id) => console.log('Delete:', id)}
                        />
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <div className="mt-3">
                    {renderSummaryMetrics(consultation, previousConsultation)}
                  </div>
                </CardHeader>
                
                <AccordionContent className="pb-6">
                  <CardContent className="pt-0">
                    {type === 'measures' && renderMeasuresContent(consultation, previousConsultation)}
                    {type === 'energy' && renderEnergyContent(consultation, previousConsultation)}
                    {type === 'diet' && renderDietContent(consultation)}
                    
                    {/* Anotações e Progresso */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {consultation.notes && (
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
                          <h5 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Observações</h5>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">{consultation.notes}</p>
                        </div>
                      )}

                      {consultation.progress && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                          <h5 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">Progresso</h5>
                          <p className="text-sm text-emerald-800 dark:text-emerald-200">{consultation.progress}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}