'use client'

import { useState, useEffect } from 'react'
import { BookingCard } from '@/components/admin/BookingCard'
import { BookingDetailsModal } from '@/components/admin/BookingDetailsModal'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { Search } from 'lucide-react'
import { toast } from 'sonner'
import Swal from 'sweetalert2'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('bookings')
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    filterBookings()
  }, [searchTerm, statusFilter, bookings])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = [...bookings]

    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.customerPhone.includes(searchTerm)
      )
    }

    if (statusFilter === 'bookings') {
      // Show CONFIRMED bookings for the bookings tab
    filtered = filtered.filter((b) => b.status === 'CONFIRMED')
    } else if (statusFilter !== 'all') {
      // For other tabs, filter by exact status
      filtered = filtered.filter((b) => b.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }

  const categorizeBookingsByDate = (bookings: any[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Group bookings by date
    const bookingsByDate = new Map<string, any[]>()
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.scheduledAt)
      bookingDate.setHours(0, 0, 0, 0)
      const dateKey = bookingDate.toISOString().split('T')[0]
      
      if (!bookingsByDate.has(dateKey)) {
        bookingsByDate.set(dateKey, [])
      }
      bookingsByDate.get(dateKey)!.push(booking)
    })
    
    // Sort dates and return as array of {date, bookings}
    const sortedDates = Array.from(bookingsByDate.keys()).sort()
    
    return sortedDates.map(dateKey => ({
      date: new Date(dateKey + 'T00:00:00.000Z'),
      bookings: bookingsByDate.get(dateKey)!
    }))
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update booking status')
        return
      }
      
      toast.success('Booking status updated')
      fetchBookings()
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
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to start service')
        return
      }
      
      toast.success('Service started successfully')
      fetchBookings()
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
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to complete service')
        return
      }
      
      toast.success('Service completed successfully')
      fetchBookings()
    } catch (error) {
      toast.error('Failed to complete service')
    }
  }

  const handleViewDetails = (id: string) => {
    setSelectedBookingId(id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBookingId(null)
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
      <div>
        <h1 className="text-3xl font-bold">All Bookings</h1>
        <p className="text-gray-600">Manage and view all your bookings</p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setStatusFilter('bookings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'bookings'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          📅 Bookings
        </button>
        <button
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          🔧 Ongoing Services
        </button>
        <button
          onClick={() => setStatusFilter('COMPLETED')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            statusFilter === 'COMPLETED'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          📋 Previous Services
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name or phone"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No bookings found
          </CardContent>
        </Card>
      ) : (
        (() => {
          const formatDateForHeading = (date: Date) => {
            return date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          }

          // Handle different views based on status filter
          if (statusFilter === 'bookings') {
            // filteredBookings already contains CONFIRMED bookings
            const bookingsByDate = categorizeBookingsByDate(filteredBookings)
            
            return (
              <div className="space-y-8">
                {filteredBookings.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      <p className="text-lg">📅 No bookings available</p>
                      <p className="text-sm mt-2">New bookings will appear here when customers make appointments</p>
                    </CardContent>
                  </Card>
                ) : (
                  bookingsByDate.map(({ date, bookings }) => (
                    <div key={date.toISOString()}>
                      <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                        📅 {formatDateForHeading(date)}
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <BookingCard
                              booking={booking}
                              onStatusChange={handleStatusChange}
                              onViewDetails={handleViewDetails}
                              onStartService={handleStartService}
                              onCompleteService={handleCompleteService}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          }

          if (statusFilter === 'IN_PROGRESS') {
            // Show only ongoing services
            const ongoingServices = filteredBookings.filter(booking => booking.status === 'IN_PROGRESS')
            return (
              <div className="space-y-8">
                {ongoingServices.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      <p className="text-lg">🔧 No ongoing services</p>
                      <p className="text-sm mt-2">Services will appear here when they are started</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <h2 className="text-2xl font-bold text-orange-800">
                        🔧 Ongoing Services ({ongoingServices.length})
                      </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {ongoingServices.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-lg shadow-md border-l-4 border-orange-500">
                          <BookingCard
                            booking={booking}
                            onStatusChange={handleStatusChange}
                            onViewDetails={handleViewDetails}
                            onStartService={handleStartService}
                            onCompleteService={handleCompleteService}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          }

          if (statusFilter === 'COMPLETED') {
            // Show only completed services
            const completedServices = filteredBookings.filter(booking => booking.status === 'COMPLETED')
            const bookingsByDate = categorizeBookingsByDate(completedServices)
            
            return (
              <div className="space-y-8">
                {completedServices.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      <p className="text-lg">📋 No previous services</p>
                        <p className="text-sm mt-2">Previous services will appear here</p>
                    </CardContent>
                  </Card>
                ) : (
                  bookingsByDate.map(({ date, bookings }) => (
                    <div key={date.toISOString()}>
                      <h2 className="text-2xl font-semibold mb-4 text-green-800">
                        ✅ {formatDateForHeading(date)}
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {bookings.map((booking) => (
                          <div key={booking.id} className="bg-green-50 rounded-lg border-l-4 border-green-500">
                            <BookingCard
                              booking={booking}
                              onStatusChange={handleStatusChange}
                              onViewDetails={handleViewDetails}
                              onStartService={handleStartService}
                              onCompleteService={handleCompleteService}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          }

          // Show all bookings (default view)
          const ongoingServices = filteredBookings.filter(booking => booking.status === 'IN_PROGRESS')
          const otherBookings = filteredBookings.filter(booking => booking.status !== 'IN_PROGRESS')
          const bookingsByDate = categorizeBookingsByDate(otherBookings)
          
          return (
            <div className="space-y-8">
              {/* Ongoing Services Section - Always show at top when viewing all */}
              {ongoingServices.length > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    <h2 className="text-2xl font-bold text-orange-800">
                      🔧 Ongoing Services ({ongoingServices.length})
                    </h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {ongoingServices.map((booking) => (
                      <div key={booking.id} className="bg-white rounded-lg shadow-md border-l-4 border-orange-500">
                        <BookingCard
                          booking={booking}
                          onStatusChange={handleStatusChange}
                          onViewDetails={handleViewDetails}
                          onStartService={handleStartService}
                          onCompleteService={handleCompleteService}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Bookings by Date */}
              {bookingsByDate.length === 0 && ongoingServices.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <p className="text-lg">No bookings found</p>
                    <p className="text-sm mt-2">Bookings will appear here when customers make appointments</p>
                  </CardContent>
                </Card>
              ) : (
                bookingsByDate.map(({ date, bookings }) => (
                  <div key={date.toISOString()}>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                      {formatDateForHeading(date)}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {bookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={booking}
                          onStatusChange={handleStatusChange}
                          onViewDetails={handleViewDetails}
                          onStartService={handleStartService}
                          onCompleteService={handleCompleteService}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )
        })()
      )}

      <BookingDetailsModal
        bookingId={selectedBookingId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}