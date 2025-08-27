'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboardVersion } from '@/hooks/useDashboardVersion'
import { 
  FlaskConical,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  MessageSquare
} from 'lucide-react'
import { useState } from 'react'

export function DashboardVersionToggle() {
  const { version, toggleVersion, revertToClassic, isBeta } = useDashboardVersion()
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState<'love' | 'neutral' | 'dislike' | null>(null)

  const handleFeedbackSubmit = () => {
    // Aqui você pode enviar o feedback para sua API
    console.log('Feedback enviado:', { version, rating, feedback })
    
    // Reset
    setFeedback('')
    setRating(null)
    setFeedbackOpen(false)
    
    // Mostrar mensagem de sucesso (você pode implementar um toast aqui)
    alert('Feedback enviado! Obrigado por nos ajudar a melhorar.')
  }

  return (
    <Card className={`border-2 ${isBeta ? 'border-blue-500 bg-blue-50/50' : 'border-zinc-200'} transition-all duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isBeta ? (
              <FlaskConical className="h-5 w-5 text-blue-600" />
            ) : (
              <Sparkles className="h-5 w-5 text-zinc-600" />
            )}
            <div>
              <h3 className="font-semibold text-sm">
                Dashboard {isBeta ? 'Beta' : 'Clássico'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isBeta ? 'Versão experimental com novas funcionalidades' : 'Versão estável e familiar'}
              </p>
            </div>
          </div>

          {isBeta && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              <FlaskConical className="w-3 h-3 mr-1" />
              TESTE
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Usar versão Beta</span>
            <Switch
              checked={isBeta}
              onCheckedChange={toggleVersion}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {isBeta && (
            <Button
              onClick={revertToClassic}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Voltar ao Original
            </Button>
          )}
        </div>

        {/* Aviso de segurança */}
        {isBeta && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700">
                <p className="font-medium mb-1">Modo de Teste</p>
                <p>Esta é uma versão experimental. Você pode voltar ao dashboard original a qualquer momento sem perder dados.</p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Widget */}
        {isBeta && (
          <div className="border-t pt-3">
            {!feedbackOpen ? (
              <Button
                onClick={() => setFeedbackOpen(true)}
                variant="ghost"
                size="sm"
                className="w-full text-xs"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Dar Feedback sobre a versão Beta
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium">Como está sendo sua experiência?</p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setRating('love')}
                    variant={rating === 'love' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    😍 Adorei
                  </Button>
                  <Button
                    onClick={() => setRating('neutral')}
                    variant={rating === 'neutral' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    😐 Neutro
                  </Button>
                  <Button
                    onClick={() => setRating('dislike')}
                    variant={rating === 'dislike' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                  >
                    😞 Prefiro o antigo
                  </Button>
                </div>

                {rating && (
                  <div className="space-y-2">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Por que? (opcional)"
                      className="w-full text-xs p-2 border border-zinc-200 rounded-md resize-none h-16"
                      maxLength={200}
                    />
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleFeedbackSubmit}
                        size="sm"
                        className="text-xs"
                      >
                        Enviar Feedback
                      </Button>
                      <Button
                        onClick={() => {
                          setFeedbackOpen(false)
                          setRating(null)
                          setFeedback('')
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}