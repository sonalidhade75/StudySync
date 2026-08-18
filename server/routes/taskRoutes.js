const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Get tasks for a specific group
router.get('/:groupId', async (req, res) => {
  try {
    const tasks = await Task.find({ groupId: req.params.groupId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { groupId, title, assignedTo } = req.body;
    const newTask = new Task({ groupId, title, assignedTo });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task status (Pending <-> Completed)
router.patch('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;