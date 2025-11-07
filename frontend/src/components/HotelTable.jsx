import React, { useEffect, useRef, useState } from 'react'
import { api, fileUrl } from '../lib/api'
import toast from 'react-hot-toast'

export default function HotelTable() {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', city: '', address: '', description: '', amenities: '' })
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)

  const load = () => {
    setLoading(true)
    api.listHotels()
      .then((res) => setHotels(res?.data?.hotels || []))
      .catch((e) => setError(e.message || 'Failed to load hotels'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm({ name: '', city: '', address: '', description: '', amenities: '' }); setFiles([]); setModalOpen(true) }
  const openEdit = (h) => { setEditing(h); setForm({ name: h.name || '', city: h.city || '', address: h.address || '', description: h.description || '', amenities: (h.amenities || []).join(', ') }); setFiles([]); setModalOpen(true) }

  const save = async () => {
    try {
      if (!form.name) return toast.error('Name is required')
      // Build FormData when files are present
      // Prepare body: for FormData we send amenities as comma-separated string
      let body = form
      if (files && files.length > 0) {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''))
        Array.from(files).forEach((f) => fd.append('images', f))
        body = fd
      } else {
        // When sending JSON, convert amenities to array for cleaner payload
        const amenities = (form.amenities || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        body = { ...form, amenities }
      }
      if (editing) {
        await api.updateHotel(editing._id, body)
        toast.success('Hotel updated')
      } else {
        await api.createHotel(body)
        toast.success('Hotel added')
      }
      setModalOpen(false)
      load()
    } catch (e) { toast.error(e.message) }
  }

  const remove = async (id) => {
    if (!confirm('Delete this hotel?')) return
    try { await api.deleteHotel(id); toast.success('Hotel deleted'); load() } catch (e) { toast.error(e.message) }
  }

  if (loading) return <p className="text-gray-600">Loading hotels…</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hotels</h3>
        <button onClick={openAdd} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500">Add Hotel</button>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm dark:border-gray-700">
          <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
            <tr>
              <th className="px-3 py-2 text-left">Image</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">City</th>
              
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {hotels.map((h) => (
              <tr key={h._id}>
                <td className="px-3 py-2">
                  {h.images?.length ? (
                    <img
                      src={fileUrl(h.images[0])}
                      alt="preview"
                      className="h-12 w-16 rounded border bg-gray-100 object-contain dark:border-gray-700 dark:bg-gray-800"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2">{h.name}</td>
                <td className="px-3 py-2">{h.city || '-'}</td>
                
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex gap-2">
                    <button onClick={() => openEdit(h)} className="rounded-md px-2 py-1 text-indigo-700 hover:bg-indigo-50">Edit</button>
                    <button onClick={() => remove(h._id)} className="rounded-md px-2 py-1 text-red-700 hover:bg-red-50">Delete</button>
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
          <div className="relative w-full max-w-2xl rounded-lg border p-5 shadow bg-white dark:bg-gray-900 dark:border-gray-800">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white">{editing ? 'Edit Hotel' : 'Add Hotel'}</h4>
            <div className="mt-3 grid gap-4">
              {/* Basic info & location arranged for compact view */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="grid gap-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Grand Plaza" className="w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
                <div className="grid gap-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Metropolis" className="w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                </div>
              </div>
              <div className="grid gap-1">
                <label className="text-sm text-gray-700 dark:text-gray-300">Address (optional)</label>
                <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" className="w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
              </div>
              {/* Description */}
              <div className="grid gap-1">
                <label className="text-sm text-gray-700 dark:text-gray-300">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Central hotel with modern amenities" className="w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
              </div>
              {/* Amenities */}
              <div className="grid gap-1">
                <label className="text-sm text-gray-700 dark:text-gray-300">Amenities</label>
                <input value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} placeholder="wifi, pool, gym" className="w-full rounded-md border px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Enter as a comma‑separated list. Example: wifi, pool, gym</p>
              </div>
              {/* Images */}
              <div>
                <label className="text-sm text-gray-700 dark:text-gray-300">Images</label>
                <div className="mt-1 flex items-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-md border px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Add images</button>
                  {files && files.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">{files.length} new file(s)</span>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} className="hidden" />
                {files && files.length > 0 && (
                  <div className="mt-2 grid grid-cols-6 gap-2">
                    {Array.from(files).map((f, i) => (
                      <div key={i} className="aspect-video overflow-hidden rounded border bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        <img src={URL.createObjectURL(f)} alt={f.name} className="h-full w-full object-contain" />
                      </div>
                    ))}
                  </div>
                )}
                {editing?.images?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Existing images:</p>
                    <div className="mt-1 grid grid-cols-6 gap-2">
                      {editing.images.map((src, i) => (
                        <div key={i} className="relative aspect-video overflow-hidden rounded border bg-gray-100 group dark:border-gray-700 dark:bg-gray-800">
                          <img src={fileUrl(src)} alt={`image ${i + 1}`} className="h-full w-full object-contain" />
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await api.removeHotelImage(editing._id, src)
                                toast.success('Image removed')
                                setEditing({ ...editing, images: editing.images.filter((p) => p !== src) })
                              } catch (e) {
                                toast.error(e.message)
                              }
                            }}
                            className="absolute right-1 top-1 hidden rounded bg-white/90 px-1 text-xs text-red-600 shadow group-hover:block"
                            title="Remove"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">New uploads will be added; existing images are kept unless removed.</p>
                  </div>
                )}
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
