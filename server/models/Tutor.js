const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  hourlyRate: { type: Number, required: true },
  bio: { type: String, required: true }
});

module.exports = mongoose.model('Tutor', tutorSchema);