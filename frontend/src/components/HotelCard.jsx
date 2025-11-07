import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { fileUrl } from '../lib/api'

const HotelCard = ({ hotel }) => {
  const [imgError, setImgError] = useState(false)
  return (
    <div className="border rounded-md overflow-hidden bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
      {hotel.images?.length && !imgError ? (
        <img src={fileUrl(hotel.images[0])} alt={hotel.name} className="h-40 w-full object-cover" onError={() => setImgError(true)} />
      ) : (
        <div className="h-40 w-full bg-gray-100 flex items-center justify-center text-gray-400 dark:bg-gray-800 dark:text-gray-500">No image</div>
      )}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 dark:text-white">{hotel.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{hotel.city}</p>
        {hotel.address && (
          <p className="text-xs text-gray-500 mt-0.5 truncate dark:text-gray-400" title={hotel.address}>{hotel.address}</p>
        )}
        {typeof hotel.rating === 'number' && hotel.rating > 0 && (
          <p className="mt-1 text-xs text-amber-600">Rating: {hotel.rating.toFixed(1)} / 5.0</p>
        )}
        <Link to={`/hotels/${hotel._id}`} className="inline-block mt-3 text-indigo-600 hover:underline dark:text-indigo-400">View details</Link>
      </div>
    </div>
  )
}

export default HotelCard
