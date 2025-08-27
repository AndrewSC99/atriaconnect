'use client'

import { useState, useCallback } from 'react'
import { getUploadService, UploadFile, UploadResult } from '@/lib/upload-service'

interface FileUploadHook {
  uploads: UploadFile[]
  uploadFile: (file: File) => Promise<string>
  uploadFiles: (files: File[]) => Promise<string[]>
  cancelUpload: (fileId: string) => void
  clearUpload: (fileId: string) => void
  clearAllUploads: () => void
  isUploading: boolean
  totalProgress: number
}

export function useFileUpload(): FileUploadHook {
  const [uploads, setUploads] = useState<UploadFile[]>([])
  const uploadService = getUploadService()

  const updateUpload = useCallback((fileId: string, updates: Partial<UploadFile>) => {
    setUploads(prev => prev.map(upload => 
      upload.id === fileId ? { ...upload, ...updates } : upload
    ))
  }, [])

  const addUpload = useCallback((uploadFile: UploadFile) => {
    setUploads(prev => [...prev, uploadFile])
  }, [])

  const removeUpload = useCallback((fileId: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== fileId))
  }, [])

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const fileId = await uploadService.uploadFile(
      file,
      // onProgress
      (progress) => {
        updateUpload(fileId, { progress })
      },
      // onComplete  
      (result) => {
        updateUpload(fileId, {
          status: result.success ? 'completed' : 'error',
          url: result.url,
          error: result.error,
          progress: result.success ? 100 : undefined
        })
      }
    )

    // Adicionar à lista de uploads
    const uploadFile: UploadFile = {
      file,
      id: fileId,
      progress: 0,
      status: 'pending'
    }
    
    addUpload(uploadFile)

    return fileId
  }, [uploadService, updateUpload, addUpload])

  const uploadFiles = useCallback(async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadFile(file))
    return Promise.all(uploadPromises)
  }, [uploadFile])

  const cancelUpload = useCallback((fileId: string) => {
    uploadService.cancelUpload(fileId)
    updateUpload(fileId, { 
      status: 'error', 
      error: 'Upload cancelado' 
    })
  }, [uploadService, updateUpload])

  const clearUpload = useCallback((fileId: string) => {
    uploadService.clearUpload(fileId)
    removeUpload(fileId)
  }, [uploadService, removeUpload])

  const clearAllUploads = useCallback(() => {
    uploads.forEach(upload => {
      uploadService.clearUpload(upload.id)
    })
    setUploads([])
  }, [uploads, uploadService])

  // Calculados
  const isUploading = uploads.some(upload => upload.status === 'uploading')
  
  const totalProgress = uploads.length > 0
    ? Math.round(uploads.reduce((sum, upload) => sum + upload.progress, 0) / uploads.length)
    : 0

  return {
    uploads,
    uploadFile,
    uploadFiles,
    cancelUpload,
    clearUpload,
    clearAllUploads,
    isUploading,
    totalProgress
  }
}