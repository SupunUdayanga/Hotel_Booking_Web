import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

export default function ReportChart() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    api.reportsSummary()
      .then((res) => setData(res?.data?.summary || null))
      .catch((e) => setError(e.message || 'Failed to load reports'))
  }, [])

  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return <p className="text-gray-600 dark:text-gray-300">Loading reports…</p>

  const maxBookingsHotel = Math.max(1, ...((data.topHotelsByBookings||[]).map((h) => h.bookings)))
  const maxRevenueHotel = Math.max(1, ...((data.topHotelsByRevenue||[]).map((h) => h.revenue)))
  const maxMonthlyBookings = Math.max(1, ...((data.monthly||[]).map((m) => m.bookings)))
  const maxMonthlyRevenue = Math.max(1, ...((data.monthly||[]).map((m) => m.revenue)))

  const status = { pending: 0, approved: 0, confirmed: 0, completed: 0, cancelled: 0, ...(data.statusCounts || {}) }
  const statusItems = [
    { key: 'pending', label: 'Pending', color: 'bg-amber-500' },
    { key: 'approved', label: 'Approved', color: 'bg-green-500' },
    { key: 'confirmed', label: 'Confirmed', color: 'bg-emerald-500' },
    { key: 'completed', label: 'Completed', color: 'bg-blue-500' },
    { key: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' },
  ]

  return (
    <div className="grid gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Hotels" value={data.hotelCount} />
        <Stat label="Rooms" value={data.roomCount} />
        <Stat label="Bookings" value={data.bookingCount} />
        <Stat label="Revenue" value={`$${data.revenue}`} />
      </div>

      {/* Status distribution */}
      <Card title="Bookings by status">
        <div className="grid gap-2">
          {statusItems.map((s) => (
            <BarRow key={s.key} label={s.label} value={status[s.key] || 0} max={Math.max(1, ...statusItems.map((t) => status[t.key] || 0))} colorClass={s.color} />
          ))}
        </div>
      </Card>

      {/* Monthly charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Bookings (last 6 months)">
          <BarColumns labels={(data.monthly||[]).map((m) => m.label)} values={(data.monthly||[]).map((m) => m.bookings)} max={maxMonthlyBookings} colorClass="bg-indigo-500" />
        </Card>
        <Card title="Revenue (last 6 months)">
          <BarColumns labels={(data.monthly||[]).map((m) => m.label)} values={(data.monthly||[]).map((m) => m.revenue)} max={maxMonthlyRevenue} colorClass="bg-purple-500" valuePrefix="$" />
        </Card>
      </div>

      {/* Top hotels */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Top hotels by bookings">
          <div className="grid gap-2">
            {(data.topHotelsByBookings||[]).map((h) => (
              <BarRow key={h.hotelId} label={h.name} value={h.bookings} max={maxBookingsHotel} colorClass="bg-indigo-600" />
            ))}
            {(data.topHotelsByBookings||[]).length === 0 && <p className="text-gray-600">No data yet.</p>}
          </div>
        </Card>
        <Card title="Top hotels by revenue">
          <div className="grid gap-2">
            {(data.topHotelsByRevenue||[]).map((h) => (
              <BarRow key={h.hotelId} label={h.name} value={h.revenue} max={maxRevenueHotel} colorClass="bg-blue-600" prefix="$" />
            ))}
            {(data.topHotelsByRevenue||[]).length === 0 && <p className="text-gray-600">No data yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border p-4 dark:bg-gray-900 dark:border-gray-800">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{value}</div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-lg border p-4 dark:bg-gray-900 dark:border-gray-800">
      <h4 className="text-base font-semibold text-gray-900 mb-3 dark:text-white">{title}</h4>
      {children}
    </div>
  )
}

function BarRow({ label, value, max, colorClass, prefix = '' }) {
  const width = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0
  return (
    <div className="grid grid-cols-[1fr_1fr_64px] items-center gap-3">
      <div className="truncate text-sm text-gray-800 dark:text-gray-200" title={label}>{label}</div>
      <div className="h-3 bg-gray-100 rounded dark:bg-gray-800">
        <div className={`h-3 ${colorClass} rounded`} style={{ width: `${width}%` }} />
      </div>
      <div className="text-right text-sm text-gray-700 dark:text-gray-300">{prefix}{value}</div>
    </div>
  )
}

function BarColumns({ labels = [], values = [], max = 1, colorClass = 'bg-indigo-600', valuePrefix = '' }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-end gap-2 h-40">
        {values.map((v, i) => {
          const h = max > 0 ? Math.max(4, Math.round((v / max) * 100)) : 0
          return (
            <div key={i} className="flex flex-col items-center justify-end gap-1 w-8 h-full">
              <div className={`w-full ${colorClass} rounded`} style={{ height: `${h}%` }} title={`${labels[i]}: ${valuePrefix}${v}`} />
              <div className="text-[10px] text-gray-600 dark:text-gray-400">{labels[i]}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
