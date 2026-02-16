'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { MoreHorizontal, Phone, Mail, Clock, DollarSign, Play, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

interface Booking {
  id: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  scheduledAt: Date | string
  service: {
    name: string
    duration: number
  }
  status: string
  totalAmount: number
  advancePaid: boolean
  fullPaymentPaid?: boolean
}

interface BookingCardProps {
  booking: Booking
  onStatusChange: (id: string, status: string) => void
  onViewDetails: (id: string) => void
  onStartService?: (id: string) => void
  onCompleteService?: (id: string) => void
}

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'default'
    case 'IN_PROGRESS':
      return 'secondary'
    case 'COMPLETED':
      return 'default'
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'secondary'
  }
}



export function BookingCard({ 
  booking, 
  onStatusChange, 
  onViewDetails, 
  onStartService, 
  onCompleteService 
}: BookingCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {booking.customerName}
            </h3>
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-3 py-1.5 rounded-full shadow-sm w-fit">
              <Clock className="h-4 w-4" />
              <span className="text-base font-semibold">
                {formatTime(booking.scheduledAt)}
              </span>
            </div>
            <div className="space-y-1 mt-3">
              <p className="text-base text-gray-700 font-medium">{booking.service.name}</p>
              <p className="text-sm text-gray-500">{formatDate(booking.scheduledAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <Badge variant={getStatusVariant(booking.status)} className="px-3 py-1 font-medium">
              {booking.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewDetails(booking.id)}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'CANCELLED')}>
                  Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{booking.customerPhone}</span>
          </div>
          {booking.customerEmail && (
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{booking.customerEmail}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>
              {formatCurrency(booking.totalAmount)}
              {booking.advancePaid && (
                <Badge variant="outline" className="ml-2">
                  Advance Paid
                </Badge>
              )}
            </span>
          </div>
        </div>

        {/* Service Action Buttons */}
        <div className="mt-4 space-y-2">
          {booking.status === 'CONFIRMED' && onStartService && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => onStartService(booking.id)}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Service
            </Button>
          )}
          
          {booking.status === 'IN_PROGRESS' && onCompleteService && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => onCompleteService(booking.id)}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Service
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}