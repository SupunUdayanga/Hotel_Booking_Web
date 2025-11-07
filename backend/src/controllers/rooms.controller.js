import { Room } from '../models/Room.js';
import { Hotel } from '../models/Hotel.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listRooms = asyncHandler(async (req, res) => {
  const { hotel } = req.query;
  const filter = {};
  if (hotel) filter.hotel = hotel;
  const rooms = await Room.find(filter).sort({ createdAt: -1 });
  res.json(new ApiResponse(true, { rooms }));
});

export const getRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id).populate('hotel');
  if (!room) throw new ApiError(404, 'Room not found');
  res.json(new ApiResponse(true, { room }));
});

export const createRoom = asyncHandler(async (req, res) => {
  const { hotel, name, capacity, pricePerNight, images, amenities } = req.body;
  if (!hotel || !name || !pricePerNight) throw new ApiError(400, 'Missing required fields');
  const exists = await Hotel.findById(hotel);
  if (!exists) throw new ApiError(404, 'Hotel not found');
  const room = await Room.create({ hotel, name, capacity, pricePerNight, images, amenities });
  res.status(201).json(new ApiResponse(true, { room }));
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!room) throw new ApiError(404, 'Room not found');
  res.json(new ApiResponse(true, { room }));
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findByIdAndDelete(req.params.id);
  if (!room) throw new ApiError(404, 'Room not found');
  res.json(new ApiResponse(true, { id: req.params.id }));
});
