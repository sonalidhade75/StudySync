const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  title: { type: String, required: true },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctOptionIndex: { type: Number, required: true }
    }
  ],
  leaderboard: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: { type: String },
      score: { type: Number, default: 0 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);