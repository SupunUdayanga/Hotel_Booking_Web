import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api, fileUrl } from '../lib/api'
import { useAuth } from '../lib/auth'
import BookingForm from '../components/BookingForm'

const HotelDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [hotel, setHotel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [userRating, setUserRating] = useState(0)
  const [canRate, setCanRate] = useState(false)
  const [mainIdx, setMainIdx] = useState(0)
  const [imgError, setImgError] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const formRef = React.useRef(null)

  useEffect(() => {
    let mounted = true
    api.getHotel(id).then((res) => {
      if (!mounted) return
  setHotel(res?.data?.hotel || null)
  setUserRating(res?.data?.userRating || 0)
  setCanRate(!!res?.data?.canRate)
      setRooms(res?.data?.rooms || [])
    }).catch((e) => setMessage(e.message))
    return () => { mounted = false }
  }, [id])

  const book = async ({ roomId, checkIn, checkOut }) => {
    setMessage('')
    const finalRoomId = roomId || selectedRoom
    if (!finalRoomId || !checkIn || !checkOut) {
      setMessage('Please select a room and dates')
      return
    }
    setLoading(true)
    try {
      const res = await api.createBooking({ roomId: finalRoomId, checkIn, checkOut })
      const b = res?.data?.booking
      setMessage(b ? 'Booking confirmed!' : 'Booked')
    } catch (e) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!hotel) return <p className="text-gray-600 dark:text-gray-300">Loading hotel...</p>

  return (
    <section className="mx-auto max-w-6xl">
      {/* Title + meta header */}
      <div className="mb-4">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{hotel.name}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
          {hotel.city && <span className="text-gray-600 dark:text-gray-300">{hotel.city}</span>}
          <span className="text-gray-700 dark:text-gray-300">
            Average rating: <span className="font-medium text-gray-900 dark:text-gray-100">{(hotel.rating ?? 0).toFixed(1)}</span> / 5.0
          </span>
        </div>
      </div>

      {/* Gallery - full width */}
      <div>
        {Array.isArray(hotel.images) && hotel.images.length > 0 ? (
          <div className="mx-auto max-w-5xl">
            <div className="relative h-64 w-full overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 sm:h-80 md:h-96">
              {!imgError ? (
                <img
                  src={fileUrl(hotel.images[Math.min(mainIdx, hotel.images.length - 1)])}
                  alt={hotel.name}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">No image</div>
              )}
              {hotel.images.length > 1 && (
                <>
                  <div className="absolute inset-y-0 left-0 flex items-center p-2">
                    <button
                      type="button"
                      aria-label="Previous image"
                      className="rounded-full bg-white/80 px-2 py-1 shadow hover:bg-white dark:bg-gray-900/60 dark:hover:bg-gray-900/80"
                      onClick={() => setMainIdx((i) => (i > 0 ? i - 1 : hotel.images.length - 1))}
                    >
                      ‹
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center p-2">
                    <button
                      type="button"
                      aria-label="Next image"
                      className="rounded-full bg-white/80 px-2 py-1 shadow hover:bg-white dark:bg-gray-900/60 dark:hover:bg-gray-900/80"
                      onClick={() => setMainIdx((i) => (i + 1) % hotel.images.length)}
                    >
                      ›
                    </button>
                  </div>
                </>
              )}
            </div>
            {hotel.images.length > 1 && (
              <div className="mt-2 flex items-center justify-center gap-2 overflow-x-auto">
                {hotel.images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`h-14 w-20 overflow-hidden rounded border border-gray-200 dark:border-gray-700 ${i === mainIdx ? 'ring-2 ring-indigo-500' : ''}`}
                    onClick={() => { setMainIdx(i); setImgError(false); }}
                    title={`Image ${i + 1}`}
                  >
                    <img src={fileUrl(src)} alt={`thumb ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-64 w-full items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">No image</div>
        )}
      </div>

      {/* Details */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">About</h3>
          {hotel.address && <p className="mt-2 text-gray-700 dark:text-gray-300">{hotel.address}</p>}
          {hotel.description && <p className="mt-2 text-gray-800 dark:text-gray-200">{hotel.description}</p>}
        </div>
        <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Amenities</h3>
          {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1 text-xs text-gray-600 dark:text-gray-300">
              {hotel.amenities.map((a, i) => (
                <li key={i} className="rounded border border-gray-200 px-2 py-0.5 dark:border-gray-700">{a}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">No amenities listed.</p>
          )}
        </div>
      </div>

      {/* Booking strip moved to bottom */}
      <div ref={formRef} className="mt-6 rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">Book your stay</h4>
        {user ? (
          <BookingForm rooms={rooms} selectedRoomId={selectedRoom} onSubmit={book} submitting={loading} />
        ) : (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Login to book a room.</p>
        )}
        {message && (
          <p className={`mt-3 text-sm ${message.includes('confirmed') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{message}</p>
        )}
      </div>
    </section>
  )
}

export default HotelDetails
