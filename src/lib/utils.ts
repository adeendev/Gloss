import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short') {
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getTimeSlots(
  startTime: string,
  endTime: string,
  duration: number,
  bookedSlots: Date[] = []
): string[] {
  const slots: string[] = []
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  let currentHour = startHour
  let currentMin = startMin
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
    slots.push(timeStr)
    
    currentMin += duration
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60)
      currentMin = currentMin % 60
    }
  }
  
  return slots
}

export function isSlotAvailable(
  slot: string,
  date: Date,
  bookedSlots: Date[],
  serviceDuration: number
): boolean {
  const [hours, minutes] = slot.split(':').map(Number)
  const slotTime = new Date(date)
  slotTime.setHours(hours, minutes, 0, 0)
  
  const slotEnd = new Date(slotTime.getTime() + serviceDuration * 60000)
  
  return !bookedSlots.some((booked) => {
    const bookedTime = new Date(booked)
    return slotTime < bookedTime && slotEnd > bookedTime
  })
}

export function calculateAdvanceAmount(total: number, percentage: number = 20): number {
  return Math.round((total * percentage) / 100)
}