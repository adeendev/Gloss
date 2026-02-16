'use client'

import { useEffect, useMemo, useState } from 'react'
import { useDateRange } from '@/components/admin/admin/date-range-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, PieChart as PieIcon, BarChart3, LineChart } from 'lucide-react'
import { toast } from 'sonner'
import {
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  PieChart as RPieChart,
  Pie,
  Cell,
} from 'recharts'

interface AnalyticsResponse {
  range: string
  totals: { totalBookings: number; completed: number; pending: number; inProgress: number; cancelled: number }
  revenue: { generated: number; distribution: { method: string; amount: number }[] }
  performance: { avgResponseMinutes: number | null; retentionRate: number; hoursSaved: number; bookingIncreasePct: number }
  whatsapp: { notificationsSent: number; messagesOutbound: number }
  topAutomationFlows: { type: string; count: number }[]
  bookingTrends: { date: string; count: number }[]
}

export default function AnalyticsPage() {
  const { range } = useDateRange()
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/admin/analytics?range=${range}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load analytics')
        setData(json)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [range])

  const statusData = useMemo(() => (
    data ? [
      { name: 'Completed', value: data.totals.completed },
      { name: 'Pending', value: data.totals.pending },
      { name: 'In Progress', value: data.totals.inProgress },
      { name: 'Cancelled', value: data.totals.cancelled },
    ] : []
  ), [data])

  const distributionColors = ['#007BFF', '#00C49F', '#FFBB28', '#FF8042']

  return (
    <div className="space-y-6">
      {/* Header removed per request */}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <LineChart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.totals.totalBookings ?? '-'}</div>
                <p className="text-xs text-gray-500">Range: {data?.range}</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
                <BarChart3 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${data?.revenue.generated.toFixed(2) ?? '-'}</div>
                <p className="text-xs text-gray-500">Paid transactions only</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Response (min)</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.performance.avgResponseMinutes ?? '-'}</div>
                <p className="text-xs text-gray-500">From booking to first message</p>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <PieIcon className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.performance.retentionRate ?? '-'}%</div>
                <p className="text-xs text-gray-500">Repeat customers</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Booking Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              {data && (
                <ResponsiveContainer width="100%" height="100%">
                  <RLineChart data={data.bookingTrends} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#007BFF" strokeWidth={2} dot={false} />
                  </RLineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#007BFF" />
                </RBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={data?.revenue.distribution || []} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={100} label>
                    {(data?.revenue.distribution || []).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={distributionColors[idx % distributionColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automations" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>WhatsApp Notifications Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.whatsapp.notificationsSent ?? '-'}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Outbound Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.whatsapp.messagesOutbound ?? '-'}</div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Top Automation Flows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(data?.topAutomationFlows || []).map((f) => (
                    <div key={f.type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{f.type}</span>
                      <span className="text-sm font-semibold">{f.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-gray-100 h-32" />
          ))}
        </div>
      )}
    </div>
  )
}