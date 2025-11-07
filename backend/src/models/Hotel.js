import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    address: String,
    city: String,
    country: String,
    images: [String],
    amenities: [String],
    // Average rating across all user ratings
    rating: { type: Number, min: 0, max: 5, default: 0 },
    // Number of user ratings submitted
    ratingsCount: { type: Number, default: 0 },
    // Individual user ratings to prevent duplicate votes and allow updates
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        value: { type: Number, min: 1, max: 5, required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Keep updatedAt on embedded rating subdocs
hotelSchema.pre('save', function (next) {
  if (this.isModified('ratings') && Array.isArray(this.ratings)) {
    this.ratings.forEach((r) => {
      if (r && r.isModified && r.isModified('value')) {
        r.updatedAt = new Date();
      }
    });
  }
  next();
});

export const Hotel = mongoose.model('Hotel', hotelSchema);
