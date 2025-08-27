import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      )
    }

    // Check if CRN already exists for nutritionists
    if (validatedData.role === 'NUTRITIONIST' && validatedData.crn) {
      const existingNutritionist = await prisma.nutritionist.findUnique({
        where: { crn: validatedData.crn }
      })

      if (existingNutritionist) {
        return NextResponse.json(
          { error: 'CRN já está cadastrado' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          role: validatedData.role as UserRole,
        }
      })

      // Create role-specific profile
      if (validatedData.role === 'PATIENT') {
        await tx.patient.create({
          data: {
            userId: user.id,
          }
        })
      } else if (validatedData.role === 'NUTRITIONIST' && validatedData.crn) {
        await tx.nutritionist.create({
          data: {
            userId: user.id,
            crn: validatedData.crn,
          }
        })
      }

      return user
    })

    // Return success (without sensitive data)
    return NextResponse.json({
      success: true,
      message: 'Usuário criado com sucesso',
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
      }
    })

  } catch (error) {
    console.error('Registration error:', error)

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      )
    }

    // Handle Prisma errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Email ou CRN já estão cadastrados' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}