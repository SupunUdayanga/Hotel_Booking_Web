import React from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import AdminSidebar from '../../components/AdminSidebar'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-[calc(100vh-4rem)] grid md:grid-cols-[16rem_1fr]">
      <AdminSidebar />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Admin</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-700 dark:text-gray-300">{user?.name}</span>
            <button onClick={logout} className="rounded-md border px-3 py-1.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Logout</button>
          </div>
        </div>
        <div className="mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
