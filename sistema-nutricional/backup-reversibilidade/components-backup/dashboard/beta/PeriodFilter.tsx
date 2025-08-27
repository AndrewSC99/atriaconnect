'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type PeriodOption = 'today' | '7days' | '30days' | 'thisMonth' | 'lastMonth' | 'custom'

interface PeriodFilterProps {
  selected: PeriodOption
  onPeriodChange: (period: PeriodOption) => void
  className?: string
}

const periodLabels: Record<PeriodOption, string> = {
  today: 'Hoje',
  '7days': 'Últimos 7 dias',
  '30days': 'Últimos 30 dias',
  thisMonth: 'Este mês',
  lastMonth: 'Mês anterior',
  custom: 'Período customizado'
}

const periodDescriptions: Record<PeriodOption, string> = {
  today: 'Dados de hoje',
  '7days': 'Últimos 7 dias',
  '30days': 'Últimos 30 dias',
  thisMonth: 'Mês atual até hoje',
  lastMonth: 'Mês passado completo',
  custom: 'Selecione datas específicas'
}

export function PeriodFilter({ selected, onPeriodChange, className = '' }: PeriodFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePeriodSelect = (period: PeriodOption) => {
    onPeriodChange(period)
    setIsOpen(false)
    
    // Analytics (opcional)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'period_filter_changed', {
        event_category: 'dashboard',
        event_label: period
      })
    }
  }

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="justify-between min-w-[180px]"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{periodLabels[selected]}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          {Object.entries(periodLabels).map(([key, label]) => {
            const periodKey = key as PeriodOption
            
            return (
              <DropdownMenuItem
                key={key}
                onClick={() => handlePeriodSelect(periodKey)}
                className={`group cursor-pointer ${
                  selected === key ? 'bg-green-800 text-white' : 'hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{label}</span>
                  <span className={`text-xs ${
                    selected === key ? 'text-white/80' : 'text-muted-foreground group-hover:text-white/80'
                  }`}>
                    {periodDescriptions[periodKey]}
                  </span>
                </div>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Indicador visual do período selecionado */}
      <div className="mt-2">
        <div className="text-xs text-muted-foreground">
          {periodDescriptions[selected]}
        </div>
      </div>
    </div>
  )
}