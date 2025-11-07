import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import toast from 'react-hot-toast'

// Inline SVG icons to avoid external icon dependency
const IconBase = ({ size = 20, className = '', children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
)

const IconMenu = (props) => (
  <IconBase {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </IconBase>
)

const IconX = (props) => (
  <IconBase {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconBase>
)

const IconPhone = (props) => (
  <IconBase {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 7 7l.55-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92z" />
  </IconBase>
)

const IconCalendar = (props) => (
  <IconBase {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconBase>
)

const IconBed = (props) => (
  <IconBase {...props}>
    <path d="M3 7v10" />
    <path d="M21 17V9a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3" />
    <path d="M3 13h18" />
  </IconBase>
)

const IconUser = (props) => (
  <IconBase {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconBase>
)

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Contact', to: '/contact' },
]

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(null) // 'signin' | 'signup' | null
  const [showProfile, setShowProfile] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [theme, setTheme] = useState('light') // 'light' | 'dark'
  const [themeMenu, setThemeMenu] = useState(false)

  const close = () => setOpen(false)
  const closeAll = () => { setOpen(false); setModal(null); setShowProfile(false) }

  // Close popovers on escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeAll() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Theme initialization and persistence (light/dark only)
  useEffect(() => {
    const apply = (t) => {
      const isDark = t === 'dark'
      const root = document.documentElement
      root.classList.toggle('dark', isDark)
      root.setAttribute('data-theme', isDark ? 'dark' : 'light')
      root.style.colorScheme = isDark ? 'dark' : 'light'
    }
    const stored = localStorage.getItem('theme')
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    // If previous value was "system", map to current OS and persist as light/dark
    const init = stored === 'system' ? (mq ? 'dark' : 'light') : (stored || 'light')
    setTheme(init)
    localStorage.setItem('theme', init)
    apply(init)
  }, [])

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('theme', next)
    const isDark = next === 'dark'
    const root = document.documentElement
    root.classList.toggle('dark', isDark)
    root.setAttribute('data-theme', isDark ? 'dark' : 'light')
    root.style.colorScheme = isDark ? 'dark' : 'light'
    toast.dismiss('theme')
    toast.success(`Theme set to ${next}`, { id: 'theme' })
  }

  const IconSun = (props) => (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </IconBase>
  )
  const IconMoon = (props) => (
    <IconBase {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </IconBase>
  )

  
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm dark:bg-gray-900/80 dark:border-gray-800 supports-[backdrop-filter]:dark:bg-gray-900/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white" onClick={close}>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white">
              <IconBed size={18} />
            </span>
            <span className="text-lg">Hotel Booking</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href="tel:+10000000000"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <IconPhone size={16} />
              <span className="hidden lg:inline">+1 (000) 000-0000</span>
            </a>
            {/* Theme toggle */}
            <div className="relative hidden sm:inline-flex">
              <button
                type="button"
                onClick={() => setThemeMenu((v) => !v)}
                onContextMenu={(e) => { e.preventDefault(); setThemeMenu((v) => !v) }}
                title={`Theme: ${theme}`}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {/* Show sun in dark mode, moon otherwise */}
                <span className="dark:hidden"><IconMoon size={18} /></span>
                <span className="hidden dark:inline"><IconSun size={18} /></span>
              </button>
              {themeMenu && (
                <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-800">
                  {['light','dark'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setTheme(t); localStorage.setItem('theme', t); setThemeMenu(false); const isDark = t === 'dark'; const root = document.documentElement; if (isDark) { root.classList.add('dark') } else { root.classList.remove('dark') } root.setAttribute('data-theme', isDark ? 'dark' : 'light'); root.style.colorScheme = isDark ? 'dark' : 'light'; toast.success(`Theme set to ${t}`, { id: 'theme' }) }}
                      className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${theme===t ? 'font-semibold' : ''}`}
                    >
                      {t.charAt(0).toUpperCase()+t.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Auth-aware actions (desktop) */}
            {!user ? (
              <div className="hidden md:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModal('signin')}
                  className="btn btn-outline"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 relative">
                <button
                  type="button"
                  onClick={() => setShowProfile((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  aria-haspopup="menu"
                  aria-expanded={showProfile}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
                    <IconUser size={16} />
                  </span>
                  <span className="hidden lg:inline">{user?.name || 'Account'}</span>
                </button>
                {showProfile && (
                  <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg transition-all dark:bg-gray-900 dark:border-gray-800">
                    <div className="p-2">
                      {user.role === 'admin' ? (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setShowProfile(false)}
                          className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Admin Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/dashboard"
                            onClick={() => setShowProfile(false)}
                            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            My Dashboard
                          </Link>
                          <Link
                            to="/my-bookings"
                            onClick={() => setShowProfile(false)}
                            className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            My Bookings
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => { setShowProfile(false); logout(); navigate('/'); }}
                        className="mt-1 w-full rounded-md bg-gray-100 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Keep Book now CTA */}
            <Link
              to="/hotels"
              className="hidden md:inline-flex btn btn-primary"
            >
              <IconCalendar size={16} />
              Book now
            </Link>
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconX size={22} /> : <IconMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-200/60 bg-white/95 backdrop-blur dark:bg-gray-900/95 dark:border-gray-800">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={close}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {item.label}
              </Link>
            ))}
            {/* Auth-aware actions (mobile) */}
            {!user ? (
              <div className="mt-2 grid gap-2">
                <button
                  type="button"
                  onClick={() => { setModal('signin'); close() }}
                  className="btn btn-outline"
                >
                  Sign In
                </button>
              </div>
            ) : (
              <div className="mt-2 grid gap-2">
                {user.role === 'admin' ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={close}
                    className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Admin
                  </Link>
                ) : (
                  <Link
                    to="/my-bookings"
                    onClick={close}
                    className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    My bookings
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => { close(); logout(); navigate('/'); }}
                  className="btn btn-outline"
                >
                  Log out
                </button>
              </div>
            )}
            <Link
              to="/hotels"
              onClick={close}
              className="mt-2 inline-flex btn btn-primary justify-center"
            >
              <IconCalendar size={16} />
              Book now
            </Link>
            {/* Theme toggle (mobile) */}
            <div className="mt-2 grid gap-2">
              <button
                type="button"
                onClick={cycleTheme}
                title={`Theme: ${theme}`}
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <span className="mr-2">Theme</span>
                <span className="dark:hidden"><IconMoon size={16} /></span>
                <span className="hidden dark:inline"><IconSun size={16} /></span>
              </button>
              <div className="flex gap-2">
                {['light','dark'].map((t) => (
                  <button key={t} type="button" className={`flex-1 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${theme===t ? 'font-semibold' : ''}`} onClick={() => { setTheme(t); localStorage.setItem('theme', t); const isDark = t === 'dark'; const root = document.documentElement; if (isDark) { root.classList.add('dark') } else { root.classList.remove('dark') } root.setAttribute('data-theme', isDark ? 'dark' : 'light'); root.style.colorScheme = isDark ? 'dark' : 'light'; }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Role selection modal */}
      {modal && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 sm:pt-28">
          <div className="absolute inset-0 bg-transparent" onClick={() => setModal(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-select-title"
            className="relative mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl transition-all max-h-[85vh] overflow-auto dark:bg-gray-900"
          >
            <h3 id="role-select-title" className="text-lg font-semibold text-gray-900">
              {modal === 'signin' ? 'Select Login Type' : 'Choose Your Role'}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Continue as:</p>
            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={() => {
                  setModal(null)
                  navigate(modal === 'signin' ? '/login-user' : '/register-user')
                }}
                className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/60"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white">
                  <IconUser size={18} />
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Customer</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Search hotels, book rooms, and manage trips</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModal(null)
                  navigate(modal === 'signin' ? '/login-admin' : '/register-admin')
                }}
                className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-left hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/60"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-gray-900 text-white">
                  <IconBed size={18} />
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Admin</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Manage hotels, rooms, and bookings</p>
                </div>
              </button>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
