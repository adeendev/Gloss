import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export async function createPaymentIntent(
  amount: number,
  bookingId: string,
  customerEmail?: string
) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: process.env.NEXT_PUBLIC_CURRENCY?.toLowerCase() || 'usd',
    metadata: { bookingId },
    receipt_email: customerEmail,
    automatic_payment_methods: { enabled: true },
  })
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

export async function createRefund(paymentIntentId: string, amount?: number) {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
  })
}