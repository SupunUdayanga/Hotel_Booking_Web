import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import HotelCard from '../components/HotelCard'

const HotelsList = () => {
  const [params, setParams] = useSearchParams()
  const [hotels, setHotels] = useState([])
  const [q, setQ] = useState(params.get('q') || '')
  const [city, setCity] = useState(params.get('city') || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sort, setSort] = useState(params.get('sort') || 'relevance') // relevance | name | rating_desc | rating_asc
  const [minRating, setMinRating] = useState(Number(params.get('minRating') || 0))
  const [page, setPage] = useState(Number(params.get('page') || 1))
  const [perPage] = useState(9)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.listHotels({ q, city })
      setHotels(res?.data?.hotels || [])
      setParams((p) => {
        const next = new URLSearchParams(p)
        if (q) next.set('q', q); else next.delete('q')
        if (city) next.set('city', city); else next.delete('city')
        if (sort && sort !== 'relevance') next.set('sort', sort); else next.delete('sort')
        if (minRating) next.set('minRating', String(minRating)); else next.delete('minRating')
        if (page && page !== 1) next.set('page', String(page)); else next.delete('page')
        return next
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Derived client-side filters/sort/pagination
  const filtered = useMemo(() => {
    let list = Array.isArray(hotels) ? hotels.slice() : []
    if (minRating > 0) list = list.filter(h => typeof h.rating === 'number' && h.rating >= minRating)
    switch (sort) {
      case 'name':
        list.sort((a,b) => (a.name||'').localeCompare(b.name||''))
        break
      case 'rating_desc':
        list.sort((a,b) => (b.rating||0) - (a.rating||0))
        break
      case 'rating_asc':
        list.sort((a,b) => (a.rating||0) - (b.rating||0))
        break
      default:
        // relevance (keep API order)
        break
    }
    return list
  }, [hotels, minRating, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, currentPage, perPage])

  const applyAndSearch = () => {
    setPage(1)
    load()
  }

  const clearFilters = () => {
    setQ(''); setCity(''); setMinRating(0); setSort('relevance'); setPage(1)
    // Trigger fresh load
    setTimeout(() => load(), 0)
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hotels</h2>
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search name" className="border px-3 py-2 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400" />
        <input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="City" className="border px-3 py-2 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 placeholder-gray-400" />
        <select value={sort} onChange={(e)=>{ setSort(e.target.value); setPage(1) }} className="border px-3 py-2 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <option value="relevance">Sort: Relevance</option>
          <option value="name">Sort: Name (A→Z)</option>
          <option value="rating_desc">Sort: Rating (High→Low)</option>
          <option value="rating_asc">Sort: Rating (Low→High)</option>
        </select>
        <label className="ml-1 text-sm text-gray-700 dark:text-gray-300">Min rating</label>
        <input type="number" min={0} max={5} step={0.5} value={minRating} onChange={(e)=>{ setMinRating(Number(e.target.value) || 0); setPage(1) }} className="w-24 border px-3 py-2 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
        <button onClick={applyAndSearch} className="btn btn-primary">Search</button>
        <button onClick={clearFilters} className="btn btn-outline">Clear</button>
      </div>
      {loading && <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map(h => (
          <HotelCard key={h._id} hotel={h} />
        ))}
        {!loading && filtered.length === 0 && <p className="text-gray-600 dark:text-gray-300">No hotels found.</p>}
      </div>
      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button className="btn btn-outline" disabled={currentPage<=1} onClick={()=> setPage((p)=> Math.max(1, p-1))}>Prev</button>
          <span className="text-sm text-gray-700 dark:text-gray-300">Page {currentPage} / {totalPages}</span>
          <button className="btn btn-outline" disabled={currentPage>=totalPages} onClick={()=> setPage((p)=> Math.min(totalPages, p+1))}>Next</button>
        </div>
      )}
    </section>
  )
}

export default HotelsList
