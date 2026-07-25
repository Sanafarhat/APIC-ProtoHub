const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  institution: { type: String },
  equipmentType: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  status: { type: String, enum: ['available', 'maintenance', 'unavailable'], default: 'available' },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  icon: { type: String }, // Icon identifier string
  imageUrl: { type: String }, // URL for the facility image
  softwareType: { type: String } // Software category if applicable
});

module.exports = mongoose.model('Facility', facilitySchema);
