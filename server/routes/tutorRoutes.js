const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor');

// Get all verified tutors
router.get('/', async (req, res) => {
  try {
    const tutors = await Tutor.find();
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a tutor (For testing / adding sample data)
router.post('/add', async (req, res) => {
  try {
    const newTutor = new Tutor(req.body);
    await newTutor.save();
    res.status(201).json(newTutor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const Booking = require('../models/Booking');

// Book a slot with double-booking prevention check
router.post('/book', async (req, res) => {
  try {
    const { tutorId, studentName, slotTime } = req.body;

    // Check if slot is already booked for this tutor
    const existingBooking = await Booking.findOne({ tutorId, slotTime });
    if (existingBooking) {
      return res.status(400).json({ error: 'This slot is already booked! Please choose another time.' });
    }

    const newBooking = new Booking({ tutorId, studentName, slotTime });
    await newBooking.save();
    res.status(201).json({ message: 'Booking confirmed successfully!', newBooking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;