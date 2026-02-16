'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Calendar, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface ConflictData {
  hasConflict: boolean
  message: string
  requestedSlot: {
    dateTime: string
    available: boolean
    conflictReason?: string
  }
  alternatives?: {
    sameDay: Array<{
      time: string
      dateTime: string
      displayTime: string
    }>
    nextAvailableDay: {
      date: string
      slots: Array<{
        time: string
        dateTime: string
        displayTime: string
      }>
    } | null
    sameDayNextWeek: Array<{
      time: string
      dateTime: string
      displayTime: string
    }>
  }
  conflictingBooking?: {
    id: string
    scheduledAt: string
    duration: number
    status: string
  }
}

interface BookingConflictModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  serviceId: string
  requestedDateTime: string
  onSlotSelected: (dateTime: string) => void
  onRetry: () => void
}

export function BookingConflictModal({
  isOpen,
  onClose,
  businessId,
  serviceId,
  requestedDateTime,
  onSlotSelected,
  onRetry
}: BookingConflictModalProps) {
  const [conflictData, setConflictData] = useState<ConflictData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && requestedDateTime) {
      checkConflict()
    }
  }, [isOpen, requestedDateTime, businessId, serviceId])

  const checkConflict = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bookings/conflict-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          serviceId,
          requestedDateTime
        })
      })

      if (!response.ok) {
        throw new Error('Failed to check conflict')
      }

      const data = await response.json()
      setConflictData(data)
    } catch (error) {
      console.error('Error checking conflict:', error)
      toast.error('Failed to check booking conflict')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAlternative = (dateTime: string) => {
    setSelectedAlternative(dateTime)
  }

  const handleConfirmAlternative = () => {
    if (selectedAlternative) {
      onSlotSelected(selectedAlternative)
      onClose()
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Checking availability...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!conflictData) {
    return null
  }

  const requestedSlotFormatted = formatDateTime(requestedDateTime)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Booking Conflict Detected
          </DialogTitle>
          <DialogDescription>
            The requested time slot is not available. Please select an alternative time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Requested Slot */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-800">Requested Time Slot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-red-700">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{requestedSlotFormatted.date}</span>
              </div>
              <div className="flex items-center gap-2 text-red-700 mt-1">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{requestedSlotFormatted.time}</span>
              </div>
              <Badge variant="destructive" className="mt-2">
                {conflictData.requestedSlot.conflictReason || 'Not Available'}
              </Badge>
            </CardContent>
          </Card>

          {/* Alternative Suggestions */}
          {conflictData.alternatives && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Alternative Time Slots</h3>

              {/* Same Day Alternatives */}
              {conflictData.alternatives.sameDay.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-blue-800">Same Day Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {conflictData.alternatives.sameDay.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedAlternative === slot.dateTime ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => handleSelectAlternative(slot.dateTime)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {slot.displayTime}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Next Available Day */}
              {conflictData.alternatives.nextAvailableDay && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-green-800">
                      Next Available Day - {new Date(conflictData.alternatives.nextAvailableDay.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {conflictData.alternatives.nextAvailableDay.slots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedAlternative === slot.dateTime ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => handleSelectAlternative(slot.dateTime)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {slot.displayTime}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Same Day Next Week */}
              {conflictData.alternatives.sameDayNextWeek.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-purple-800">
                      Same Day Next Week - {new Date(new Date(requestedDateTime).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {conflictData.alternatives.sameDayNextWeek.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedAlternative === slot.dateTime ? "default" : "outline"}
                          className="justify-start"
                          onClick={() => handleSelectAlternative(slot.dateTime)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {slot.displayTime}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onRetry}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Original Time Again
            </Button>
            <Button
              onClick={handleConfirmAlternative}
              disabled={!selectedAlternative}
              className="flex-1"
            >
              Book Selected Time
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}