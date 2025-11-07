import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    // Supported lifecycle: pending -> approved -> (completed | cancelled)
    // Keep 'confirmed' for backward compatibility and map it to 'approved' in UI as needed
    status: { type: String, enum: ['pending', 'approved', 'cancelled', 'completed', 'confirmed'], default: 'pending' }
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
