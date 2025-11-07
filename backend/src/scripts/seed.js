import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Hotel } from '../models/Hotel.js';
import { Room } from '../models/Room.js';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_booking';

async function run() {
  await mongoose.connect(uri);
  console.log('Connected for seeding');

  let admin = await User.findOne({ email: 'admin@example.com' });
  if (!admin) {
    admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' });
    console.log('Created admin user: admin@example.com / admin123');
  }

  let hotel = await Hotel.findOne({ name: 'Grand Plaza' });
  if (!hotel) {
    hotel = await Hotel.create({
      name: 'Grand Plaza',
      description: 'Central hotel with modern amenities',
      city: 'Metropolis',
      country: 'Wonderland',
      amenities: ['wifi', 'pool', 'gym'],
      images: []
    });
    console.log('Created sample hotel');
  }

  const roomCount = await Room.countDocuments({ hotel: hotel._id });
  if (roomCount === 0) {
    await Room.create([
      { hotel: hotel._id, name: 'Standard Room', capacity: 2, pricePerNight: 80 },
      { hotel: hotel._id, name: 'Deluxe Room', capacity: 3, pricePerNight: 120 }
    ]);
    console.log('Created sample rooms');
  }

  await mongoose.disconnect();
  console.log('Seeding done');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
