import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [hotels, setHotels] = useState([])
  const [rooms, setRooms] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.listHotels().then((res) => setHotels(res?.data?.hotels || []))
      .catch((e) => setMessage(e.message))
    api.listRooms().then((res) => setRooms(res?.data?.rooms || []))
      .catch((e) => setMessage(e.message))
  }, [])

  if (user?.role !== 'admin') return null

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900">Admin Dashboard</h2>
      {message && <p className="mt-2 text-red-600">{message}</p>}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="font-medium text-gray-900">Hotels</h3>
          <ul className="mt-2 border rounded-md divide-y">
            {hotels.map(h => (
              <li key={h._id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{h.name}</p>
                    <p className="text-sm text-gray-600">{h.city}</p>
                  </div>
                </div>
              </li>
            ))}
            {hotels.length === 0 && <p className="p-3 text-gray-600">No hotels yet.</p>}
          </ul>
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Rooms</h3>
          <ul className="mt-2 border rounded-md divide-y">
            {rooms.map(r => (
              <li key={r._id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-sm text-gray-600">${r.pricePerNight}/night</p>
                  </div>
                </div>
              </li>
            ))}
            {rooms.length === 0 && <p className="p-3 text-gray-600">No rooms yet.</p>}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default AdminDashboard
