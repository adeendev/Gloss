'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, DollarSign, Clock, CheckCircle, ArrowUpRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatsProps {
  todayBookings: number
  weekRevenue: number
  completedToday: number
}

export function DashboardStats({
  todayBookings,
  weekRevenue,
  completedToday,
}: StatsProps) {
  const stats = [
    {
      title: "Today's Bookings",
      value: todayBookings,
      description: "Booked for today",
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: "+12%",
      trendColor: 'text-blue-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(weekRevenue),
      description: "Earned this week",
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: "+8.4%",
      trendColor: 'text-emerald-600'
    },
    {
      title: 'Total Completed',
      value: completedToday,
      description: "Services finished",
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: "+5%",
      trendColor: 'text-purple-600'
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="glass-card border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group ring-1 ring-slate-200/50">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 pointer-events-none">
              <Icon className="h-24 w-24 rotate-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {stat.title}
              </CardTitle>
              <div className={`p-3.5 rounded-2xl ${stat.bgColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm ring-1 ring-slate-100`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                  <p className="text-xs font-semibold text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                    {stat.description}
                  </p>
                </div>
                <div className={`text-[10px] font-black px-2.5 py-1.5 rounded-xl ${stat.bgColor} ${stat.trendColor} ring-1 ring-current/10 shadow-sm flex items-center gap-1`}>
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
