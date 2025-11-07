import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Hotel } from '../models/Hotel.js';
import { Room } from '../models/Room.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

function lastNMonthsLabels(n = 6) {
  const labels = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleString('en', { month: 'short' }) });
  }
  return labels;
}

export const summary = asyncHandler(async (_req, res) => {
  const [hotelCount, roomCount, bookingCount] = await Promise.all([
    Hotel.countDocuments(),
    Room.countDocuments(),
    Booking.countDocuments(),
  ]);

  // Revenue: sum of totalPrice for approved/completed/confirmed
  const revenueAgg = await Booking.aggregate([
    { $match: { status: { $in: ['approved', 'completed', 'confirmed'] } } },
    { $group: { _id: null, revenue: { $sum: '$totalPrice' } } },
  ]);
  const revenue = revenueAgg[0]?.revenue || 0;

  // Status distribution
  const statusAgg = await Booking.aggregate([
    { $group: { _id: '$status', count: { $count: {} } } },
  ]);
  const statusCounts = Object.fromEntries(statusAgg.map((s) => [s._id || 'unknown', s.count]));

  // Monthly bookings and revenue for the last 6 months (by createdAt)
  const months = lastNMonthsLabels(6);
  const startDate = new Date(new Date().getFullYear(), new Date().getMonth() - (months.length - 1), 1);
  const monthlyAgg = await Booking.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $project: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' }, status: 1, totalPrice: 1 } },
    { $group: {
      _id: { y: '$y', m: '$m' },
      bookings: { $count: {} },
      revenue: { $sum: { $cond: [{ $in: ['$status', ['approved', 'completed', 'confirmed']] }, '$totalPrice', 0] } },
    } },
    { $sort: { '_id.y': 1, '_id.m': 1 } },
  ]);
  const monthlyMap = new Map(monthlyAgg.map((r) => [`${r._id.y}-${String(r._id.m).padStart(2, '0')}`, r]));
  const monthly = months.map((m) => ({
    label: m.label,
    key: m.key,
    bookings: monthlyMap.get(m.key)?.bookings || 0,
    revenue: monthlyMap.get(m.key)?.revenue || 0,
  }));

  // Top hotels by bookings
  const topByBookings = await Booking.aggregate([
    { $lookup: { from: 'rooms', localField: 'room', foreignField: '_id', as: 'room' } },
    { $unwind: '$room' },
    { $group: { _id: '$room.hotel', bookings: { $count: {} } } },
    { $sort: { bookings: -1 } },
    { $limit: 5 },
  ]);

  // Top hotels by revenue (approved/completed/confirmed)
  const topByRevenue = await Booking.aggregate([
    { $match: { status: { $in: ['approved', 'completed', 'confirmed'] } } },
    { $lookup: { from: 'rooms', localField: 'room', foreignField: '_id', as: 'room' } },
    { $unwind: '$room' },
    { $group: { _id: '$room.hotel', revenue: { $sum: '$totalPrice' } } },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  // Hydrate hotel names
  const hotelIds = Array.from(new Set([...topByBookings, ...topByRevenue].map((t) => t._id).filter(Boolean)));
  const hotels = await Hotel.find({ _id: { $in: hotelIds } }, { name: 1 });
  const hotelMap = new Map(hotels.map((h) => [h._id.toString(), h.name]));
  const topHotelsByBookings = topByBookings.map((t) => ({ hotelId: t._id, name: hotelMap.get(String(t._id)) || 'Unknown', bookings: t.bookings }));
  const topHotelsByRevenue = topByRevenue.map((t) => ({ hotelId: t._id, name: hotelMap.get(String(t._id)) || 'Unknown', revenue: t.revenue }));

  res.json(new ApiResponse(true, {
    summary: {
      hotelCount,
      roomCount,
      bookingCount,
      revenue,
      statusCounts,
      monthly,
      topHotelsByBookings,
      topHotelsByRevenue,
    },
  }));
});
