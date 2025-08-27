'use client'

export interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  url?: string
  error?: string
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  fileId: string
}

export class UploadService {
  private uploads: Map<string, UploadFile> = new Map()
  private onProgressCallbacks: Map<string, (progress: number) => void> = new Map()
  private onCompleteCallbacks: Map<string, (result: UploadResult) => void> = new Map()

  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void,
    onComplete?: (result: UploadResult) => void
  ): Promise<string> {
    const fileId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const uploadFile: UploadFile = {
      file,
      id: fileId,
      progress: 0,
      status: 'pending'
    }

    this.uploads.set(fileId, uploadFile)
    
    if (onProgress) {
      this.onProgressCallbacks.set(fileId, onProgress)
    }
    
    if (onComplete) {
      this.onCompleteCallbacks.set(fileId, onComplete)
    }

    // Validações
    const validation = this.validateFile(file)
    if (!validation.valid) {
      const result: UploadResult = {
        success: false,
        error: validation.error,
        fileId
      }
      
      uploadFile.status = 'error'
      uploadFile.error = validation.error
      
      onComplete?.(result)
      return fileId
    }

    // Iniciar upload
    this.startUpload(fileId)
    
    return fileId
  }

  private validateFile(file: File): { valid: boolean; error?: string } {
    // Tamanho máximo: 10MB
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return { valid: false, error: 'Arquivo muito grande. Máximo 10MB.' }
    }

    // Tipos permitidos
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Tipo de arquivo não suportado.' }
    }

    return { valid: true }
  }

  private async startUpload(fileId: string) {
    const uploadFile = this.uploads.get(fileId)
    if (!uploadFile) return

    uploadFile.status = 'uploading'
    this.updateProgress(fileId, 0)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile.file)
      formData.append('fileId', fileId)

      const xhr = new XMLHttpRequest()

      // Monitorar progresso
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100)
          this.updateProgress(fileId, progress)
        }
      })

      // Resultado do upload
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            this.completeUpload(fileId, {
              success: true,
              url: response.url,
              fileId
            })
          } catch (error) {
            this.completeUpload(fileId, {
              success: false,
              error: 'Erro ao processar resposta do servidor',
              fileId
            })
          }
        } else {
          this.completeUpload(fileId, {
            success: false,
            error: `Erro no upload: ${xhr.statusText}`,
            fileId
          })
        }
      })

      xhr.addEventListener('error', () => {
        this.completeUpload(fileId, {
          success: false,
          error: 'Erro de rede durante o upload',
          fileId
        })
      })

      xhr.open('POST', '/api/upload')
      xhr.send(formData)

    } catch (error) {
      this.completeUpload(fileId, {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        fileId
      })
    }
  }

  private updateProgress(fileId: string, progress: number) {
    const uploadFile = this.uploads.get(fileId)
    if (uploadFile) {
      uploadFile.progress = progress
      const callback = this.onProgressCallbacks.get(fileId)
      callback?.(progress)
    }
  }

  private completeUpload(fileId: string, result: UploadResult) {
    const uploadFile = this.uploads.get(fileId)
    if (uploadFile) {
      uploadFile.status = result.success ? 'completed' : 'error'
      uploadFile.url = result.url
      uploadFile.error = result.error
      uploadFile.progress = result.success ? 100 : uploadFile.progress

      const callback = this.onCompleteCallbacks.get(fileId)
      callback?.(result)
    }
  }

  getUpload(fileId: string): UploadFile | undefined {
    return this.uploads.get(fileId)
  }

  cancelUpload(fileId: string) {
    const uploadFile = this.uploads.get(fileId)
    if (uploadFile && uploadFile.status === 'uploading') {
      uploadFile.status = 'error'
      uploadFile.error = 'Upload cancelado'
      
      const callback = this.onCompleteCallbacks.get(fileId)
      callback?.({
        success: false,
        error: 'Upload cancelado',
        fileId
      })
    }
  }

  clearUpload(fileId: string) {
    this.uploads.delete(fileId)
    this.onProgressCallbacks.delete(fileId)
    this.onCompleteCallbacks.delete(fileId)
  }

  // Helpers para diferentes tipos de arquivo
  static isImage(file: File): boolean {
    return file.type.startsWith('image/')
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  static getFileIcon(file: File): string {
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type === 'application/pdf') return '📄'
    if (file.type.includes('word')) return '📝'
    if (file.type.includes('sheet') || file.type.includes('excel')) return '📊'
    if (file.type.startsWith('text/')) return '📄'
    return '📎'
  }
}

// Instância singleton
let uploadServiceInstance: UploadService | null = null

export function getUploadService(): UploadService {
  if (typeof window === 'undefined') {
    // Mock para servidor
    return {
      uploadFile: () => Promise.resolve('mock_id'),
      getUpload: () => undefined,
      cancelUpload: () => {},
      clearUpload: () => {}
    } as any
  }

  if (!uploadServiceInstance) {
    uploadServiceInstance = new UploadService()
  }

  return uploadServiceInstance
}