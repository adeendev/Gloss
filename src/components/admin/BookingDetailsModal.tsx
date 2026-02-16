'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Car,
  MapPin,
  CreditCard,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  Star,
  Award,
  TrendingUp,
  Activity,
  Bell,
} from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'

interface BookingDetails {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  scheduledAt: string
  duration: number
  status: string
  notes?: string
  totalAmount: number
  advanceAmount: number
  advancePaid: boolean
  fullPaymentPaid: boolean
  paymentMethod?: string
  completedAt?: string
  cancelledAt?: string
  createdAt: string
  service: {
    id: string
    name: string
    description: string
    price: number
    duration: number
  }
  business: {
    id: string
    name: string
    email: string
    phone: string
    address?: string
  }
  payments: Array<{
    id: string
    amount: number
    method: string
    status: string
    createdAt: string
    stripePaymentIntentId?: string
  }>
  notifications: Array<{
    id: string
    type: string
    status: string
    content: string
    sentAt?: string
    createdAt: string
  }>
  timeline?: Array<{
    status: string
    description: string
    timestamp: string
  }>
}

interface BookingDetailsModalProps {
  bookingId: string | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
}

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-blue-900 text-blue-100',
  IN_PROGRESS: 'bg-blue-900 text-blue-100',
  COMPLETED: 'bg-blue-900 text-blue-100',
  CANCELLED: 'bg-blue-900 text-blue-100',
}

const paymentStatusColors: Record<string, string> = {
  COMPLETED: 'bg-blue-900 text-blue-100',
  FAILED: 'bg-blue-900 text-blue-100',
  REFUNDED: 'bg-blue-900 text-blue-100',
}

export function BookingDetailsModal({
  bookingId,
  isOpen,
  onClose,
  onStatusChange,
}: BookingDetailsModalProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (bookingId && isOpen) {
      fetchBookingDetails()
    }
  }, [bookingId, isOpen])

  const fetchBookingDetails = async () => {
    if (!bookingId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/bookings/${bookingId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch booking details')
      }
      const data = await response.json()
      setBooking(data)
    } catch (error) {
      console.error('Error fetching booking details:', error)
      toast.error('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    if (!booking) return
    
    try {
      await onStatusChange(booking.id, status)
      // Refresh booking details after status change
      await fetchBookingDetails()
      toast.success('Booking status updated successfully')
    } catch (error) {
      toast.error('Failed to update booking status')
    }
  }

  const calculateRemainingAmount = () => {
    if (!booking) return 0
    return booking.totalAmount - booking.advanceAmount
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading booking details...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!booking) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-12">
            <p className="text-gray-500">No booking details available</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        {/* Header */}
        <div className="bg-blue-900 text-white p-6 -m-6 mb-6 rounded-t-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-full">
              <Car className="h-8 w-8 text-blue-900" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              Booking Details - {booking.customerName}
            </h2>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="bg-white border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-900 text-white p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-900" />
                </div>
                <h3 className="text-lg font-semibold">Customer Information</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-blue-900" />
                <span className="text-gray-700">{booking.customerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-900" />
                <span className="text-gray-700">{booking.customerPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-900" />
                <span className="text-gray-700">{booking.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-white border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-900 text-white p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Car className="h-5 w-5 text-blue-900" />
                </div>
                <h3 className="text-lg font-semibold">Service Details</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h4 className="font-medium text-blue-900">{booking.service.name}</h4>
                <p className="text-sm text-gray-600">{booking.service.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-900" />
                <span className="text-gray-700">{booking.service.duration} minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-blue-900" />
                <span className="text-gray-700">{formatCurrency(booking.service.price)}</span>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-white border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-900 text-white p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-blue-900" />
                </div>
                <h3 className="text-lg font-semibold">Appointment Details</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-blue-900" />
                <span className="text-gray-700">{formatDate(booking.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-900" />
                <span className="text-gray-700">{formatTime(booking.scheduledAt)}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-blue-900" />
                <span className="text-gray-700">{booking.business.address || 'Address not provided'}</span>
              </div>
              {booking.notes && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-blue-900">Notes:</p>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white border border-blue-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-blue-900 text-white p-4 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <CreditCard className="h-5 w-5 text-blue-900" />
                </div>
                <h3 className="text-lg font-semibold">Payment Details</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                 <span className="text-gray-600">Total Amount:</span>
                 <span className="font-semibold text-blue-900">{formatCurrency(booking.totalAmount)}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Advance Payment:</span>
                 <span className="text-green-600">{formatCurrency(booking.advanceAmount)} {booking.advancePaid ? '✓' : '○'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Remaining Amount:</span>
                 <span className="text-red-600">{formatCurrency(calculateRemainingAmount())} {booking.fullPaymentPaid ? '✓' : '○'}</span>
               </div>
              <div className="flex items-center gap-3 pt-2 border-t">
                <CreditCard className="h-4 w-4 text-blue-900" />
                <span className="text-gray-700">Payment Method: {booking.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
         {booking.payments && booking.payments.length > 0 && (
           <div className="mt-6 bg-white border border-blue-200 rounded-lg shadow-sm">
             <div className="bg-blue-900 text-white p-4 rounded-t-lg">
               <h3 className="text-lg font-semibold">Payment History</h3>
             </div>
             <div className="p-4">
               <div className="space-y-3">
                 {booking.payments.map((payment) => (
                   <div key={payment.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                     <div className="flex items-center gap-3">
                       <div className="bg-blue-900 p-2 rounded-full">
                         <CreditCard className="h-4 w-4 text-white" />
                       </div>
                       <div>
                         <p className="font-medium text-blue-900">{formatCurrency(payment.amount)}</p>
                         <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
                       </div>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusColors[payment.status as keyof typeof paymentStatusColors]}`}>
                       {payment.status}
                     </span>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         )}

        {/* Notifications */}
        {booking.notifications && booking.notifications.length > 0 && (
          <div className="mt-6 bg-white border border-blue-200 rounded-lg shadow-sm">
            <div className="bg-blue-900 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">Notifications</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {booking.notifications.map((notification, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="bg-blue-900 p-2 rounded-full mt-1">
                      <Bell className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-900 font-medium">{notification.type}</p>
                      <p className="text-gray-600 text-sm">{notification.content}</p>
                      <p className="text-gray-500 text-xs mt-1">{notification.sentAt ? new Date(notification.sentAt).toLocaleString() : 'Not sent'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Booking Timeline */}
        {booking.timeline && booking.timeline.length > 0 && (
          <div className="mt-6 bg-white border border-blue-200 rounded-lg shadow-sm">
            <div className="bg-blue-900 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-semibold">Booking Timeline</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {booking.timeline.map((event: { status: string; description: string; timestamp: string }, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-blue-900 p-2 rounded-full">
                        {event.status === 'confirmed' && <CheckCircle className="h-4 w-4 text-white" />}
                        {event.status === 'in-progress' && <Clock className="h-4 w-4 text-white" />}
                        {event.status === 'completed' && <CheckCircle className="h-4 w-4 text-white" />}
                        {event.status === 'cancelled' && <XCircle className="h-4 w-4 text-white" />}
                      </div>
                      {index < (booking.timeline?.length || 0) - 1 && (
                        <div className="w-0.5 h-8 bg-blue-900 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium text-blue-900">{event.status.charAt(0).toUpperCase() + event.status.slice(1)}</p>
                      <p className="text-gray-600 text-sm">{event.description}</p>
                      <p className="text-gray-500 text-xs mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
         <div className="flex gap-3 mt-6 pt-6 border-t">
           <Button
             onClick={() => handleStatusChange('CONFIRMED')}
             className="flex-1 bg-blue-900 hover:bg-blue-800 text-white"
             disabled={booking.status === 'CONFIRMED'}
           >
             <CheckCircle className="h-4 w-4 mr-2" />
             Confirm Booking
           </Button>
           <Button
             onClick={() => handleStatusChange('CANCELLED')}
             variant="outline"
             className="flex-1 border-blue-900 text-blue-900 hover:bg-blue-50"
             disabled={booking.status === 'CANCELLED'}
           >
             <XCircle className="h-4 w-4 mr-2" />
             Cancel Booking
           </Button>
         </div>
      </DialogContent>
    </Dialog>
  )
}