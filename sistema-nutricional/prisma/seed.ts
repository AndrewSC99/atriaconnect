import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create a test patient
  const patientPassword = await bcrypt.hash('123456', 12)
  const patient = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'paciente@teste.com',
      password: patientPassword,
      role: 'PATIENT',
      patient: {
        create: {
          birthDate: new Date('1990-05-15'),
          height: 175,
          weight: 80,
          gender: 'MALE',
          objective: 'Perder peso e ganhar massa muscular'
        }
      }
    },
    include: {
      patient: true
    }
  })

  // Create a test nutritionist
  const nutritionistPassword = await bcrypt.hash('123456', 12)
  const nutritionist = await prisma.user.create({
    data: {
      name: 'Dra. Maria Santos',
      email: 'nutricionista@teste.com',
      password: nutritionistPassword,
      role: 'NUTRITIONIST',
      nutritionist: {
        create: {
          crn: 'CRN-1 12345',
          specialty: 'Nutrição Esportiva',
          experience: 5,
          bio: 'Especialista em nutrição esportiva e emagrecimento saudável'
        }
      }
    },
    include: {
      nutritionist: true
    }
  })

  console.log('✅ Created test patient:', {
    email: patient.email,
    name: patient.name,
    role: patient.role
  })

  console.log('✅ Created test nutritionist:', {
    email: nutritionist.email,
    name: nutritionist.name,
    role: nutritionist.role,
    crn: nutritionist.nutritionist?.crn
  })

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })