'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ServiceSelector } from '@/components/booking/ServiceSelector'
import { CalendarView } from '@/components/booking/CalendarView'
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker'
import { BookingForm } from '@/components/booking/BookingForm'
import { PaymentSection } from '@/components/booking/PaymentSection'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { formatDate, formatTime, calculateAdvanceAmount } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
}

type Step = 'service' | 'datetime' | 'info' | 'payment' | 'success'

export default function BookingPage() {
  const router = useRouter()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [step, setStep] = useState<Step>('service')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string
    advanceAmount: number
    totalAmount: number
    advancePercentage: number
  } | null>(null)

  useEffect(() => {
    fetchBusiness()
  }, [])

  const fetchBusiness = async () => {
    try {
      const response = await fetch('/api/businesses')
      if (!response.ok) {
        throw new Error('Failed to fetch business')
      }
      const data = await response.json()
      
      if (data.length === 0) {
        toast.error('No business found')
        return
      }
      
      // Use the first (and should be only) business
      setBusinessId(data[0].id)
    } catch (error) {
      console.error('Error fetching business:', error)
      toast.error('Failed to load business')
    } finally {
      setLoading(false)
    }
  }

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

  const handleBookingSubmit = async (formData: any) => {
    if (!selectedService || !selectedDate || !selectedTime || !businessId) return

    setBookingLoading(true)
    try {
      // Combine date and time into scheduledAt
      const [hours, minutes] = selectedTime.split(':')
      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      // Create payment intent with booking data (new payment-first flow)
      const response = await fetch('/api/payments/stripe/create-intent-prebooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          serviceId: selectedService.id,
          scheduledAt: scheduledAt.toISOString(),
          ...formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to prepare booking')
      }

      if (data.paymentIntentId && data.clientSecret) {
        // Store the payment intent ID temporarily as booking ID
        setBookingId(data.paymentIntentId)
        
        // Store payment data for the PaymentSection
        setPaymentData({
          clientSecret: data.clientSecret,
          advanceAmount: data.advanceAmount,
          totalAmount: data.totalAmount,
          advancePercentage: data.advancePercentage
        })
        
        setStep('payment')
        toast.success('Please complete payment to confirm your booking')
      } else {
        throw new Error('Failed to create payment intent')
      }
    } catch (error: any) {
      console.error('Error preparing booking:', error)
      toast.error(error.message || 'Failed to prepare booking')
    } finally {
      setBookingLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    setStep('success')
  }

  const handleBackStep = () => {
    switch (step) {
      case 'datetime':
        setStep('service')
        break
      case 'info':
        setStep('datetime')
        break
      case 'payment':
        setStep('info')
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!businessId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Business Available
          </h2>
          <p className="text-gray-600 mb-6">
            There is currently no business available for booking.
            Please contact us directly.
          </p>
          <Button onClick={() => router.push('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {step !== 'service' && step !== 'success' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackStep}
                className="hover:bg-blue-50 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {step === 'service' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.push('/')}
                className="hover:bg-blue-50 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {step === 'service' && 'Select Service'}
                {step === 'datetime' && 'Choose Date & Time'}
                {step === 'info' && 'Your Information'}
                {step === 'payment' && 'Payment'}
                {step === 'success' && 'Booking Confirmed'}
              </h1>
              {/* Progress indicator */}
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  step === 'service' ? 'bg-blue-500' : 
                  ['datetime', 'info', 'payment', 'success'].includes(step) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  step === 'datetime' ? 'bg-blue-500' : 
                  ['info', 'payment', 'success'].includes(step) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  step === 'info' ? 'bg-blue-500' : 
                  ['payment', 'success'].includes(step) ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  step === 'payment' ? 'bg-blue-500' : 
                  step === 'success' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  step === 'success' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {step === 'service' && (
            <div className="animate-fade-in">
              <ServiceSelector
                businessId={businessId}
                onServiceSelect={handleServiceSelect}
              />
            </div>
          )}

          {step === 'datetime' && selectedService && (
            <div className="space-y-8 animate-fade-in">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Selected Service</h3>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{selectedService.name}</p>
                      <p className="text-gray-600 mt-1">{selectedService.description}</p>
                      <p className="text-sm text-gray-500 mt-2">Duration: {selectedService.duration} minutes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">${selectedService.price}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-8 lg:grid-cols-2">
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <CalendarView
                      businessId={businessId}
                      serviceId={selectedService.id}
                      onDateSelect={handleDateSelect}
                      selectedDate={selectedDate}
                    />
                  </CardContent>
                </Card>

                {selectedDate && (
                  <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm animate-slide-in-right">
                    <CardContent className="p-6">
                      <TimeSlotPicker
                        businessId={businessId}
                        serviceId={selectedService.id}
                        date={selectedDate}
                        onTimeSelect={handleTimeSelect}
                        selectedTime={selectedTime}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {step === 'info' && selectedService && selectedDate && selectedTime && (
            <div className="space-y-8 animate-fade-in">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-6 text-gray-800">Booking Summary</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <div className="grid gap-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-semibold text-gray-800">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold text-gray-800">{formatDate(selectedDate)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-semibold text-gray-800">{formatTime(selectedTime)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold text-gray-800">{selectedService.duration} minutes</span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4 mt-2">
                        <span className="text-lg font-semibold text-gray-800">Total:</span>
                        <span className="text-2xl font-bold text-blue-600">${selectedService.price}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-8">
                  <BookingForm
                    onSubmit={handleBookingSubmit}
                    loading={bookingLoading}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'payment' && bookingId && paymentData && (
            <div className="animate-fade-in">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-8">
                  <PaymentSection
                    bookingId={bookingId}
                    amount={paymentData.advanceAmount}
                    totalAmount={paymentData.totalAmount}
                    advancePercentage={paymentData.advancePercentage}
                    clientSecret={paymentData.clientSecret}
                    onSuccess={handlePaymentSuccess}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-16 animate-bounce-in">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 max-w-2xl mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-20 animate-pulse" />
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6 relative z-10" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Booking Confirmed!
                </h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Your booking has been successfully created. You will receive a confirmation
                  message shortly with all the details.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => router.push('/')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Return to Home
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStep('service')
                      setSelectedService(null)
                      setSelectedDate(null)
                      setSelectedTime(null)
                      setBookingId(null)
                    }}
                    className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Book Another Service
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}