'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Users,
  MessageCircle,
  Clock,
  AlertTriangle,
  Target,
  Zap,
  Send,
  Edit3,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react'
import { PacienteRisco, TipoAcaoRapida, CanalComunicacao } from '@/types/quick-actions'

interface PatientSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (pacientesSelecionados: string[], mensagensPersonalizadas: Record<string, string>) => Promise<void>
  tipo: TipoAcaoRapida
  pacientesDisponiveis: PacienteRisco[]
  pacientesSugeridos: PacienteRisco[]
  titulo: string
  descricao: string
}

const getIconePrioridade = (prioridade: string) => {
  switch (prioridade) {
    case 'urgente': return <AlertTriangle className="h-3 w-3 text-red-500" />
    case 'alta': return <Target className="h-3 w-3 text-orange-500" />
    case 'media': return <Clock className="h-3 w-3 text-yellow-500" />
    default: return <Clock className="h-3 w-3 text-gray-500" />
  }
}

const getCorScore = (score: number) => {
  if (score >= 80) return 'bg-red-100 text-red-800'
  if (score >= 60) return 'bg-orange-100 text-orange-800'
  if (score >= 40) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

const getIconeCanal = (canal: CanalComunicacao) => {
  switch (canal) {
    case 'whatsapp': return <MessageCircle className="h-4 w-4 text-green-600" />
    case 'sms': return <Phone className="h-4 w-4 text-blue-600" />
    case 'email': return <Mail className="h-4 w-4 text-purple-600" />
  }
}

export function PatientSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  tipo,
  pacientesDisponiveis,
  pacientesSugeridos,
  titulo,
  descricao
}: PatientSelectionModalProps) {
  const [pacientesSelecionados, setPacientesSelecionados] = useState<Set<string>>(new Set())
  const [mensagensPersonalizadas, setMensagensPersonalizadas] = useState<Record<string, string>>({})
  const [filtro, setFiltro] = useState('')
  const [filtroScore, setFiltroScore] = useState<'todos' | 'alto' | 'medio' | 'baixo'>('todos')
  const [modoVisualizacao, setModoVisualizacao] = useState<'sugeridos' | 'todos'>('sugeridos')
  const [editandoMensagem, setEditandoMensagem] = useState<string | null>(null)

  // Inicializar com pacientes sugeridos selecionados
  useEffect(() => {
    const sugeridos = new Set(pacientesSugeridos.map(p => p.id))
    setPacientesSelecionados(sugeridos)
    
    // Inicializar mensagens personalizadas
    const mensagensIniciais: Record<string, string> = {}
    pacientesSugeridos.forEach(paciente => {
      mensagensIniciais[paciente.id] = paciente.mensagemSugerida
    })
    setMensagensPersonalizadas(mensagensIniciais)
  }, [pacientesSugeridos])

  const pacientesParaExibir = modoVisualizacao === 'sugeridos' ? pacientesSugeridos : pacientesDisponiveis

  const pacientesFiltrados = pacientesParaExibir.filter(paciente => {
    // Filtro por nome
    if (filtro && !paciente.nome.toLowerCase().includes(filtro.toLowerCase())) {
      return false
    }
    
    // Filtro por score
    if (filtroScore === 'alto' && paciente.scorePrioridade < 70) return false
    if (filtroScore === 'medio' && (paciente.scorePrioridade < 40 || paciente.scorePrioridade >= 70)) return false
    if (filtroScore === 'baixo' && paciente.scorePrioridade >= 40) return false
    
    return true
  })

  const togglePaciente = (pacienteId: string, paciente: PacienteRisco) => {
    const novoselecionados = new Set(pacientesSelecionados)
    
    if (novoselecionados.has(pacienteId)) {
      novoselecionados.delete(pacienteId)
      const novasMensagens = { ...mensagensPersonalizadas }
      delete novasMensagens[pacienteId]
      setMensagensPersonalizadas(novasMensagens)
    } else {
      novoselecionados.add(pacienteId)
      setMensagensPersonalizadas(prev => ({
        ...prev,
        [pacienteId]: paciente.mensagemSugerida
      }))
    }
    
    setPacientesSelecionados(novoselecionados)
  }

  const atualizarMensagem = (pacienteId: string, mensagem: string) => {
    setMensagensPersonalizadas(prev => ({
      ...prev,
      [pacienteId]: mensagem
    }))
  }

  const handleConfirm = async () => {
    await onConfirm(Array.from(pacientesSelecionados), mensagensPersonalizadas)
    onClose()
  }

  const selecionarTodos = () => {
    const todosPacientes = new Set(pacientesFiltrados.map(p => p.id))
    setPacientesSelecionados(todosPacientes)
    
    const mensagensCompletas = { ...mensagensPersonalizadas }
    pacientesFiltrados.forEach(paciente => {
      if (!mensagensCompletas[paciente.id]) {
        mensagensCompletas[paciente.id] = paciente.mensagemSugerida
      }
    })
    setMensagensPersonalizadas(mensagensCompletas)
  }

  const desselecionarTodos = () => {
    setPacientesSelecionados(new Set())
    setMensagensPersonalizadas({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>{titulo}</span>
            <Badge variant="outline">{pacientesSelecionados.size} selecionados</Badge>
          </DialogTitle>
          <p className="text-muted-foreground">{descricao}</p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Controles */}
          <div className="flex flex-col space-y-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={modoVisualizacao === 'sugeridos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModoVisualizacao('sugeridos')}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  IA Sugeridos ({pacientesSugeridos.length})
                </Button>
                <Button
                  variant={modoVisualizacao === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setModoVisualizacao('todos')}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Todos ({pacientesDisponiveis.length})
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={selecionarTodos}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Selecionar Todos
                </Button>
                <Button variant="outline" size="sm" onClick={desselecionarTodos}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Desselecionar
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente por nome..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filtroScore} onValueChange={(value: any) => setFiltroScore(value)}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="alto">Score Alto</SelectItem>
                  <SelectItem value="medio">Score Médio</SelectItem>
                  <SelectItem value="baixo">Score Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Pacientes */}
          <ScrollArea className="flex-1 h-[400px]">
            <div className="space-y-3">
              {pacientesFiltrados.map((paciente) => {
                const selecionado = pacientesSelecionados.has(paciente.id)
                const editando = editandoMensagem === paciente.id
                
                return (
                  <Card 
                    key={paciente.id} 
                    className={`transition-all ${selecionado ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selecionado}
                          onCheckedChange={() => togglePaciente(paciente.id, paciente)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">{paciente.nome}</h4>
                              {getIconePrioridade(
                                paciente.scorePrioridade >= 80 ? 'urgente' :
                                paciente.scorePrioridade >= 60 ? 'alta' :
                                paciente.scorePrioridade >= 40 ? 'media' : 'baixa'
                              )}
                              <Badge className={getCorScore(paciente.scorePrioridade)}>
                                Score: {paciente.scorePrioridade}
                              </Badge>
                              {pacientesSugeridos.find(p => p.id === paciente.id) && (
                                <Badge variant="secondary">
                                  <Star className="h-3 w-3 mr-1" />
                                  Sugerido por IA
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {getIconeCanal(paciente.canalPreferido)}
                              <span className="text-xs text-muted-foreground capitalize">
                                {paciente.canalPreferido}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-3 w-3" />
                              <span>Última consulta: {new Date(paciente.ultimaConsulta).toLocaleDateString()}</span>
                            </div>
                            <div>
                              <span className="font-medium">Motivo:</span> {paciente.motivoContato}
                            </div>
                          </div>

                          {/* Histórico resumido */}
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                            <span>{paciente.historico.totalConsultas} consultas</span>
                            <span>{paciente.historico.faltas} faltas</span>
                            <span>{paciente.historico.taxaAdesao}% adesão</span>
                          </div>

                          {selecionado && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <div className="flex items-center justify-between mb-2">
                                <Label className="text-sm font-medium">Mensagem</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditandoMensagem(editando ? null : paciente.id)}
                                >
                                  <Edit3 className="h-3 w-3" />
                                  {editando ? 'Cancelar' : 'Editar'}
                                </Button>
                              </div>
                              
                              {editando ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={mensagensPersonalizadas[paciente.id] || ''}
                                    onChange={(e) => atualizarMensagem(paciente.id, e.target.value)}
                                    placeholder="Digite a mensagem personalizada..."
                                    className="min-h-[80px]"
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        atualizarMensagem(paciente.id, paciente.mensagemSugerida)
                                        setEditandoMensagem(null)
                                      }}
                                    >
                                      Restaurar Original
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => setEditandoMensagem(null)}
                                    >
                                      Salvar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2 bg-gray-50 rounded text-sm">
                                  {mensagensPersonalizadas[paciente.id] || paciente.mensagemSugerida}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {pacientesSelecionados.size} paciente{pacientesSelecionados.size !== 1 ? 's' : ''} selecionado{pacientesSelecionados.size !== 1 ? 's' : ''} para contato
          </div>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={pacientesSelecionados.size === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Confirmar Envio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}