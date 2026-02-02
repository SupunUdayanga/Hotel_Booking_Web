import React from 'react'
import { Link } from 'react-router-dom'

const IconBed = ({ size = 18, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 7v10" />
    <path d="M21 17V9a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3" />
    <path d="M3 13h18" />
  </svg>
)

const Footer = () => {
  return (
    <footer className="border-t border-gray-200/70 bg-white/80 dark:bg-gray-900/80 dark:border-gray-800">
      {/* Mobile: centered minimal footer */}
  <div className="md:hidden mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center">
        <Link to="/" className="flex items-center justify-center gap-2 font-semibold text-gray-900 dark:text-white">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white">
            <IconBed />
          </span>
          <span className="text-lg">Hotel Booking</span>
        </Link>
        <nav className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
          <Link to="/">Home</Link>
          <Link to="/hotels">HotelsHotels</Link>
          <Link to="/contact">Contact</Link>
          <a href="tel:+10000000000">+1 (000) 000-0000</a>
        </nav>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Hotel Booking. All rights reserved.</p>
      </div>

      {/* Desktop: compact 3-column links; bottom bar copyright */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Links grid */}
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><Link to="/" className="hover:text-gray-900 dark:hover:text-white">Home</Link></li>
              <li><Link to="/hotels" className="hover:text-gray-900 dark:hover:text-white">Hotels</Link></li>
              <li><Link to="/contact" className="hover:text-gray-900 dark:hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Support</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><a href="tel:+10000000000" className="hover:text-gray-900 dark:hover:text-white">+1 (000) 000-0000</a></li>
              <li><a href="mailto:support@example.com" className="hover:text-gray-900 dark:hover:text-white">support@example.com</a></li>
              <li><Link to="/my-bookings" className="hover:text-gray-900 dark:hover:text-white">My bookings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white">Terms</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400">
          <p className="text-center">© {new Date().getFullYear()} Hotel Booking. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
