'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { FlaskConical, Sparkles, RotateCcw } from 'lucide-react'

export function DashboardVersionToggleSimple() {
  const [isBeta, setIsBeta] = useState(false)

  // Debug: adicionar logs
  useEffect(() => {
    console.log('DashboardVersionToggleSimple montado, isBeta:', isBeta)
  }, [isBeta])

  const handleToggle = (checked: boolean) => {
    console.log('Toggle clicked, checked:', checked)
    setIsBeta(checked)
    localStorage.setItem('dashboardVersion', checked ? 'beta' : 'classic')
    
    // Forçar reload da página para garantir que a mudança seja aplicada
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const handleRevert = () => {
    console.log('Revert clicked')
    setIsBeta(false)
    localStorage.setItem('dashboardVersion', 'classic')
    window.location.reload()
  }

  // Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dashboardVersion')
    console.log('Loaded from localStorage:', saved)
    if (saved === 'beta') {
      setIsBeta(true)
    }
  }, [])

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
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {isBeta && (
            <Button
              onClick={handleRevert}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Voltar ao Original
            </Button>
          )}
        </div>

        {/* Debug info */}
        <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted rounded">
          <p>Debug: isBeta = {isBeta.toString()}</p>
          <p>LocalStorage: {typeof window !== 'undefined' ? localStorage.getItem('dashboardVersion') : 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  )
}