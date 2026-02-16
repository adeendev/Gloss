"use client"

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/admin/admin/Sidebar'
import { Topbar } from '@/components/admin/admin/Topbar'
import { DateRangeProvider } from '@/components/admin/admin/date-range-context'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'custom'>('week')

  useEffect(() => {
    // Skip authentication check for login page
    if (pathname === '/admin/login') {
      return
    }

    // If session is loading, wait
    if (status === 'loading') {
      return
    }

    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/admin/login')
      return
    }

    // If authenticated but not admin role, redirect to login with error
    if (session?.user && 
        session.user.role !== 'ADMIN' && 
        session.user.role !== 'BUSINESS_OWNER') {
      router.push('/admin/login?error=access-denied')
      return
    }
  }, [session, status, router, pathname])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render admin layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Don't render if not authenticated or not authorized
  if (status === 'unauthenticated' || 
      !session?.user || 
      (session.user.role !== 'ADMIN' && session.user.role !== 'BUSINESS_OWNER')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 overflow-y-auto bg-gray-50 p-8 min-h-screen">
        <Topbar onDateRangeChange={setRange} />
        <DateRangeProvider value={{ range }}>
          {children}
        </DateRangeProvider>
      </main>
    </div>
  )
}