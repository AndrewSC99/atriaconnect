import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
  role: z.enum(['PATIENT', 'NUTRITIONIST'], {
    message: 'Tipo de usuário é obrigatório'
  }),
  crn: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
}).refine((data) => {
  if (data.role === 'NUTRITIONIST') {
    return data.crn && data.crn.length > 0
  }
  return true
}, {
  message: 'CRN é obrigatório para nutricionistas',
  path: ['crn']
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>