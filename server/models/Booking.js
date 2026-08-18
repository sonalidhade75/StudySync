const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  studentName: { type: String, required: true },
  slotTime: { type: String, required: true }, // e.g., "2026-06-10 10:00 AM"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);