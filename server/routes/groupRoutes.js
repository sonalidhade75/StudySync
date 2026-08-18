const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const crypto = require('crypto');

// 1. Create a new Study Group
router.post('/create', async (req, res) => {
  try {
    const { name, description, userId } = req.body;
    
    // Generate a unique invite code/link
    const inviteCode = crypto.randomBytes(4).toString('hex');

    const newGroup = new Group({
      name,
      description,
      createdBy: userId,
      members: [userId], // Creator is the first member
      inviteCode
    });

    await newGroup.save();
    res.status(201).json({ message: 'Group created successfully!', group: newGroup });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while creating group' });
  }
});

// 2. Get all groups for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const groups = await Group.find({ members: req.params.userId });
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while fetching groups' });
  }
});

// 3. Join a group via Invite Code
router.post('/join', async (req, res) => {
  try {
    const { inviteCode, userId } = req.body;

    const group = await Group.findOne({ inviteCode });
    if (!group) {
      return res.status(404).json({ message: 'Invalid Invite Code!' });
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this group!' });
    }

    group.members.push(userId);
    await group.save();

    res.json({ message: 'Joined group successfully!', group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while joining group' });
  }
});

// 4. Add a Resource/Note to a Group
router.post('/:groupId/resources', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found!' });
    }

    const newResource = {
      title,
      content,
      uploadedBy: userId
    };

    group.resources.push(newResource);
    await group.save();

    res.status(201).json({ message: 'Resource added successfully!', group });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding resource' });
  }
});

module.exports = router;