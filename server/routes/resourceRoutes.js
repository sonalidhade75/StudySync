const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');

// Get files for a specific group
router.get('/:groupId', async (req, res) => {
  try {
    const resources = await Resource.find({ groupId: req.params.groupId });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload a new resource link/file
router.post('/', async (req, res) => {
  try {
    const { groupId, title, fileUrl, uploadedBy } = req.body;
    const newResource = new Resource({ groupId, title, fileUrl, uploadedBy });
    await newResource.save();
    res.status(201).json(newResource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;