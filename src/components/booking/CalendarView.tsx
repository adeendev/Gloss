// ============================================
// FILE: src/components/booking/CalendarView.tsx
// ============================================

'use client'

import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { addDays, startOfToday } from 'date-fns'
import { CalendarDays } from 'lucide-react'

interface CalendarViewProps {
  businessId?: string
  serviceId?: string
  onSelect?: (date: Date) => void
  onDateSelect?: (date: Date) => void
  selected?: Date
  selectedDate?: Date | null
  maxDays?: number
}

export function CalendarView({ businessId, serviceId, onSelect, onDateSelect, selected, selectedDate, maxDays = 30 }: CalendarViewProps) {
  const today = startOfToday()
  const maxDate = addDays(today, maxDays)

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-2">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          Select Date
        </h3>
        <p className="text-gray-600">Choose your preferred appointment date</p>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
        <Calendar
          mode="single"
          selected={selected || selectedDate || undefined}
          onSelect={(date) => {
            if (date) {
              onSelect?.(date)
              onDateSelect?.(date)
            }
          }}
          disabled={(date) => date < today || date > maxDate}
          className="rounded-lg mx-auto"
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-lg font-semibold text-gray-800",
            nav: "space-x-1 flex items-center",
            nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-blue-100 rounded-md transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-gray-500 rounded-md w-9 font-normal text-sm",
            row: "flex w-full mt-2",
            cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-blue-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-50 rounded-md transition-colors",
            day_selected: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white",
            day_today: "bg-blue-100 text-blue-900 font-semibold",
            day_outside: "text-gray-400 opacity-50",
            day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
            day_range_middle: "aria-selected:bg-blue-100 aria-selected:text-blue-900",
            day_hidden: "invisible",
          }}
        />
      </div>
    </div>
  )
}
