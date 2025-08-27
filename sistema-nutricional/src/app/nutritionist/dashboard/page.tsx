'use client'

import { NutritionistLayout } from '@/components/layouts/nutritionist-layout'
import { NutritionistDashboard } from '@/components/dashboard/NutritionistDashboard'

export default function NutritionistDashboardPage() {
  return (
    <NutritionistLayout>
      <NutritionistDashboard />
    </NutritionistLayout>
  )
}