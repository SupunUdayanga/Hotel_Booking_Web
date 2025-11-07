import { Hotel } from '../models/Hotel.js';
import { Room } from '../models/Room.js';
import { Booking } from '../models/Booking.js';
import fs from 'fs';
import path from 'path';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listHotels = asyncHandler(async (req, res) => {
  const { city, q } = req.query;
  const filter = {};
  if (city) filter.city = city;
  if (q) filter.name = { $regex: q, $options: 'i' };
  const hotels = await Hotel.find(filter).sort({ createdAt: -1 });
  res.json(new ApiResponse(true, { hotels }));
});

export const getHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, 'Hotel not found');
  const rooms = await Room.find({ hotel: hotel._id });
  // Include flags for UI
  let userRating = null; // optional, not used for per-booking rating
  let canRate = false;
  if (req.user) {
    // Determine if user can rate: has past approved/completed booking in this hotel
    try {
      const roomIds = rooms.map((r) => r._id);
      const now = new Date();
      const eligibleBookings = await Booking.find({
        user: req.user.id,
        room: { $in: roomIds },
        $or: [
          { status: 'completed' },
          { status: { $in: ['approved', 'confirmed'] }, checkOut: { $lte: now } },
        ],
      }).select('_id');
      const ratedSet = new Set((hotel.ratings || []).map((r) => String(r.booking || '')));
      canRate = eligibleBookings.some((b) => !ratedSet.has(String(b._id)));
    } catch {}
  }
  res.json(new ApiResponse(true, { hotel, rooms, userRating, canRate }));
});

export const createHotel = asyncHandler(async (req, res) => {
  // Collect uploaded image URLs (served from /uploads)
  const uploaded = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const payload = { ...req.body };
  // Normalize amenities: accept comma-separated string or array
  if (typeof payload.amenities === 'string') {
    payload.amenities = payload.amenities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (uploaded.length) payload.images = uploaded;
  const hotel = await Hotel.create(payload);
  res.status(201).json(new ApiResponse(true, { hotel }));
});

export const updateHotel = asyncHandler(async (req, res) => {
  const uploaded = (req.files || []).map((f) => `/uploads/${f.filename}`);
  const set = { ...req.body };
  if (typeof set.amenities === 'string') {
    set.amenities = set.amenities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const update = { $set: set };
  if (uploaded.length) update.$push = { images: { $each: uploaded } };
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!hotel) throw new ApiError(404, 'Hotel not found');
  res.json(new ApiResponse(true, { hotel }));
});

export const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findByIdAndDelete(req.params.id);
  if (!hotel) throw new ApiError(404, 'Hotel not found');
  res.json(new ApiResponse(true, { id: req.params.id }));
});

// Remove a specific image from a hotel and delete the file from disk if applicable
export const removeHotelImage = asyncHandler(async (req, res) => {
  const { path: imagePath } = req.body || {};
  if (!imagePath) throw new ApiError(400, 'Image path is required');

  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, 'Hotel not found');

  const before = hotel.images?.length || 0;
  hotel.images = (hotel.images || []).filter((p) => p !== imagePath);
  if ((hotel.images?.length || 0) === before) {
    // Nothing to remove
    return res.json(new ApiResponse(true, { hotel }));
  }
  await hotel.save();

  // Best-effort delete of the underlying file when it lives under /uploads
  try {
    if (imagePath.startsWith('/uploads/')) {
      const filename = imagePath.split('/uploads/')[1];
      if (filename) {
        const fsPath = path.resolve('uploads', filename);
        await fs.promises.unlink(fsPath).catch(() => {});
      }
    }
  } catch {}

  res.json(new ApiResponse(true, { hotel }));
});

// Allow an authenticated user to create or update a rating for a hotel
export const rateHotel = asyncHandler(async (req, res) => {
  const valueRaw = req.body?.value;
  const bookingId = req.body?.bookingId;
  const value = Number(valueRaw);
  if (!Number.isFinite(value) || value < 1 || value > 5) {
    throw new ApiError(400, 'Rating value must be between 1 and 5');
  }
  if (!bookingId) throw new ApiError(400, 'bookingId is required');

  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) throw new ApiError(404, 'Hotel not found');
  const userId = String(req.user.id);

  // Validate booking belongs to user and hotel, and is eligible
  const booking = await Booking.findOne({ _id: bookingId, user: req.user.id }).populate('room');
  if (!booking || String(booking.room?.hotel) !== String(hotel._id)) {
    throw new ApiError(403, 'Invalid booking');
  }
  const now = new Date();
  const eligibleStatus = booking.status === 'completed' || (['approved', 'confirmed'].includes(booking.status) && booking.checkOut <= now);
  if (!eligibleStatus) throw new ApiError(403, 'You can rate after your stay is completed');

  // Only one rating per booking
  const existing = (hotel.ratings || []).find((r) => String(r.booking) === String(bookingId));
  if (existing) throw new ApiError(409, 'You have already rated this stay');
  hotel.ratings = hotel.ratings || [];
  hotel.ratings.push({ user: req.user.id, booking: booking._id, value });

  // Recompute aggregate
  const count = (hotel.ratings || []).length;
  const avg = count > 0 ? hotel.ratings.reduce((sum, r) => sum + (Number(r.value) || 0), 0) / count : 0;
  hotel.rating = Math.round(avg * 10) / 10; // one decimal
  hotel.ratingsCount = count;

  await hotel.save();
  res.json(new ApiResponse(true, { hotel, userRating: value }));
});
