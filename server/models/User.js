const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['innovator', 'operator', 'admin'], default: 'innovator' },
  category: { type: String }, // e.g. 'Student', 'Professional', 'Startup/MSME', 'University'
  phone: { type: String },
  organization: { type: String }, // Used as collegeName for students, companyName for startups, etc.
  location: { type: String }, // For Operators to specify their campus/city location
  recentDegree: { type: String },
  dpiitNo: { type: String },
  gstNo: { type: String },
  designation: { type: String },
  facilityName: { type: String },
  // File mock URLs
  govIdProof: { type: String },
  studentIdProof: { type: String },
  facilityProof: { type: String },
  conceptNote: { type: String },
  technicalProposal: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
