const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  duration: { type: Number, required: true }, // in hours
  totalCost: { type: Number, required: true },
  attachedFile: { type: String }, // URL or filename of CAD design or Document
  equipment: { type: String }, // Specific requested resource
  materialCost: { type: Number, default: 0 }, // Estimated by AI
  aiEstimated: { type: Boolean, default: false }, // Flag if AI was used
  status: { type: String, enum: ['pending', 'pending_admin', 'pending_operator', 'approved', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'], default: 'pending' },
  paymentId: { type: String }, // Razorpay Payment ID
  feedback: { type: String } // Remarks and feedback
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
