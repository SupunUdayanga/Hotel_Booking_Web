import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

export default function RoomTable() {
  const [rooms, setRooms] = useState([])
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterHotel, setFilterHotel] = useState('')
  const [form, setForm] = useState({ hotel: '', name: '', capacity: 2, pricePerNight: 0 })

  const load = () => {
    setLoading(true)
    Promise.all([api.listRooms(filterHotel ? { hotel: filterHotel } : undefined), api.listHotels()])
      .then(([r1, r2]) => {
        setRooms(r1?.data?.rooms || [])
        setHotels(r2?.data?.hotels || [])
      })
      .catch((e) => setError(e.message || 'Failed to load rooms'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterHotel])

  const openAdd = () => { setEditing(null); setForm({ hotel: filterHotel || (hotels[0]?._id || ''), name: '', capacity: 2, pricePerNight: 0 }); setModalOpen(true) }
  const openEdit = (r) => { setEditing(r); setForm({ hotel: r.hotel, name: r.name, capacity: r.capacity || 2, pricePerNight: r.pricePerNight || 0 }); setModalOpen(true) }

  const save = async () => {
    try {
      if (!form.hotel || !form.name) return toast.error('Hotel and name are required')
      if (editing) {
        await api.updateRoom(editing._id, form)
        toast.success('Room updated')
      } else {
        await api.createRoom(form)
        toast.success('Room added')
      }
      setModalOpen(false)
      load()
    } catch (e) { toast.error(e.message) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this room?')) return
    try { await api.deleteRoom(id); toast.success('Room deleted'); load() } catch (e) { toast.error(e.message) }
  }

  if (loading) return <p className="text-gray-600">Loading rooms…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rooms</h3>
          <select value={filterHotel} onChange={(e) => setFilterHotel(e.target.value)} className="rounded-md border px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
            <option value="">All hotels</option>
            {hotels.map((h) => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>
        <button onClick={openAdd} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">Add Room</button>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm dark:border-gray-700">
          <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-3 py-2 text-left">Room</th>
              <th className="px-3 py-2 text-left">Hotel</th>
              <th className="px-3 py-2 text-left">Capacity</th>
              <th className="px-3 py-2 text-left">Price</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rooms.map((r) => (
              <tr key={r._id}>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{hotels.find((h) => h._id === (r.hotel?._id || r.hotel))?.name || '-'}</td>
                <td className="px-3 py-2">{r.capacity}</td>
                <td className="px-3 py-2">${r.pricePerNight}</td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={() => openEdit(r)} className="rounded-md px-2 py-1 text-indigo-700 hover:bg-indigo-50">Edit</button>
                    <button onClick={() => remove(r._id)} className="rounded-md px-2 py-1 text-red-700 hover:bg-red-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-lg border p-5 shadow bg-white dark:bg-gray-900 dark:border-gray-800">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Room' : 'Add Room'}</h4>
            <div className="mt-3 grid gap-3">
              <select
                value={form.hotel}
                onChange={(e) => setForm({ ...form, hotel: e.target.value })}
                className="w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              >
                <option value="">Select hotel</option>
                {hotels.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
              </select>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Room name"
                className="w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  placeholder="Capacity"
                  className="w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                  type="number"
                  value={form.pricePerNight}
                  onChange={(e) => setForm({ ...form, pricePerNight: Number(e.target.value) })}
                  placeholder="Price per night"
                  className="w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">Cancel</button>
              <button onClick={save} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
