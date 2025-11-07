import React, { useState } from 'react'

const Contact = () => {
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = (e) => {
    e.preventDefault()
    // No backend endpoint specified; simulate success
    setStatus('Thank you! We will get back to you soon.')
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Contact us</h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Have questions about bookings, rooms, or special requests? Reach out to our team and we'll help you plan the perfect stay.
        </p>

        <div className="space-y-3 text-sm">
          <p><span className="font-medium text-gray-900 dark:text-white">Phone:</span> <a className="text-indigo-600 hover:underline dark:text-indigo-400" href="tel:+10000000000">+1 (000) 000-0000</a></p>
          <p><span className="font-medium text-gray-900 dark:text-white">Email:</span> <a className="text-indigo-600 hover:underline dark:text-indigo-400" href="mailto:hello@example.com">hello@example.com</a></p>
          <p><span className="font-medium text-gray-900 dark:text-white">Address:</span> <span className="text-gray-700 dark:text-gray-300">123 Main St, City, Country</span></p>
          <p className="text-gray-500 dark:text-gray-400">We typically respond within 1–2 business days.</p>
        </div>
      </div>

      <div>
        <form onSubmit={onSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
          <div className="mb-4">
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={onChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={onChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              value={form.message}
              onChange={onChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
          <button type="submit" className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
            Send message
          </button>
          {status && (
            <div className="mt-3 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-300">{status}</div>
          )}
        </form>
      </div>
    </div>
  )
}

export default Contact
