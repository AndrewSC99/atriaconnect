'use client'

import { useState, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useFileUpload } from '@/hooks/useFileUpload'
import { UploadService } from '@/lib/upload-service'
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  File,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFilesUploaded: (files: Array<{ url: string; name: string; type: string; size: number }>) => void
  maxFiles?: number
  acceptedTypes?: string[]
}

export function FileUploadModal({
  isOpen,
  onClose,
  onFilesUploaded,
  maxFiles = 5,
  acceptedTypes = ['image/*', 'application/pdf', '.doc,.docx,.txt,.xls,.xlsx']
}: FileUploadModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    uploads,
    uploadFiles,
    cancelUpload,
    clearUpload,
    clearAllUploads,
    isUploading
  } = useFileUpload()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles)
      handleFiles(files)
    }
  }, [maxFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, maxFiles)
      handleFiles(files)
    }
  }, [maxFiles])

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    try {
      await uploadFiles(files)
    } catch (error) {
      console.error('Erro no upload:', error)
    }
  }, [uploadFiles])

  const handleSend = useCallback(() => {
    const completedUploads = uploads.filter(upload => upload.status === 'completed')
    
    if (completedUploads.length === 0) return

    const files = completedUploads.map(upload => ({
      url: upload.url!,
      name: upload.file.name,
      type: upload.file.type,
      size: upload.file.size
    }))

    onFilesUploaded(files)
    clearAllUploads()
    onClose()
  }, [uploads, onFilesUploaded, clearAllUploads, onClose])

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />
    if (file.type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />
    return <File className="h-8 w-8 text-gray-500" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'uploading':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'uploading':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const completedUploads = uploads.filter(upload => upload.status === 'completed')
  const hasCompletedUploads = completedUploads.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Arquivos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Área de Upload */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Máximo {maxFiles} arquivos, até 10MB cada
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Tipos suportados: Imagens, PDF, Word, Excel, TXT
            </p>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mx-auto"
            >
              Selecionar Arquivos
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Lista de Uploads */}
          {uploads.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Arquivos Selecionados</h4>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {uploads.map((upload) => (
                  <div key={upload.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {getFileIcon(upload.file)}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {upload.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {UploadService.formatFileSize(upload.file.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(upload.status)}
                        >
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(upload.status)}
                            <span className="text-xs">
                              {upload.status === 'completed' && 'Concluído'}
                              {upload.status === 'uploading' && 'Enviando...'}
                              {upload.status === 'error' && 'Erro'}
                              {upload.status === 'pending' && 'Pendente'}
                            </span>
                          </div>
                        </Badge>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (upload.status === 'uploading') {
                              cancelUpload(upload.id)
                            } else {
                              clearUpload(upload.id)
                            }
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    {upload.status === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={upload.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {upload.progress}% concluído
                        </p>
                      </div>
                    )}

                    {/* Mensagem de Erro */}
                    {upload.status === 'error' && upload.error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-600">
                          {upload.error}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                clearAllUploads()
                onClose()
              }}
            >
              Cancelar
            </Button>

            <div className="space-x-2">
              {uploads.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllUploads}
                  disabled={isUploading}
                >
                  Limpar Todos
                </Button>
              )}
              
              <Button
                onClick={handleSend}
                disabled={!hasCompletedUploads || isUploading}
              >
                Enviar ({completedUploads.length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}