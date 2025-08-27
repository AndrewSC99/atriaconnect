"use client"

import { Leaf, Heart } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
          <Heart className="w-2 h-2 text-white" />
        </div>
      </div>
      <span className="text-xl font-bold text-zinc-900">NutriConnect</span>
    </div>
  )
}
