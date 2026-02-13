import React from 'react'
import { NavLink } from 'react-router-dom'

const linkBase = 'block rounded-md px-3 py-2 text-sm font-medium'

export default function AdminSidebar() {
  const links = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/hotels', label: 'Hotels' },
    { to: '/admin/rooms', label: 'Rooms' },
    { to: '/admin/bookings', label: 'Bookings' },
  ]

  return (
    <aside className="hidden md:block md:w-64 shrink-0 border-r bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-500 mb-2 dark:text-gray-400">dmin</p>
        <nav className="grid gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `${linkBase} ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
