import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

const UserDashboard = () => {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingCount, setBookingCount] = useState(null)

  useEffect(() => {
    let mounted = true
    api
      .listHotels()
      .then((res) => { if (mounted) setHotels(res?.data?.hotels || []) })
      .catch((e) => setError(e.message || 'Failed to load'))
      .finally(() => setLoading(false))

    // Also fetch the user's bookings count (ignore errors silently)
    api
      .myBookings()
      .then((res) => { if (mounted) setBookingCount((res?.data?.bookings || []).length) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  return (
    <section className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl border p-5 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Dashboard</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Browse hotels, make bookings, and view your history.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/hotels" className="btn btn-primary">Find Hotels</Link>
            <Link to="/my-bookings" className="btn btn-outline">My Bookings</Link>
          </div>
        </div>
      </div>

      {/* Quick stats & links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">Bookings</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{bookingCount ?? '—'}</p>
          <Link className="mt-2 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400" to="/my-bookings">View my bookings</Link>
        </div>
        <div className="rounded-lg border p-4 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">Explore</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">Hotels</p>
          <Link className="mt-2 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400" to="/hotels">Browse hotels</Link>
        </div>
        <div className="rounded-lg border p-4 dark:bg-gray-900 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-300">Need help?</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">Support</p>
          <Link className="mt-2 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400" to="/contact">Contact us</Link>
        </div>
      </div>

      {/* Suggested hotels */}
      <div className="rounded-xl border p-5 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-white">Suggested Hotels</h3>
          <Link to="/hotels" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">View all</Link>
        </div>
        {loading ? (
          <p className="mt-3 text-gray-600 dark:text-gray-300">Loading…</p>
        ) : error ? (
          <p className="mt-3 text-red-600">{error}</p>
        ) : hotels.length === 0 ? (
          <p className="mt-3 text-gray-600 dark:text-gray-300">No hotels available right now.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {hotels.slice(0, 4).map((h) => (
              <li key={h._id} className="rounded-md border p-3 dark:bg-gray-900/40 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{h.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{h.city}</p>
                  </div>
                  <Link to={`/hotels/${h._id}`} className="text-indigo-600 text-sm font-medium hover:underline dark:text-indigo-400">View</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default UserDashboard
