'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ServiceSelector } from '@/components/booking/ServiceSelector'
import { CalendarView } from '@/components/booking/CalendarView'
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker'
import { BookingForm } from '@/components/booking/BookingForm'
import { PaymentSection } from '@/components/booking/PaymentSection'
import { BookingConflictModal } from '@/components/booking/BookingConflictModal'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
}

type Step = 'service' | 'datetime' | 'info' | 'payment' | 'success'

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const businessId = params.businessId as string

  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [conflictDateTime, setConflictDateTime] = useState<string | null>(null)
  const [pendingFormData, setPendingFormData] = useState<any>(null)

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setStep('datetime')
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setStep('info')
  }

  const handleFormSubmit = async (formData: any) => {
    if (!selectedService || !selectedDate || !selectedTime) return

    setLoading(true)
    try {
      const [hours, minutes] = selectedTime.split(':')
      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          serviceId: selectedService.id,
          ...formData,
          scheduledAt: scheduledAt.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if it's a conflict error (409 status)
        if (response.status === 409 && data.error?.includes('no longer available')) {
          // Show conflict resolution modal
          setConflictDateTime(scheduledAt.toISOString())
          setPendingFormData(formData)
          setShowConflictModal(true)
          return
        }
        throw new Error(data.error || 'Failed to create booking')
      }

      setBookingId(data.id)
      setStep('payment')
      toast.success('Booking created! Please complete payment.')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const handleConflictSlotSelected = (newDateTime: string) => {
    // Update the selected time with the new slot
    const newDate = new Date(newDateTime)
    const timeString = newDate.toTimeString().slice(0, 5) // HH:MM format
    
    setSelectedDate(newDate)
    setSelectedTime(timeString)
    setShowConflictModal(false)
    
    // Retry booking with new time
    if (pendingFormData) {
      handleFormSubmit(pendingFormData)
    }
  }

  const handleConflictRetry = () => {
    setShowConflictModal(false)
    // Retry with original time
    if (pendingFormData) {
      handleFormSubmit(pendingFormData)
    }
  }

  const handleConflictClose = () => {
    setShowConflictModal(false)
    setConflictDateTime(null)
    setPendingFormData(null)
  }

  const handlePaymentSuccess = () => {
    setStep('success')
    toast.success('Payment successful! Booking confirmed.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Book Your Service</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2">
            {['service', 'datetime', 'info', 'payment'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === s
                      ? 'bg-primary text-white'
                      : ['service', 'datetime', 'info', 'payment'].indexOf(step) >
                        ['service', 'datetime', 'info', 'payment'].indexOf(s)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i + 1}
                </div>
                {i < 3 && <div className="w-12 h-1 bg-gray-200 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Back Button */}
        {step !== 'service' && step !== 'success' && (
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 'datetime') setStep('service')
              if (step === 'info') setStep('datetime')
              if (step === 'payment') setStep('info')
            }}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {step === 'service' && (
            <ServiceSelector
              businessId={businessId}
              onSelect={handleServiceSelect}
              selected={selectedService || undefined}
            />
          )}

          {step === 'datetime' && selectedService && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Selected Service</h3>
                <p className="text-gray-600">
                  {selectedService.name} - {selectedService.duration} min
                </p>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <CalendarView onSelect={handleDateSelect} selected={selectedDate || undefined} />
                {selectedDate && (
                  <TimeSlotPicker
                    businessId={businessId}
                    serviceId={selectedService.id}
                    date={selectedDate}
                    onSelect={handleTimeSelect}
                    selected={selectedTime || undefined}
                  />
                )}
              </div>
            </div>
          )}

          {step === 'info' && selectedService && selectedDate && selectedTime && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-semibold">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{formatDate(selectedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                </div>
              </Card>

              <BookingForm onSubmit={handleFormSubmit} loading={loading} />
            </div>
          )}

          {step === 'payment' && bookingId && selectedService && (
            <PaymentSection
              bookingId={bookingId}
              amount={selectedService.price * 0.2}
              totalAmount={selectedService.price}
              onSuccess={handlePaymentSuccess}
            />
          )}

          {step === 'success' && (
            <Card className="p-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                You will receive a WhatsApp confirmation shortly.
              </p>
              <div className="space-y-2 text-left max-w-md mx-auto bg-gray-50 p-6 rounded-lg mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-mono">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-semibold">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-semibold">
                    {selectedDate && formatDate(selectedDate)} at {selectedTime}
                  </span>
                </div>
              </div>
              <Button onClick={() => router.push('/')}>Return to Home</Button>
            </Card>
          )}
        </div>
      </div>

      {/* Conflict Resolution Modal */}
      {showConflictModal && conflictDateTime && selectedService && (
        <BookingConflictModal
          isOpen={showConflictModal}
          onClose={handleConflictClose}
          businessId={businessId}
          serviceId={selectedService.id}
          requestedDateTime={conflictDateTime}
          onSlotSelected={handleConflictSlotSelected}
          onRetry={handleConflictRetry}
        />
      )}
    </div>
  )
}