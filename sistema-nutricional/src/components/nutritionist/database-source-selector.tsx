'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Database, 
  Building, 
  GraduationCap, 
  Calendar,
  FileText,
  Users,
  BarChart3,
  Info
} from 'lucide-react'

export interface DatabaseSource {
  id: 'taco' | 'ibge' | 'both'
  name: string
  fullName: string
  institution: string
  description: string
  foodCount: number
  version: string
  year: string
  icon: string
  color: string
  features: string[]
}

const DATABASE_SOURCES: DatabaseSource[] = [
  {
    id: 'taco',
    name: 'TACO',
    fullName: 'Tabela Brasileira de Composição de Alimentos',
    institution: 'NEPA/UNICAMP',
    description: 'Base de dados oficial com alimentos mais consumidos no Brasil, desenvolvida em parceria com o Ministério da Saúde.',
    foodCount: 597,
    version: '4ª Edição Ampliada e Revisada',
    year: '2011',
    icon: '📊',
    color: 'blue',
    features: [
      'Alimentos mais consumidos no Brasil',
      'Análises laboratoriais padronizadas',
      'Base para aplicações nutricionais',
      'Dados validados cientificamente'
    ]
  },
  {
    id: 'ibge',
    name: 'IBGE',
    fullName: 'Tabelas de Composição Nutricional dos Alimentos Consumidos no Brasil',
    institution: 'Instituto Brasileiro de Geografia e Estatística',
    description: 'Dados nutricionais baseados na Pesquisa de Orçamentos Familiares, representando o consumo real da população brasileira.',
    foodCount: 50,
    version: 'POF 2008-2009',
    year: '2008-2009',
    icon: '🏛️',
    color: 'green',
    features: [
      'Dados baseados em pesquisa populacional',
      'Alimentos consumidos no Brasil',
      'Representatividade nacional',
      'Contexto socioeconômico'
    ]
  },
  {
    id: 'both',
    name: 'Unificada',
    fullName: 'Base Unificada TACO + IBGE',
    institution: 'Sistema Nutricional',
    description: 'Combinação das duas principais bases de dados nutricionais brasileiras, oferecendo cobertura ampla e complementar.',
    foodCount: 647,
    version: 'Integrada',
    year: '2025',
    icon: '🔄',
    color: 'purple',
    features: [
      'Cobertura máxima de alimentos',
      'Dados complementares',
      'Busca unificada',
      'Comparação entre fontes'
    ]
  }
]

interface DatabaseSourceSelectorProps {
  activeSource: 'taco' | 'ibge' | 'both'
  onSourceChange: (source: 'taco' | 'ibge' | 'both') => void
  showDetails?: boolean
  compact?: boolean
}

export function DatabaseSourceSelector({ 
  activeSource, 
  onSourceChange, 
  showDetails = false,
  compact = true 
}: DatabaseSourceSelectorProps) {
  const [showInfo, setShowInfo] = useState(false)
  
  const activeSourceData = DATABASE_SOURCES.find(source => source.id === activeSource)
  
  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-muted-foreground">Fonte dos dados:</span>
          <div className="flex space-x-2">
            {DATABASE_SOURCES.map((source) => (
              <Button
                key={source.id}
                variant={activeSource === source.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSourceChange(source.id)}
                className="flex items-center space-x-2"
              >
                <span className="text-sm">{source.icon}</span>
                <span>{source.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {source.foodCount}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center space-x-1"
        >
          <Info className="h-4 w-4" />
          <span className="text-sm">Info</span>
        </Button>
        
        {showInfo && activeSourceData && (
          <div className="absolute top-16 right-0 z-10 w-80 p-4 bg-popover border rounded-lg shadow-lg">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{activeSourceData.icon}</span>
                <div>
                  <h4 className="font-semibold">{activeSourceData.fullName}</h4>
                  <p className="text-sm text-muted-foreground">{activeSourceData.institution}</p>
                </div>
              </div>
              <Separator />
              <p className="text-sm">{activeSourceData.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{activeSourceData.year}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3" />
                  <span>{activeSourceData.version}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Seleção de Base de Dados</span>
        </CardTitle>
        <CardDescription>
          Escolha a fonte de dados nutricionais para sua consulta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSource} onValueChange={(value) => onSourceChange(value as 'taco' | 'ibge' | 'both')}>
          <TabsList className="grid w-full grid-cols-3">
            {DATABASE_SOURCES.map((source) => (
              <TabsTrigger 
                key={source.id} 
                value={source.id}
                className="flex items-center space-x-2"
              >
                <span>{source.icon}</span>
                <span>{source.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {DATABASE_SOURCES.map((source) => (
            <TabsContent key={source.id} value={source.id} className="mt-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{source.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{source.fullName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center space-x-1">
                        <Building className="h-3 w-3" />
                        <span>{source.institution}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{source.year}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" />
                        <span>{source.version}</span>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{source.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          <span className="font-medium">Estatísticas</span>
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {source.foodCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">alimentos</div>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-medium">Características</span>
                        </div>
                        <div className="space-y-1">
                          {source.features.map((feature, index) => (
                            <div key={index} className="text-xs text-muted-foreground">
                              • {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default DatabaseSourceSelector