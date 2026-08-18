const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  title: { type: String, required: true },
  fileUrl: { type: String, required: true }, // File link kinva base64/Cloud URL
  uploadedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', resourceSchema);