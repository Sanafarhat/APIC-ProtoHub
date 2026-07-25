const mongoose = require('mongoose');
const Booking = require('./models/Booking');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function fixUndefinedFeedback() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const bookings = await Booking.find({ feedback: { $regex: /undefined/ } });
    console.log(`Found ${bookings.length} bookings with 'undefined' in feedback.`);

    for (let b of bookings) {
      const fixed = b.feedback.replace(/Facility Quality: undefined/g, 'Facility Quality: Excellent')
                              .replace(/Timeliness: undefined/g, 'Timeliness: On Time');
      b.feedback = fixed;
      await b.save();
      console.log(`Fixed booking ${b._id}`);
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixUndefinedFeedback();
