'use client'

import React, { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import './login-styles.css'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        setError('Email ou senha inválidos')
        return
      }

      // Get session to determine user role and redirect
      const session = await getSession()
      if (session?.user?.role === 'PATIENT') {
        router.push('/patient/dashboard')
      } else if (session?.user?.role === 'NUTRITIONIST') {
        router.push('/nutritionist/dashboard')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Erro interno. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // Implementar login social aqui
    console.log(`Login com ${provider}`)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 gradient-bg login-form-container">
        <div className="w-full max-w-md space-y-8 form-elements">
          {/* Logo */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 logo-container">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">N</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold text-zinc-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                NutriConnect
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold text-zinc-900">
              Bem-vindo de volta
            </h1>
            <p className="text-lg text-zinc-600 leading-relaxed">
              Entre com seu email e senha para acessar sua conta
            </p>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm form-card">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50 error-message">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-zinc-700 required-field">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="h-12 border-zinc-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200 input-field"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-zinc-700 required-field">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      className="h-12 border-zinc-200 focus:border-green-500 focus:ring-green-500 transition-all duration-200 pr-10 input-field"
                      {...register('password')}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-zinc-600">
                      Lembrar de mim
                    </Label>
                  </div>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors hover-link"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg login-button"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 loading-spinner" />}
                  Entrar
                </Button>
              </form>

              {/* Social Login */}
              <div className="mt-8 space-y-4">
                <div className="relative">
                  <Separator className="my-4" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white px-4 text-sm text-zinc-500 font-medium">
                      Ou entre com
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="w-full bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-200 hover:shadow-md"
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                  >
                    <span className="mr-2 text-lg">G</span>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-white text-zinc-900 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-200 hover:shadow-md"
                    onClick={() => handleSocialLogin('apple')}
                    disabled={isLoading}
                  >
                    <span className="mr-2 text-lg">🍎</span>
                    Apple
                  </Button>
                </div>
              </div>

              {/* Registration Link */}
              <div className="mt-8 text-center">
                <p className="text-zinc-600">
                  Ainda não tem uma conta?{' '}
                  <Link
                    href="/register"
                    className="text-green-600 hover:text-green-700 hover:underline font-semibold transition-colors hover-link"
                  >
                    Criar conta
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-zinc-500 space-y-1">
            <p>Copyright © 2025 NutriConnect Enterprises LTD.</p>
            <p>
              <Link href="/privacy" className="hover:text-zinc-700 transition-colors hover-link">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Imagem do Casal na Duna */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden image-container">
        {/* Imagem de fundo usando CSS */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/casal-duna-hd.png')",
            backgroundPosition: 'center center',
            backgroundSize: 'cover'
          }}
        />
        
        {/* Overlay com texto */}
        <div className="absolute inset-0 flex items-end image-overlay z-10">
          <div className="w-full p-16 text-white">
            <div className="max-w-lg">
              <h2 className="text-5xl font-bold mb-6 leading-tight drop-shadow-lg">
                Momentos que
                <br />
                <span className="text-amber-200">transformam vidas</span>
              </h2>
              <p className="text-xl text-white/95 leading-relaxed mb-8 drop-shadow-md">
                Como este pôr do sol único, sua jornada de saúde e bem-estar também será especial e inesquecível
              </p>
              <div className="space-y-3 text-sm text-white/90">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-amber-300 rounded-full shadow-sm highlight-dot" style={{'--delay': '0.2s'}}></div>
                  <span className="font-medium">Cuide de quem você ama</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-amber-300 rounded-full shadow-sm highlight-dot" style={{'--delay': '0.4s'}}></div>
                  <span className="font-medium">Viva momentos especiais com saúde</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-amber-300 rounded-full shadow-sm highlight-dot" style={{'--delay': '0.6s'}}></div>
                  <span className="font-medium">Construa um futuro saudável juntos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}