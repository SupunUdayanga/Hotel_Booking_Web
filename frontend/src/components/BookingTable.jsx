import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const nextActions = (status) => {
  switch (status) {
    case 'pending': return ['approved', 'cancelled']
    case 'approved': return ['completed', 'cancelled']
    case 'confirmed': return ['completed', 'cancelled'] // backward compatibility
    default: return []
  }
}

export default function BookingTable() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.adminListBookings()
      .then((res) => setBookings(res?.data?.bookings || []))
      .catch((e) => setError(e.message || 'Failed to load bookings'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    try { await api.adminUpdateBooking(id, status); toast.success(`Marked as ${status}`); load() } catch (e) { toast.error(e.message) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this booking?')) return
    try { await api.adminDeleteBooking(id); toast.success('Deleted'); load() } catch (e) { toast.error(e.message) }
  }

  if (loading) return <p className="text-gray-600">Loading bookings…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bookings</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm dark:border-gray-700">
          <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Hotel / Room</th>
              <th className="px-3 py-2 text-left">Dates</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {bookings.map((b) => (
              <tr key={b._id}>
                <td className="px-3 py-2">{b.user?.name} <span className="text-gray-500">({b.user?.email})</span></td>
                <td className="px-3 py-2">{b.room?.hotel?.name || '-'} / {b.room?.name || '-'}</td>
                <td className="px-3 py-2">{new Date(b.checkIn).toLocaleDateString()} → {new Date(b.checkOut).toLocaleDateString()}</td>
                <td className="px-3 py-2">${b.totalPrice}</td>
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-1 text-xs ${b.status === 'approved' || b.status === 'confirmed' ? 'bg-green-50 text-green-700' : b.status === 'cancelled' ? 'bg-gray-50 text-gray-700' : b.status === 'completed' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{b.status}</span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex gap-2">
                    {nextActions(b.status).map((s) => (
                      <button key={s} onClick={() => updateStatus(b._id, s)} className="rounded-md px-2 py-1 text-indigo-700 hover:bg-indigo-50 capitalize">{s}</button>
                    ))}
                    <button onClick={() => remove(b._id)} className="rounded-md px-2 py-1 text-red-700 hover:bg-red-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
