import { Booking } from '../models/Booking.js';
import { Room } from '../models/Room.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function overlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export const createBooking = asyncHandler(async (req, res) => {
  const { roomId, checkIn, checkOut } = req.body;
  if (!roomId || !checkIn || !checkOut) throw new ApiError(400, 'Missing fields');
  const room = await Room.findById(roomId);
  if (!room) throw new ApiError(404, 'Room not found');
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (!(start instanceof Date) || !(end instanceof Date) || isNaN(start) || isNaN(end) || start >= end) {
    throw new ApiError(400, 'Invalid dates');
  }
  const conflicts = await Booking.find({ room: roomId, status: { $ne: 'cancelled' } });
  const hasConflict = conflicts.some((b) => overlap(start, end, b.checkIn, b.checkOut));
  if (hasConflict) throw new ApiError(409, 'Room not available for selected dates');

  const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * room.pricePerNight;
  // New bookings start as 'pending' and require admin approval
  const booking = await Booking.create({ user: req.user.id, room: roomId, checkIn: start, checkOut: end, totalPrice, status: 'pending' });
  res.status(201).json(new ApiResponse(true, { booking }));
});

export const myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).populate({ path: 'room', populate: { path: 'hotel' } }).sort({ createdAt: -1 });
  res.json(new ApiResponse(true, { bookings }));
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
  if (!booking) throw new ApiError(404, 'Booking not found');
  booking.status = 'cancelled';
  await booking.save();
  res.json(new ApiResponse(true, { booking }));
});

// Admin: list all bookings
export const listAllBookings = asyncHandler(async (_req, res) => {
  const bookings = await Booking.find()
    .populate({ path: 'user', select: 'name email' })
    .populate({ path: 'room', populate: { path: 'hotel' } })
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(true, { bookings }));
});

// Admin: update booking status (approved, cancelled, completed)
export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['approved', 'cancelled', 'completed'];
  if (!allowed.includes(status)) throw new ApiError(400, 'Invalid status');
  const booking = await Booking.findById(id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  booking.status = status;
  await booking.save();
  const populated = await booking.populate({ path: 'room', populate: { path: 'hotel' } });
  res.json(new ApiResponse(true, { booking: populated }));
});

// Admin: delete a booking (optional)
export const deleteBookingAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findByIdAndDelete(id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  res.json(new ApiResponse(true, { id }));
});
