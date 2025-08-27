import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MoreHorizontal,
  FileText,
  Download,
  Edit,
  Trash2,
  Copy,
  Eye,
  Calendar,
  PrinterIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConsultationActionsProps {
  consultationId: string
  consultationNumber: number
  status?: 'completed' | 'scheduled' | 'cancelled'
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onDuplicate?: (id: string) => void
  onExportPDF?: (id: string) => void
  onViewDetails?: (id: string) => void
  onScheduleFollow?: (id: string) => void
  className?: string
  variant?: 'default' | 'minimal'
}

export function ConsultationActions({
  consultationId,
  consultationNumber,
  status = 'completed',
  onEdit,
  onDelete,
  onDuplicate,
  onExportPDF,
  onViewDetails,
  onScheduleFollow,
  className,
  variant = 'default'
}: ConsultationActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400">Concluída</Badge>
      case 'scheduled':
        return <Badge variant="outline" className="text-sky-600 border-sky-200 bg-sky-50 dark:bg-sky-950 dark:text-sky-400">Agendada</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-950 dark:text-rose-400">Cancelada</Badge>
      default:
        return null
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {getStatusBadge()}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-50 min-w-48 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
              <div className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { onViewDetails?.(consultationId); setIsMenuOpen(false) }}>
                <Eye className="mr-2 h-4 w-4 inline" />
                Ver Detalhes
              </div>
              <div className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { onExportPDF?.(consultationId); setIsMenuOpen(false) }}>
                <Download className="mr-2 h-4 w-4 inline" />
                Exportar PDF
              </div>
              <div className="h-px bg-muted my-1" />
              <div className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { onEdit?.(consultationId); setIsMenuOpen(false) }}>
                <Edit className="mr-2 h-4 w-4 inline" />
                Editar
              </div>
              <div className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-rose-600" onClick={() => { onDelete?.(consultationId); setIsMenuOpen(false) }}>
                <Trash2 className="mr-2 h-4 w-4 inline" />
                Excluir
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex items-center space-x-2">
        {getStatusBadge()}
        <Badge variant="secondary" className="text-xs">
          #{consultationNumber}
        </Badge>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails?.(consultationId)}
          className="h-7 px-2 text-xs"
        >
          <Eye className="mr-1 h-3 w-3" />
          Ver
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onExportPDF?.(consultationId)}
          className="h-7 px-2 text-xs"
        >
          <Download className="mr-1 h-3 w-3" />
          PDF
        </Button>

        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-50 min-w-56 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
              <div className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { onEdit?.(consultationId); setIsMenuOpen(false) }}>
                <Edit className="mr-2 h-4 w-4 inline" />
                Editar Consulta
              </div>
              <div className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { onDuplicate?.(consultationId); setIsMenuOpen(false) }}>
                <Copy className="mr-2 h-4 w-4 inline" />
                Duplicar como Nova
              </div>
              <div className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { onScheduleFollow?.(consultationId); setIsMenuOpen(false) }}>
                <Calendar className="mr-2 h-4 w-4 inline" />
                Agendar Retorno
              </div>
              <div className="h-px bg-muted my-1" />
              <div className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent" onClick={() => { onExportPDF?.(consultationId); setIsMenuOpen(false) }}>
                <PrinterIcon className="mr-2 h-4 w-4 inline" />
                Imprimir Relatório
              </div>
              <div className="h-px bg-muted my-1" />
              <div className="cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-rose-600" onClick={() => { onDelete?.(consultationId); setIsMenuOpen(false) }}>
                <Trash2 className="mr-2 h-4 w-4 inline" />
                Excluir Consulta
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}