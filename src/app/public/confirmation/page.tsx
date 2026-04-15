'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'

interface Booking {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  scheduledAt: string
  totalAmount: number
  advanceAmount: number
  service: {
    name: string
    description: string
  }
  business: {
    name: string
  }
}

function ConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bookingId = searchParams.get('bookingId')
  const paymentIntentId = searchParams.get('paymentIntentId')
  const paymentIntent = searchParams.get('payment_intent')
  const redirectStatus = searchParams.get('redirect_status')

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId && !paymentIntentId) {
        setError('No booking ID or payment intent ID provided')
        setLoading(false)
        return
      }

      try {
        let response
        if (paymentIntentId) {
          // Use payment intent ID to find booking (new payment-first flow)
          response = await fetch(`/api/bookings/by-payment-intent/${paymentIntentId}`)
        } else {
          // Use booking ID directly (legacy flow)
          response = await fetch(`/api/bookings/${bookingId}`)
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details')
        }
        
        const bookingData = await response.json()
        setBooking(bookingData)
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [bookingId, paymentIntentId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center">
          <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-600">Confirming your booking details</p>
        </Card>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
          <Button onClick={() => router.push('/')}>Return to Home</Button>
        </Card>
      </div>
    )
  }

  const isPaymentSuccessful = redirectStatus === 'succeeded'

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Booking Confirmation</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center">
            {isPaymentSuccessful ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                  Your payment was successful. You will receive a WhatsApp confirmation shortly.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-2">Payment Processing</h2>
                <p className="text-gray-600 mb-6">
                  Your booking is being processed. Please wait for confirmation.
                </p>
              </>
            )}

            <div className="space-y-2 text-left max-w-md mx-auto bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono">{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-semibold">{booking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-semibold">{booking.service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-semibold">
                  {formatDate(new Date(booking.scheduledAt))} at {formatTime(new Date(booking.scheduledAt))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold">{formatCurrency(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Advance Paid:</span>
                <span className="font-semibold text-green-600">{formatCurrency(booking.advanceAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining:</span>
                <span className="font-semibold">{formatCurrency(booking.totalAmount - booking.advanceAmount)}</span>
              </div>
              {paymentIntent && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-xs">{paymentIntent}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button onClick={() => router.push('/')} className="w-full">
                Return to Home
              </Button>
              {booking.customerPhone && (
                <p className="text-sm text-gray-500">
                  WhatsApp confirmation will be sent to {booking.customerPhone}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PublicConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center">
          <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-gray-600">Confirming your booking details</p>
        </Card>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
