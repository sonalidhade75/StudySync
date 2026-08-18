const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// Get messages for a group
router.get('/:groupId', async (req, res) => {
  try {
    const messages = await Chat.find({ groupId: req.params.groupId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { groupId, userId, userName, message } = req.body;
    const newChat = new Chat({ groupId, userId, userName, message });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;