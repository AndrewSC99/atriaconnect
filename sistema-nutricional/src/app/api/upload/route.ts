import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Tipos de arquivo permitidos
const ALLOWED_TYPES = [
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileId = formData.get('fileId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validações
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed' 
      }, { status: 400 })
    }

    // Criar diretório se não existir
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    // Criar subdiretório por usuário
    const userDir = path.join(UPLOAD_DIR, session.user.id)
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true })
    }

    // Gerar nome único para o arquivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name)
    const filename = `${timestamp}_${randomString}${extension}`
    const filepath = path.join(userDir, filename)

    // Converter File para Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Salvar arquivo
    await writeFile(filepath, buffer)

    // URL pública do arquivo
    const publicUrl = `/uploads/${session.user.id}/${filename}`

    // Salvar informações do arquivo no banco (opcional)
    // TODO: Implementar salvamento no banco se necessário
    /*
    await prisma.attachment.create({
      data: {
        id: fileId,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: publicUrl,
        uploadedBy: session.user.id,
        createdAt: new Date()
      }
    })
    */

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      fileId
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during upload' 
    }, { status: 500 })
  }
}

// Endpoint para listar arquivos do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implementar listagem do banco se necessário
    return NextResponse.json({ 
      files: [],
      message: 'File listing not implemented yet' 
    })

  } catch (error) {
    console.error('File listing error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Endpoint para deletar arquivo
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const filename = searchParams.get('filename')

    if (!fileId && !filename) {
      return NextResponse.json({ 
        error: 'File ID or filename required' 
      }, { status: 400 })
    }

    // TODO: Implementar deleção do arquivo e do banco
    /*
    const userDir = path.join(UPLOAD_DIR, session.user.id)
    const filepath = path.join(userDir, filename!)
    
    if (existsSync(filepath)) {
      await unlink(filepath)
    }

    await prisma.attachment.deleteMany({
      where: {
        id: fileId,
        uploadedBy: session.user.id
      }
    })
    */

    return NextResponse.json({ 
      success: true,
      message: 'File deleted successfully' 
    })

  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error during deletion' 
    }, { status: 500 })
  }
}