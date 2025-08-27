'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  X,
  User,
  MessageCircle,
  FileText,
  Image,
  Clock,
  Tag
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SearchFilters {
  query: string
  sender?: string
  dateFrom?: Date
  dateTo?: Date
  messageType?: 'all' | 'text' | 'image' | 'file'
  hasAttachments?: boolean
  tags: string[]
  priority?: 'all' | 'normal' | 'high' | 'urgent'
  readStatus?: 'all' | 'read' | 'unread'
}

interface SearchResult {
  messageId: string
  conversationId: string
  content: string
  senderName: string
  senderType: 'patient' | 'nutritionist'
  timestamp: string
  type: 'text' | 'image' | 'file'
  priority?: 'normal' | 'high' | 'urgent'
  tags: string[]
  hasAttachments: boolean
  patientName?: string
  highlighted: string
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => Promise<SearchResult[]>
  onSelectMessage: (messageId: string, conversationId: string) => void
  availableTags?: string[]
  availablePatients?: Array<{ id: string; name: string }>
}

export function AdvancedSearch({
  onSearch,
  onSelectMessage,
  availableTags = ['emagrecimento', 'diabetes', 'hipertensão', 'vegetariano', 'primeira-consulta'],
  availablePatients = []
}: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: []
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Reset filters when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFilters({
        query: '',
        tags: []
      })
      setResults([])
      setSelectedTags([])
    }
  }, [isOpen])

  const handleSearch = useCallback(async () => {
    if (!filters.query.trim() && selectedTags.length === 0) return

    setIsSearching(true)
    try {
      const searchFilters = {
        ...filters,
        tags: selectedTags
      }
      const searchResults = await onSearch(searchFilters)
      setResults(searchResults)
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setIsSearching(false)
    }
  }, [filters, selectedTags, onSearch])

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const clearAllFilters = () => {
    setFilters({
      query: '',
      tags: []
    })
    setSelectedTags([])
    setResults([])
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />
      case 'file':
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Busca avançada">
          <Search className="h-4 w-4 mr-2" />
          Busca Avançada
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Busca Avançada de Mensagens
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Buscar</TabsTrigger>
            <TabsTrigger value="results" disabled={results.length === 0}>
              Resultados ({results.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Campo de busca principal */}
            <div className="space-y-2">
              <Label htmlFor="query">Buscar por palavras-chave</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="query"
                  placeholder="Digite palavras-chave para buscar nas mensagens..."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch()
                    }
                  }}
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Remetente */}
              <div className="space-y-2">
                <Label>Remetente</Label>
                <Select
                  value={filters.sender || ''}
                  onValueChange={(value) => 
                    setFilters({ ...filters, sender: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="nutritionist">Nutricionista</SelectItem>
                    <SelectItem value="patient">Paciente</SelectItem>
                    {availablePatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo de mensagem */}
              <div className="space-y-2">
                <Label>Tipo de Mensagem</Label>
                <Select
                  value={filters.messageType || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, messageType: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="image">Imagem</SelectItem>
                    <SelectItem value="file">Arquivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data início */}
              <div className="space-y-2">
                <Label>Data inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateFrom ? (
                        format(filters.dateFrom, 'dd/MM/yyyy', { locale: ptBR })
                      ) : (
                        'Selecionar data'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data fim */}
              <div className="space-y-2">
                <Label>Data final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateTo ? (
                        format(filters.dateTo, 'dd/MM/yyyy', { locale: ptBR })
                      ) : (
                        'Selecionar data'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Prioridade */}
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={filters.priority || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, priority: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status de leitura */}
              <div className="space-y-2">
                <Label>Status de Leitura</Label>
                <Select
                  value={filters.readStatus || 'all'}
                  onValueChange={(value) => 
                    setFilters({ ...filters, readStatus: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="read">Lidas</SelectItem>
                    <SelectItem value="unread">Não lidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags
                  .filter(tag => !selectedTags.includes(tag))
                  .map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => addTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))
                }
              </div>
            </div>

            {/* Opções adicionais */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="attachments"
                  checked={filters.hasAttachments || false}
                  onCheckedChange={(checked) =>
                    setFilters({ ...filters, hasAttachments: checked as boolean })
                  }
                />
                <Label htmlFor="attachments" className="text-sm">
                  Apenas mensagens com anexos
                </Label>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={clearAllFilters}
              >
                Limpar Filtros
              </Button>

              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || (!filters.query.trim() && selectedTags.length === 0)}
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum resultado encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map(result => (
                  <div
                    key={result.messageId}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      onSelectMessage(result.messageId, result.conversationId)
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getMessageIcon(result.type)}
                        <div>
                          <p className="font-medium text-sm">
                            {result.senderName}
                            {result.patientName && (
                              <span className="text-muted-foreground ml-1">
                                ({result.patientName})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {result.timestamp}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {result.priority && result.priority !== 'normal' && (
                          <Badge className={getPriorityColor(result.priority)}>
                            {result.priority === 'urgent' ? 'Urgente' : 'Alta'}
                          </Badge>
                        )}
                        {result.hasAttachments && (
                          <Badge variant="outline" className="text-xs">
                            📎 Anexo
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 mb-2">
                      <div dangerouslySetInnerHTML={{ __html: result.highlighted }} />
                    </div>

                    {result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}