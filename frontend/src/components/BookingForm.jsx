import React, { useEffect, useState } from 'react'

const BookingForm = ({ rooms = [], onSubmit, submitting, disabled, selectedRoomId }) => {
  const [roomId, setRoomId] = useState(selectedRoomId || '')
  useEffect(() => {
    setRoomId(selectedRoomId || '')
  }, [selectedRoomId])
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (onSubmit) onSubmit({ roomId, checkIn, checkOut })
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-4 sm:items-end">
      <label className="block">
        <span className="block text-sm text-gray-700 dark:text-gray-200">Room</span>
        <select value={roomId} onChange={(e)=>setRoomId(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
          <option value="">Select a room</option>
          {rooms.map((r) => (
            <option key={r._id} value={r._id}>{r.name} — ${r.pricePerNight}/night</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="block text-sm text-gray-700 dark:text-gray-200">Check-in</span>
        <input type="date" value={checkIn} onChange={(e)=>setCheckIn(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
      </label>
      <label className="block">
        <span className="block text-sm text-gray-700 dark:text-gray-200">Check-out</span>
        <input type="date" value={checkOut} onChange={(e)=>setCheckOut(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
      </label>
      <button disabled={disabled || submitting} type="submit" className="btn btn-primary w-full sm:w-auto">
        {submitting ? 'Booking…' : 'Book now'}
      </button>
    </form>
  )
}

export default BookingForm
