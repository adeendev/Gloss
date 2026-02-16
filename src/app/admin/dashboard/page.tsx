'use client'

import { useState, useEffect } from 'react'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { BookingCard } from '@/components/admin/BookingCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import Swal from 'sweetalert2'
import { Sparkles, LineChart as LineChartIcon } from 'lucide-react'
import { ResponsiveContainer, LineChart as RLineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    weekRevenue: 0,
    completedToday: 0,
  })
  const [bookings, setBookings] = useState<any[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [upcomingLoading, setUpcomingLoading] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    // Fetch analytics for performance summary and trend chart
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics?range=week')
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load analytics')
        setAnalytics(json)
      } catch (e) {
        console.error(e)
      }
    }
    fetchAnalytics()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all bookings first
      const allBookingsResponse = await fetch('/api/bookings')
      const allBookings = await allBookingsResponse.json()

      // Fetch today's bookings using local date
      const today = new Date()
      const localDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0')
      const todayResponse = await fetch(`/api/bookings?date=${localDate}`)
      const todayBookings = await todayResponse.json()

      setBookings(todayBookings)

      // Calculate stats from all bookings for better insights
      const todayBookingsCount = todayBookings.length
      const completedBookings = allBookings.filter((b: any) => b.status === 'COMPLETED')
      const completedToday = completedBookings.length

      // Calculate total revenue from all completed bookings
      const totalRevenue = completedBookings
        .filter((b: any) => b.advancePaid)
        .reduce((sum: number, b: any) => sum + b.advanceAmount, 0)

      setStats({
        todayBookings: todayBookingsCount,
        weekRevenue: totalRevenue,
        completedToday,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingBookings = async () => {
    try {
      setUpcomingLoading(true)
      // Fetch all bookings and filter for upcoming ones
      const response = await fetch('/api/bookings')
      const allBookings = await response.json()

      // Filter for upcoming bookings (future dates, not completed or cancelled)
      const now = new Date()
      const upcoming = allBookings.filter((booking: any) => {
        const bookingDate = new Date(booking.scheduledAt)
        return bookingDate > now && 
               booking.status !== 'COMPLETED' && 
               booking.status !== 'CANCELLED'
      })

      // Sort by scheduled date
      upcoming.sort((a: any, b: any) => 
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      )

      setUpcomingBookings(upcoming)
    } catch (error) {
      console.error('Failed to fetch upcoming bookings:', error)
      toast.error('Failed to load upcoming bookings')
    } finally {
      setUpcomingLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      toast.success('Booking status updated')
      fetchDashboardData()
      // Refresh upcoming bookings if they are loaded
      if (upcomingBookings.length > 0) {
        fetchUpcomingBookings()
      }
    } catch (error) {
      toast.error('Failed to update booking status')
    }
  }

  const handleStartService = async (id: string) => {
    const result = await Swal.fire({
      title: 'Start Service?',
      text: 'Are you sure you want to start this service?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, start service!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      await fetch(`/api/bookings/${id}/start-service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      toast.success('Service started successfully')
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to start service')
    }
  }

  const handleCompleteService = async (id: string) => {
    const result = await Swal.fire({
      title: 'Complete Service?',
      text: 'Are you sure you want to mark this service as completed?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, complete service!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      await fetch(`/api/bookings/${id}/complete-service`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      toast.success('Service completed successfully')
      fetchDashboardData()
      // Refresh upcoming bookings if they are loaded
      if (upcomingBookings.length > 0) {
        fetchUpcomingBookings()
      }
    } catch (error) {
      toast.error('Failed to complete service')
    }
  }

  const handleTabChange = (value: string) => {
    if (value === 'upcoming' && upcomingBookings.length === 0) {
      fetchUpcomingBookings()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <DashboardStats {...stats} />

      {analytics && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" /> Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm">
                Your automations saved <span className="font-semibold">{analytics.performance.hoursSaved}</span> hours this week and increased bookings by <span className="font-semibold">{analytics.performance.bookingIncreasePct}%</span>.
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-4 w-4 text-blue-600" /> Weekly Booking Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={analytics.bookingTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#007BFF" strokeWidth={2} dot={false} />
                </RLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="today" onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="today">Today's Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No bookings for today
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onStatusChange={handleStatusChange}
                  onViewDetails={(id) => console.log('View details:', id)}
                  onStartService={handleStartService}
                  onCompleteService={handleCompleteService}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading upcoming bookings...</p>
              </CardContent>
            </Card>
          ) : upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No upcoming bookings
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onStatusChange={handleStatusChange}
                  onViewDetails={(id) => console.log('View details:', id)}
                  onStartService={handleStartService}
                  onCompleteService={handleCompleteService}
                />
              ))}
            </div>
          )}
        </TabsContent>


      </Tabs>
    </div>
  )
}