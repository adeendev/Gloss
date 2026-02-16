// ============================================
// FILE: src/components/booking/BookingForm.tsx
// ============================================

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Phone, Mail, MessageSquare, MapPin } from 'lucide-react'

interface BookingFormData {
  customerName: string
  customerPhone: string
  customerEmail: string
  city: string
  notes: string
}

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void
  loading?: boolean
}

export function BookingForm({ onSubmit, loading }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    city: '',
    notes: '',
  })

  const [errors, setErrors] = useState<Partial<BookingFormData>>({})

  const validate = () => {
    const newErrors: Partial<BookingFormData> = {}

    if (!formData.customerName || formData.customerName.length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters'
    }

    if (!formData.customerPhone || !/^\+?[1-9]\d{1,14}$/.test(formData.customerPhone)) {
      newErrors.customerPhone = 'Invalid phone number (include country code)'
    }

    if (!formData.city) {
      newErrors.city = 'Please select a city'
    }

    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Invalid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Information</h3>
        <p className="text-gray-600">
          Please provide your details so we can confirm your booking and send you updates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              Full Name *
            </Label>
            <div className="relative">
              <Input
                id="name"
                placeholder="Enter your full name"
                className={`pl-4 py-3 border-2 rounded-lg transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  errors.customerName ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'
                }`}
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
              />
            </div>
            {errors.customerName && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.customerName}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-500" />
              Phone Number *
            </Label>
            <div className="relative">
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                className={`pl-4 py-3 border-2 rounded-lg transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  errors.customerPhone ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'
                }`}
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
              />
            </div>
            {errors.customerPhone && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.customerPhone}
              </p>
            )}
            <p className="text-xs text-gray-500">Include country code (e.g., +1 for US)</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="city" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              City *
            </Label>
            <div className="relative">
              <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                <SelectTrigger className={`pl-4 py-3 border-2 rounded-lg transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                  errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'
                }`}>
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sydney">Sydney</SelectItem>
                  <SelectItem value="perth">Perth</SelectItem>
                  <SelectItem value="brisbane">Brisbane</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.city && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.city}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            Email Address <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              className={`pl-4 py-3 border-2 rounded-lg transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                errors.customerEmail ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-gray-200'
              }`}
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData({ ...formData, customerEmail: e.target.value })
              }
            />
          </div>
          {errors.customerEmail && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.customerEmail}
            </p>
          )}
          <p className="text-xs text-gray-500">We'll send booking confirmations and updates here</p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            Special Requests <span className="text-gray-400 font-normal">(optional)</span>
          </Label>
          <div className="relative">
            <Textarea
              id="notes"
              placeholder="Tell us about your vehicle, any specific areas of concern, or special requests..."
              className="pl-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 min-h-[120px] resize-none"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
          <p className="text-xs text-gray-500">
            Examples: "SUV with muddy interior", "Focus on scratches on driver door", "Pet hair removal needed"
          </p>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <Button 
            type="submit" 
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                Continue to Payment
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
