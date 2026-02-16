"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Bell, CalendarRange, User, X } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'

export type DateRange = 'today' | 'week' | 'month' | 'custom'

interface TopbarProps {
  onDateRangeChange?: (range: DateRange) => void
}

export function Topbar({ onDateRangeChange }: TopbarProps) {
  const { data: session } = useSession()
  const [range, setRange] = useState<DateRange>('week')
  const [unread, setUnread] = useState<number>(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeNotification, setActiveNotification] = useState<any | null>(null)

  useEffect(() => {
    onDateRangeChange?.(range)
  }, [range, onDateRangeChange])

  useEffect(() => {
    const businessId = session?.user?.businessId
    if (!businessId) return

    const es = new EventSource(`/api/admin/notifications/stream?businessId=${businessId}`)

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'notification' && data.payload) {
          setNotifications((prev) => [data.payload, ...prev].slice(0, 50))
          setActiveNotification(data.payload)
          setUnread((prev) => prev + 1)
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      es.close()
    }

    return () => es.close()
  }, [session?.user?.businessId])

  const renderNotificationText = (n: any) => {
    const when = n?.scheduledAt ? `${formatDate(n.scheduledAt)} ${formatTime(n.scheduledAt)}` : ''
    switch (n?.event) {
      case 'booking_created':
        return `New booking: ${n.customerName} · ${n.serviceName}${when ? ` · ${when}` : ''}`
      case 'service_started':
        return `Service started: ${n.customerName} · ${n.serviceName}`
      case 'service_completed':
        return `Service completed: ${n.customerName} · ${n.serviceName}`
      default:
        return n?.title || 'New notification'
    }
  }

  return (
    <div className="sticky top-0 z-40 mb-6">
      {activeNotification && (
        <div className="mb-2 rounded-lg bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow">
          <div className="text-sm font-medium">
            {renderNotificationText(activeNotification)}
          </div>
          <button
            className="ml-4 inline-flex items-center justify-center rounded bg-blue-700/40 hover:bg-blue-700/60 p-1"
            aria-label="Dismiss"
            onClick={() => setActiveNotification(null)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <Card className="glass-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarRange className="h-5 w-5 text-blue-600" />
          <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold">
                    {unread}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">No notifications</div>
              ) : (
                notifications.slice(0, 10).map((n, idx) => (
                  <DropdownMenuItem key={idx} className="block whitespace-normal">
                    {renderNotificationText(n)}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setUnread(0)}>Mark all as read</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2 pl-2">
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{session?.user?.name || 'User'}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}