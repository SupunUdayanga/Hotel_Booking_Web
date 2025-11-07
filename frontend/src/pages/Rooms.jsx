import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'

const Rooms = () => {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .listRooms()
      .then((data) => {
        if (!mounted) return
        setRooms(Array.isArray(data?.data) ? data.data : data)
      })
      .catch((err) => setError(err.message || 'Failed to load rooms'))
      .finally(() => setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return <div className="text-gray-600">Loading rooms…</div>
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (!rooms.length) {
    return <div className="text-gray-600">No rooms available.</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Rooms</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div key={room._id || room.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            {room.images?.length ? (
              <img src={room.images[0]} alt={room.name} className="h-40 w-full object-cover" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-gray-100 text-gray-400">No image</div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-medium text-gray-900">{room.name || room.title || 'Room'}</h2>
                {room.price && (
                  <div className="text-right text-indigo-600 font-semibold">${room.price}/night</div>
                )}
              </div>
              {room.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{room.description}</p>
              )}
              {room.hotel && (
                <p className="mt-2 text-xs text-gray-500">Hotel: {room.hotel?.name || room.hotel}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <Link
                  to={room.hotel ? `/hotels/${room.hotel?._id || room.hotel}` : '/hotels'}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  View hotel
                </Link>
                <button
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
                  onClick={() => alert('Booking flow not implemented in this page.')}
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Rooms
