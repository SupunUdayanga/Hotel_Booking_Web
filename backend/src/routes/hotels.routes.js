import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { listHotels, getHotel, createHotel, updateHotel, deleteHotel, removeHotelImage, rateHotel } from '../controllers/hotels.controller.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.get('/', listHotels);
// Optional auth on get to include userRating in response when available
router.get('/:id', auth(false), getHotel);
// Support image uploads via multipart/form-data; field name 'images'
router.post('/', auth(true), requireRole('admin'), upload.array('images', 5), createHotel);
router.patch('/:id', auth(true), requireRole('admin'), upload.array('images', 5), updateHotel);
router.put('/:id', auth(true), requireRole('admin'), upload.array('images', 5), updateHotel);
router.delete('/:id', auth(true), requireRole('admin'), deleteHotel);
// Remove a single image from a hotel
router.delete('/:id/images', auth(true), requireRole('admin'), removeHotelImage);
// Ratings: authenticated users can rate a hotel (create/update)
router.post('/:id/rating', auth(true), rateHotel);
export default router;
