// ============================================
// FILE: src/components/booking/PaymentSection.tsx
// ============================================

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { CreditCard, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

interface PaymentSectionProps {
  bookingId: string
  amount: number
  totalAmount: number
  advancePercentage?: number // The actual percentage from settings
  onSuccess: () => void
  clientSecret?: string // Optional pre-created client secret
}

function StripeCheckoutForm({ bookingId, amount, onSuccess }: any) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message || 'Payment failed')
      setLoading(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation?paymentIntentId=${bookingId}&bookingId=${bookingId}`,
      },
      redirect: 'if_required'
    })

    if (confirmError) {
      setError(confirmError.message || 'Payment failed')
      setLoading(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Call our success API to handle payment completion
      try {
        const response = await fetch('/api/payments/stripe/success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            // In payment-first flow, send the payment intent ID as bookingId
            // so the success endpoint can detect this scenario
            bookingId: paymentIntent.id
          })
        })

        if (response.ok) {
          onSuccess()
        } else {
          const errorData = await response.json()
          setError(errorData.error || 'Failed to process payment')
        }
      } catch (error) {
        console.error('Payment success processing error:', error)
        setError('Failed to process payment')
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={!stripe || loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay {formatCurrency(amount)}</>
        )}
      </Button>
    </form>
  )
}

export function PaymentSection({ bookingId, amount, totalAmount, advancePercentage = 20, onSuccess, clientSecret: preCreatedClientSecret }: PaymentSectionProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(preCreatedClientSecret || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeStripePayment = async () => {
    // If we already have a client secret from the new flow, don't create another one
    if (preCreatedClientSecret) {
      setClientSecret(preCreatedClientSecret)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      } else {
        throw new Error('No client secret received')
      }
    } catch (error: any) {
      console.error('Failed to initialize payment:', error)
      setError(error.message || 'Failed to initialize payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-full p-2">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          Payment Details
        </h3>
        <p className="text-gray-600">Secure payment to confirm your booking</p>
      </div>

      <div className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200/50 shadow-sm">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Payment Summary
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Service Cost:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-white/70 rounded-lg border border-blue-200/30">
              <span className="text-lg font-semibold text-blue-700">
                {advancePercentage === 100 ? 'Full Payment:' : `Advance Payment (${advancePercentage}%):`}
              </span>
              <span className="text-2xl font-bold text-blue-700">{formatCurrency(amount)}</span>
            </div>
            {advancePercentage < 100 && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Remaining Balance:</span>
                  <span className="text-gray-600 font-medium">{formatCurrency(totalAmount - amount)}</span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                  <div className="text-sm text-amber-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    Pay remaining balance after service completion
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800">Credit Card Payment</h4>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                <div className="text-sm text-red-600 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}
            
            {!clientSecret ? (
              <Button
                onClick={initializeStripePayment}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Continue with Card
                  </>
                )}
              </Button>
            ) : (
              <div className="animate-fade-in">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCheckoutForm
                    bookingId={bookingId}
                    amount={amount}
                    onSuccess={onSuccess}
                  />
                </Elements>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}