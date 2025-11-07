import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const SignUp = ({ onSwitchToLogin, mode = 'user' }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginWithResult } = useAuth()

  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = mode === 'admin'
        ? await api.registerAdmin(name, email, password, adminCode)
        : await api.register(name, email, password)
      const { token, user } = res.data || {}
      if (token) {
        loginWithResult({ token, user })
        navigate(user?.role === 'admin' ? '/admin/dashboard' : '/home')
        return
      }
      setError('Unexpected response')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[700px] grid grid-cols-1 md:grid-cols-2 bg-amber-50 dark:bg-gray-950">
      {/* Visual side */}
      <div className="relative hidden md:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1600&auto=format&fit=crop"
          alt="Hotel room"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-black/10 dark:from-black/70 dark:to-black/30" />
        <div className="relative z-10 p-10 text-white h-full flex flex-col justify-end">
          <h2 className="text-3xl font-semibold">Make yourself at home</h2>
          <p className="mt-2 text-white/90">Create your {mode === 'admin' ? 'admin ' : ''}account to start booking.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center py-10 px-6">
        <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl bg-white shadow-lg p-6 dark:bg-gray-900 dark:text-gray-100 dark:border dark:border-gray-800 dark:shadow-none">
          {/* Role tabs */}
          <div className="mb-6 flex rounded-md bg-gray-100 p-1 text-sm font-medium dark:bg-gray-800 dark:border dark:border-gray-700">
            <Link to="/register-user" className={`flex-1 text-center rounded-md py-2 ${mode!== 'admin' ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-gray-100 dark:shadow-none dark:border dark:border-gray-700' : 'text-gray-600 dark:text-gray-300'}`}>Customer</Link>
            <Link to="/register-admin" className={`flex-1 text-center rounded-md py-2 ${mode=== 'admin' ? 'bg-white shadow text-gray-900 dark:bg-gray-900 dark:text-gray-100 dark:shadow-none dark:border dark:border-gray-700' : 'text-gray-600 dark:text-gray-300'}`}>Admin</Link>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create {mode === 'admin' ? 'Admin ' : ''}account</h1>
          <p className="text-sm text-gray-600 mt-1 dark:text-gray-300">It only takes a minute.</p>

          <label className="mt-6 block text-sm text-gray-700 dark:text-gray-200">Full name</label>
          <input value={name} onChange={(e)=>setName(e.target.value)} type="text" placeholder="Jane Doe" className="mt-2 w-full rounded-lg border border-gray-300 px-4 h-11 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />

          <label className="mt-4 block text-sm text-gray-700 dark:text-gray-200">Email</label>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="you@example.com" className="mt-2 w-full rounded-lg border border-gray-300 px-4 h-11 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />

          <label className="mt-4 block text-sm text-gray-700 dark:text-gray-200">Password</label>
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="********" className="mt-2 w-full rounded-lg border border-gray-300 px-4 h-11 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />

          <label className="mt-4 block text-sm text-gray-700 dark:text-gray-200">Confirm password</label>
          <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" placeholder="********" className="mt-2 w-full rounded-lg border border-gray-300 px-4 h-11 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required />

          {mode === 'admin' && (
            <>
              <label className="mt-4 block text-sm text-gray-700 dark:text-gray-200">Admin invite code</label>
              <input value={adminCode} onChange={(e)=>setAdminCode(e.target.value)} type="text" placeholder="Enter code"
                     className="mt-2 w-full rounded-lg border border-gray-300 px-4 h-11 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700" required={mode==='admin'} />
            </>
          )}

          <button disabled={loading} type="submit" className="mt-6 w-full h-11 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          {error && <p className={`text-sm mt-3 ${error.includes('successful') ? 'text-green-600' : 'text-red-400'}`}>{error}</p>}
          <p className="text-gray-600 text-sm mt-4 dark:text-gray-300">Already have an account? {onSwitchToLogin ? (
            <button type="button" onClick={onSwitchToLogin} className="text-indigo-500 hover:underline">Sign in</button>
          ) : (
            <Link to={mode === 'admin' ? '/login-admin' : '/login-user'} className="text-indigo-500 hover:underline">Sign in</Link>
          )}
          </p>
        </form>
      </div>
    </div>
  )
}

export default SignUp
