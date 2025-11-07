// Prefer direct backend URL during development
// In production (Docker/hosted), use VITE_APP_BACKEND_ADDRESS if provided, else fallback to '/api'
const BASE = import.meta.env.DEV
  ? 'http://localhost:4000/api'
  : (import.meta.env.VITE_APP_BACKEND_ADDRESS || '/api');
const ORIGIN = BASE.replace(/\/?api$/, '');

async function http(path, { method = 'GET', body } = {}) {
  const headers = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const url = `${BASE}${path}`;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isForm) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  health: () => http('/health'),
  // Auth
  login: (email, password) => http('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name, email, password) => http('/auth/register', { method: 'POST', body: { name, email, password } }),
  registerAdmin: (name, email, password, adminCode) => http('/auth/register-admin', { method: 'POST', body: { name, email, password, adminCode } }),
  me: () => http('/auth/me'),

  // Hotels
  listHotels: (params) => {
    const qs = new URLSearchParams(params || {}).toString();
    return http(`/hotels${qs ? `?${qs}` : ''}`);
  },
  getHotel: (id) => http(`/hotels/${id}`),
  rateHotel: (id, value, bookingId) => http(`/hotels/${id}/rating`, { method: 'POST', body: { value, bookingId } }),
  createHotel: (body) => http('/hotels', { method: 'POST', body }),
  updateHotel: (id, body) => http(`/hotels/${id}`, { method: 'PATCH', body }),
  deleteHotel: (id) => http(`/hotels/${id}`, { method: 'DELETE' }),
  removeHotelImage: (id, imagePath) => http(`/hotels/${id}/images`, { method: 'DELETE', body: { path: imagePath } }),

  // Rooms
  listRooms: (params) => {
    const qs = new URLSearchParams(params || {}).toString();
    return http(`/rooms${qs ? `?${qs}` : ''}`);
  },
  getRoom: (id) => http(`/rooms/${id}`),
  createRoom: (body) => http('/rooms', { method: 'POST', body }),
  updateRoom: (id, body) => http(`/rooms/${id}`, { method: 'PATCH', body }),
  deleteRoom: (id) => http(`/rooms/${id}`, { method: 'DELETE' }),

  // Bookings
  createBooking: (body) => http('/bookings', { method: 'POST', body }),
  myBookings: () => http('/bookings/me'),
  cancelBooking: (id) => http(`/bookings/${id}/cancel`, { method: 'POST' }),

  // Admin: bookings
  adminListBookings: () => http('/bookings'),
  adminUpdateBooking: (id, status) => http(`/bookings/${id}`, { method: 'PUT', body: { status } }),
  adminDeleteBooking: (id) => http(`/bookings/${id}`, { method: 'DELETE' }),

  // Admin: reports
  reportsSummary: () => http('/reports/summary'),
};

export function fileUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${ORIGIN}${path.startsWith('/') ? path : '/' + path}`;
}
