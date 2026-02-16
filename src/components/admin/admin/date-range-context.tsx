"use client"

import { createContext, useContext } from 'react'

export type DateRange = 'today' | 'week' | 'month' | 'custom'

interface DateRangeContextValue {
  range: DateRange
}

const DateRangeContext = createContext<DateRangeContextValue>({ range: 'week' })

export const DateRangeProvider = DateRangeContext.Provider
export function useDateRange() {
  return useContext(DateRangeContext)
}