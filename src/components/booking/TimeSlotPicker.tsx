// ============================================
// FILE: src/components/booking/TimeSlotPicker.tsx
// ============================================

'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Loader2, X, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'

interface SlotWithStatus {
  time: string
  available: boolean
  reason: 'available' | 'booked' | 'past'
}

interface TimeSlotPickerProps {
  businessId: string
  serviceId: string
  date: Date
  onSelect?: (time: string) => void
  onTimeSelect?: (time: string) => void
  selected?: string
  selectedTime?: string | null
}

export function TimeSlotPicker({
  businessId,
  serviceId,
  date,
  onSelect,
  onTimeSelect,
  selected,
  selectedTime,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<string[]>([])
  const [slotsWithStatus, setSlotsWithStatus] = useState<SlotWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const eventSourceRef = useRef<EventSource | null>(null)

  // Function to fetch available slots
  const fetchSlots = async () => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const response = await fetch(
        `/api/bookings/available-slots?businessId=${businessId}&serviceId=${serviceId}&date=${dateStr}`
      )
      const data = await response.json()
      
      if (response.ok) {
        setSlots(data.slots || [])
        setSlotsWithStatus(data.slotsWithStatus || [])
        setLastUpdated(data.lastUpdated || new Date().toISOString())
      } else {
        console.error('Failed to load slots:', data.error)
      }
    } catch (error) {
      console.error('Failed to load slots:', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to setup real-time connection
  const setupRealTimeConnection = () => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const eventSource = new EventSource(
      `/api/bookings/availability-stream?businessId=${businessId}&date=${dateStr}`
    )

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'connected':
            setIsConnected(true)
            break
          case 'availability_update':
            // Refresh slots when availability changes
            fetchSlots()
            break
          case 'heartbeat':
            // Keep connection alive
            break
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = () => {
      setIsConnected(false)
      eventSource.close()
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current === eventSource) {
          setupRealTimeConnection()
        }
      }, 5000)
    }

    eventSourceRef.current = eventSource
  }

  useEffect(() => {
    setLoading(true)
    
    // Initial fetch
    fetchSlots()
    
    // Setup real-time connection
    setupRealTimeConnection()
    
    // Cleanup on unmount or dependency change
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      setIsConnected(false)
    }
  }, [businessId, serviceId, date])

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="text-center py-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto relative z-10" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Loading Available Times</h3>
          <p className="text-gray-600">Finding the best time slots for you...</p>
        </div>
      </div>
    )
  }

  const getSlotStatusText = (reason: string) => {
    switch (reason) {
      case 'available':
        return 'Available'
      case 'booked':
        return 'Booked'
      case 'past':
        return 'Past'
      default:
        return 'Unavailable'
    }
  }

  const getSlotStatusColor = (reason: string) => {
    switch (reason) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'booked':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'past':
        return 'bg-gray-100 text-gray-500 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  if (slotsWithStatus.length === 0 && !loading) {
    return (
      <div className="animate-fade-in">
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Time Slots Available</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            No time slots found for this date. Please select another date to see available times.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2">
                <Clock className="h-5 w-5 text-white" />
              </div>
              Time Slots
            </h3>
            <p className="text-gray-600">Choose your preferred time slot</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Real-time connection status */}
            <div className="flex items-center gap-1 text-sm">
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400">Offline</span>
                </>
              )}
            </div>
            
            {/* Manual refresh button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchSlots}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
            Available
          </Badge>
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <div className="w-2 h-2 bg-red-600 rounded-full mr-1"></div>
            Booked
          </Badge>
          <Badge className="bg-gray-100 text-gray-500 border-gray-200">
            <div className="w-2 h-2 bg-gray-500 rounded-full mr-1"></div>
            Past
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {slotsWithStatus.map((slot, index) => (
          <div key={slot.time} className="relative">
            <Button
              variant={(selected === slot.time || selectedTime === slot.time) ? 'default' : 'outline'}
              onClick={() => {
                if (slot.available) {
                  onSelect?.(slot.time)
                  onTimeSelect?.(slot.time)
                }
              }}
              disabled={!slot.available}
              className={`
                w-full relative overflow-hidden transition-all duration-300 transform
                ${slot.available ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : 'cursor-not-allowed opacity-60'}
                ${(selected === slot.time || selectedTime === slot.time) && slot.available
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-lg' 
                  : slot.available
                    ? 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    : 'bg-gray-50 border-gray-200 text-gray-400'
                }
                animate-fade-in
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className="relative z-10 font-medium">{slot.time}</span>
                {!slot.available && (
                  <Badge 
                    className={`text-xs px-1 py-0 ${getSlotStatusColor(slot.reason)}`}
                  >
                    {getSlotStatusText(slot.reason)}
                  </Badge>
                )}
              </div>
              
              {(selected === slot.time || selectedTime === slot.time) && slot.available && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90" />
              )}
              
              {!slot.available && (
                <div className="absolute top-1 right-1">
                  <X className="h-3 w-3 text-gray-400" />
                </div>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* Last updated timestamp */}
      {lastUpdated && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  )
}
