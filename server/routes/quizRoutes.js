const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');

// Get quizzes by groupId
router.get('/:groupId', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ groupId: req.params.groupId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new quiz
router.post('/', async (req, res) => {
  try {
    const { groupId, title, questions } = req.body;
    const newQuiz = new Quiz({
      groupId,
      title,
      questions,
      leaderboard: []
    });
    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit quiz score
router.post('/:quizId/submit', async (req, res) => {
  try {
    const { userId, userName, score } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user already exists in leaderboard, update if score is higher, otherwise push
    const existingEntryIndex = quiz.leaderboard.findIndex(entry => entry.userId === userId);
    
    if (existingEntryIndex > -1) {
      if (score > quiz.leaderboard[existingEntryIndex].score) {
        quiz.leaderboard[existingEntryIndex].score = score;
      }
    } else {
      quiz.leaderboard.push({ userId, userName, score });
    }

    // Sort leaderboard by score descending
    quiz.leaderboard.sort((a, b) => b.score - a.score);

    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;