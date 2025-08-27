import { User, Patient, Nutritionist, Diet, DietMeal, Recipe, Metric, Appointment, FoodLog, Checklist, MedicalRecord } from '@prisma/client'

export type UserWithRelations = User & {
  patient?: Patient | null
  nutritionist?: Nutritionist | null
}

export type PatientWithRelations = Patient & {
  user: User
  nutritionist?: Nutritionist | null
  diets?: Diet[]
  metrics?: Metric[]
  appointments?: Appointment[]
  foodLogs?: FoodLog[]
  checklists?: Checklist[]
  medicalRecords?: MedicalRecord[]
}

export type NutritionistWithRelations = Nutritionist & {
  user: User
  patients?: Patient[]
  diets?: Diet[]
  appointments?: Appointment[]
  recipes?: Recipe[]
}

export type DietWithMeals = Diet & {
  meals: DietMeal[]
  patient: Patient
  nutritionist: Nutritionist
}

export type AppointmentWithRelations = Appointment & {
  patient: Patient & { user: User }
  nutritionist: Nutritionist & { user: User }
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'PATIENT' | 'NUTRITIONIST'
  crn?: string // Required for nutritionists
}

export interface PatientProfileForm {
  name: string
  email: string
  birthDate?: Date
  height?: number
  weight?: number
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  objective?: string
  restrictions?: string
  phone?: string
  address?: string
}

export interface NutritionistProfileForm {
  name: string
  email: string
  crn: string
  specialty?: string
  experience?: number
  bio?: string
  phone?: string
  address?: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Chart data types
export interface MetricChartData {
  date: string
  value: number
  type: string
}

export interface NutritionChartData {
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}