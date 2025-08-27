'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'PATIENT'
    }
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar conta')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      console.error('Register error:', error)
      setError(error instanceof Error ? error.message : 'Erro interno. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>
                Conta criada com sucesso! Redirecionando para o login...
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Criar Conta
          </CardTitle>
          <CardDescription>
            Crie sua conta no Átria Connect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                {...register('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register('password')}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                {...register('confirmPassword')}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Tipo de usuário</Label>
              <RadioGroup value={selectedRole} className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="PATIENT" 
                    id="patient"
                    {...register('role')}
                  />
                  <Label htmlFor="patient" className="cursor-pointer">
                    Paciente
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="NUTRITIONIST" 
                    id="nutritionist"
                    {...register('role')}
                  />
                  <Label htmlFor="nutritionist" className="cursor-pointer">
                    Nutricionista
                  </Label>
                </div>
              </RadioGroup>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {selectedRole === 'NUTRITIONIST' && (
              <div className="space-y-2">
                <Label htmlFor="crn">CRN (Registro Profissional)</Label>
                <Input
                  id="crn"
                  type="text"
                  placeholder="Ex: CRN-1 12345"
                  {...register('crn')}
                  disabled={isLoading}
                />
                {errors.crn && (
                  <p className="text-sm text-red-600">{errors.crn.message}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}