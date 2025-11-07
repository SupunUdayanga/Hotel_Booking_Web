import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
// import { api } from './lib/api'
import Home from './pages/Home.jsx'
import HotelsList from './pages/HotelsList.jsx'
import HotelDetails from './pages/HotelDetails.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import NotFound from './pages/NotFound.jsx'
import Rooms from './pages/Rooms.jsx'
import Contact from './pages/Contact.jsx'
import MyBookings from './pages/MyBookings.jsx'
import { useAuth } from './lib/auth.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import HotelsPage from './pages/admin/HotelsPage.jsx'
import RoomsPage from './pages/admin/RoomsPage.jsx'
import BookingsPage from './pages/admin/BookingsPage.jsx'
import ReportsPage from './pages/admin/ReportsPage.jsx'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer.jsx'

const App = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <Toaster position="top-right" />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/hotels" element={<HotelsList />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          {/* Legacy/auth routes */}
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <Login requiredRole="user" />} />
          <Route path="/login/admin" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <Login requiredRole="admin" />} />
          <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <SignUp />} />
          {/* New role-specific auth routes from navbar modal */}
          <Route path="/login-user" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <Login requiredRole="user" />} />
          <Route path="/login-admin" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <Login requiredRole="admin" />} />
          <Route path="/register-user" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <SignUp mode="user" />} />
          <Route path="/register-admin" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <SignUp mode="admin" />} />
          <Route path="/my-bookings" element={<ProtectedRoute role="user" element={<MyBookings />} />} />
          <Route path="/admin" element={<ProtectedRoute role="admin" element={<AdminLayout />} />} >
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="hotels" element={<HotelsPage />} />
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route path="/dashboard" element={<ProtectedRoute role="user" element={<UserDashboard />} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
