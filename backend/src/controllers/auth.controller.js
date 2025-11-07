import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function signToken(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return token;
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new ApiError(400, 'Missing fields');
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already in use');
  const user = await User.create({ name, email, password });
  const token = signToken(user);
  res.status(201).json(new ApiResponse(true, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Missing fields');
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid credentials');
  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');
  const token = signToken(user);
  res.json(new ApiResponse(true, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }));
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(new ApiResponse(true, { user }));
});

// Admin self-signup protected by an invite code stored in env ADMIN_SIGNUP_CODE
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, adminCode } = req.body;
  if (!name || !email || !password || !adminCode) throw new ApiError(400, 'Missing fields');
  const expected = process.env.ADMIN_SIGNUP_CODE;
  if (!expected) throw new ApiError(503, 'Admin signup disabled');
  if (adminCode !== expected) throw new ApiError(403, 'Invalid admin code');
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already in use');
  const user = await User.create({ name, email, password, role: 'admin' });
  const token = signToken(user);
  res.status(201).json(new ApiResponse(true, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }));
});
