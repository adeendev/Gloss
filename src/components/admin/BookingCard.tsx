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

import { MoreHorizontal, Phone, Mail, Clock, DollarSign, Play, CheckCircle, Sparkles } from 'lucide-react'
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
    <Card className="group glass-card border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden ring-1 ring-slate-200/50">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row min-h-[220px]">
          {/* Left accent bar */}
          <div className={`w-2.5 ${
            booking.status === 'IN_PROGRESS' 
              ? 'bg-gradient-to-b from-blue-500 to-blue-600' 
              : booking.status === 'COMPLETED' 
                ? 'bg-gradient-to-b from-emerald-500 to-emerald-600' 
                : booking.status === 'CONFIRMED'
                  ? 'bg-gradient-to-b from-indigo-500 to-indigo-600'
                  : 'bg-slate-200'
          } group-hover:w-3 transition-all duration-500`} />
          
          <div className="flex-1 p-7">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">
                    {booking.customerName}
                  </h3>
                  <Badge variant="outline" className={`${statusColors[booking.status] || 'bg-slate-100 text-slate-800'} border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ring-1 ring-black/5`}>
                    {booking.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-5 text-slate-400 text-sm font-medium">
                  <div className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer">
                    <div className="p-1 bg-slate-100 rounded-md">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    {booking.customerPhone}
                  </div>
                  {booking.customerEmail && (
                    <div className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer">
                      <div className="p-1 bg-slate-100 rounded-md">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      {booking.customerEmail}
                    </div>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-11 w-11 p-0 rounded-2xl hover:bg-slate-100 transition-all active:scale-90 border border-transparent hover:border-slate-200">
                    <MoreHorizontal className="h-6 w-6 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-slate-100 shadow-2xl p-2">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-400">Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onViewDetails(booking.id)} className="rounded-xl px-3 py-2.5 font-bold focus:bg-blue-50 focus:text-blue-600 cursor-pointer">
                    View Full Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2 bg-slate-100" />
                  <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'CONFIRMED')} className="rounded-xl px-3 py-2.5 font-bold focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer">
                    Mark as Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(booking.id, 'CANCELLED')} className="text-red-600 rounded-xl px-3 py-2.5 font-bold focus:bg-red-50 focus:text-red-600 cursor-pointer">
                    Cancel Appointment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:shadow-md transition-all duration-500">
                <div className="p-2.5 bg-blue-50 rounded-xl shadow-sm ring-1 ring-blue-100 group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] mb-0.5">Time</p>
                  <p className="text-[15px] font-black text-slate-700">{formatTime(booking.scheduledAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:shadow-md transition-all duration-500">
                <div className="p-2.5 bg-purple-50 rounded-xl shadow-sm ring-1 ring-purple-100 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] mb-0.5">Service</p>
                  <p className="text-[15px] font-black text-slate-700 truncate max-w-[140px]">{booking.service.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 group-hover:bg-white group-hover:shadow-md transition-all duration-500">
                <div className="p-2.5 bg-emerald-50 rounded-xl shadow-sm ring-1 ring-emerald-100 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] mb-0.5">Amount</p>
                  <p className="text-[15px] font-black text-slate-700">{formatCurrency(booking.totalAmount)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-7 border-t border-slate-100">
              <div className="flex items-center gap-3">
                {booking.advancePaid ? (
                  <Badge className="bg-emerald-100/50 text-emerald-700 border-none px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ring-1 ring-emerald-100 shadow-sm">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Deposit Paid
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100/50 text-amber-700 border-none px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider ring-1 ring-amber-100 shadow-sm">
                    Payment Pending
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3">
                {booking.status === 'CONFIRMED' && onStartService && (
                  <Button 
                    size="sm" 
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black shadow-xl shadow-slate-200 px-6 h-10 transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => onStartService(booking.id)}
                  >
                    <Play className="h-4 w-4 fill-current" /> Start
                  </Button>
                )}
                {booking.status === 'IN_PROGRESS' && onCompleteService && (
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-xl shadow-emerald-200 px-6 h-10 transition-all active:scale-95 flex items-center gap-2"
                    onClick={() => onCompleteService(booking.id)}
                  >
                    <CheckCircle className="h-4 w-4" /> Finish
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl font-black border-slate-200 hover:bg-slate-50 px-6 h-10 transition-all active:scale-95 text-slate-600 uppercase tracking-widest text-[10px]"
                  onClick={() => onViewDetails(booking.id)}
                >
                  Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}