import { z } from 'zod'

export const bookingSchema = z.object({
  businessId: z.string().cuid(),
  serviceId: z.string().cuid(),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
})

export const paymentIntentSchema = z.object({
  bookingId: z.string().cuid(),
  amount: z.number().positive(),
})

export const whatsappMessageSchema = z.object({
  to: z.string(),
  message: z.string().min(1),
  type: z.enum(['text', 'template']).default('text'),
  templateName: z.string().optional(),
  templateParams: z.array(z.string()).optional(),
})

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
})

export type BookingInput = z.infer<typeof bookingSchema>
export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>
export type WhatsAppMessageInput = z.infer<typeof whatsappMessageSchema>