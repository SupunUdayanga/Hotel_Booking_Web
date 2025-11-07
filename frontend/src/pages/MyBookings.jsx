import React, { useEffect, useState } from 'react'
import { api, fileUrl } from '../lib/api'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userRatings, setUserRatings] = useState({}) // bookingId -> number
  const [ratingBusy, setRatingBusy] = useState({}) // bookingId -> boolean
  const [editingRatings, setEditingRatings] = useState({}) // bookingId -> number (selected but not submitted)
  const [ratingNotes, setRatingNotes] = useState({}) // bookingId -> message (inline)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .myBookings()
      .then((res) => {
        if (!mounted) return
        setBookings(res?.data?.bookings || [])
      })
      .catch((e) => setError(e.message || 'Failed to load bookings'))
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [])

  // After bookings load, prefetch user ratings for eligible hotels
  useEffect(() => {
    const fetchRatings = async () => {
      const now = new Date()
      const eligible = bookings.filter((b) => b.status === 'completed' || (['approved','confirmed'].includes(b.status) && new Date(b.checkOut) <= now))
      if (eligible.length === 0) return
      try {
        const results = await Promise.allSettled(eligible.map((b) => api.getHotel(b.room.hotel._id)))
        const map = {}
        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') {
            const hotel = r.value?.data?.hotel
            const bookingId = eligible[idx]._id
            const found = hotel?.ratings?.find?.((rt) => rt.booking === bookingId || rt.booking?._id === bookingId)
            map[bookingId] = found ? (found.value || 0) : 0
          }
        })
        setUserRatings((prev) => ({ ...prev, ...map }))
      } catch {}
    }
    if (bookings && bookings.length) fetchRatings()
  }, [bookings])

  if (loading) return <p className="text-gray-600 dark:text-gray-300">Loading your bookings…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-gray-600 dark:text-gray-300">You have no bookings yet.</p>
      ) : (
        <ul className="mt-4 divide-y rounded-md border dark:divide-gray-800 dark:border-gray-800">
          {bookings.map((b) => {
            const hotelId = b.room?.hotel?._id
            const now = new Date()
            const eligible = b.status === 'completed' || (
              ['approved','confirmed'].includes(b.status) && new Date(b.checkOut) <= now
            )
            const current = userRatings[b._id] || 0
            const selected = editingRatings[b._id] ?? current
            return (
              <li key={b._id} className="p-4 flex items-start justify-between gap-4">
                {/* Thumbnail */}
                <div className="hidden sm:block flex-shrink-0 overflow-hidden rounded-md border w-24 h-24 bg-gray-100 dark:bg-gray-800 dark:border-gray-700">
                  <img
                    src={fileUrl(b.room?.hotel?.images?.[0]) || ''}
                    alt={b.room?.hotel?.name || 'Hotel'}
                    className="h-full w-full object-cover"
                    onError={(e)=>{ e.currentTarget.style.display='none' }}
                  />
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{b.room?.hotel?.name || 'Hotel'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Room: {b.room?.name || 'Room'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(b.checkIn).toDateString()} → {new Date(b.checkOut).toDateString()}</p>
                  {eligible && hotelId && current === 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-200">Rate service:</span>
                      <div className="flex items-center text-amber-500">
                        {[1,2,3,4,5].map((v) => (
                          <button
                            key={v}
                            type="button"
                            disabled={!!ratingBusy[b._id]}
                            onClick={() => {
                              setEditingRatings((prev) => ({ ...prev, [b._id]: v }))
                            }}
                            className="text-xl leading-none disabled:opacity-50"
                            title={`Select ${v}`}
                          >
                            {v <= selected ? '★' : '☆'}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="ml-2 btn btn-primary text-xs py-1"
                        disabled={!!ratingBusy[b._id] || selected === 0 || selected === current}
                        onClick={async () => {
                          try {
                            setRatingBusy((s) => ({ ...s, [b._id]: true }))
                            await api.rateHotel(hotelId, selected, b._id)
                            setUserRatings((prev) => ({ ...prev, [b._id]: selected }))
                            toast.success('Rating submitted')
                            setRatingNotes((n) => ({ ...n, [b._id]: '' }))
                          } catch (e) {
                            const msg = e?.message || 'Failed to submit rating'
                            toast.error(msg)
                            setRatingNotes((n) => ({ ...n, [b._id]: msg }))
                            // If server says already rated, refresh user rating and switch to read-only
                            if (/already rated/i.test(msg)) {
                              try {
                                const res = await api.getHotel(hotelId)
                                const rt = res?.data?.hotel?.ratings?.find?.((rt) => rt.booking === b._id || rt.booking?._id === b._id)
                                const ur = rt ? (rt.value || 0) : 0
                                if (ur > 0) setUserRatings((prev) => ({ ...prev, [b._id]: ur }))
                              } catch {}
                            }
                          } finally {
                            setRatingBusy((s) => ({ ...s, [b._id]: false }))
                          }
                        }}
                      >
                        Submit
                      </button>
                      {(selected !== current) && (
                        // Cancel edits and revert selection
                        <button
                          type="button"
                          className="btn btn-outline text-xs py-1"
                          onClick={() => setEditingRatings((prev) => ({ ...prev, [b._id]: current }))}
                        >
                          Cancel
                        </button>
                      )}
                      {ratingNotes[hotelId] && (
                        <span className="text-xs font-semibold text-red-600">{ratingNotes[hotelId]}</span>
                      )}
                    </div>
                  )}
                  {eligible && hotelId && current > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-700 dark:text-gray-200">Your rating:</span>
                      <div className="text-amber-500">
                        {[1,2,3,4,5].map((v) => (
                          <span key={v} className="text-xl">{v <= current ? '★' : '☆'}</span>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">(one-time rating)</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${b.totalPrice}</p>
                  <p className={`text-xs ${['approved','confirmed'].includes(b.status) ? 'text-green-600' : b.status === 'cancelled' ? 'text-gray-500' : b.status === 'completed' ? 'text-blue-600' : 'text-amber-600'}`}>{b.status}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default MyBookings
