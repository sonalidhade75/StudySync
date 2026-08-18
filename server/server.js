const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const http = require('http'); // 1. Http module import kele
const { Server } = require('socket.io'); // 2. Socket.io import kele
const Quiz = require('./models/Quiz'); 


// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app); // 3. Express sobat http server create kela

// 4. Socket.io initialize kela with CORS settings
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Import Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// groups routes
const groupRoutes = require('./routes/groupRoutes');
app.use('/api/groups', groupRoutes);

const quizRoutes = require('./routes/quizRoutes');
app.use('/api/quizzes', quizRoutes);

const chatRoutes = require('./routes/chatRoutes');
app.use('/api/chats', chatRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

const resourceRoutes = require('./routes/resourceRoutes');
app.use('/api/resources', resourceRoutes);

const tutorRoutes = require('./routes/tutorRoutes');
app.use('/api/tutors', tutorRoutes);


// Basic Route for Testing
app.get('/', (req, res) => {
  res.send('StudySync Backend Server is Running!');
});

// 5. Socket.io Connection Logic (Live Chat & Whiteboard events sathi)
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Group join event (Pratyek group sathi separate room)
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
  });

  // Send & Broadcast Message Event
  socket.on('send_message', (data) => {
    // data madhe { roomId, message, sender } asel
    io.to(data.roomId).emit('receive_message', data);
  });

  // Whiteboard drawing event sync
  socket.on('drawing', (data) => {
    socket.to(data.roomId).emit('drawing', data);
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

// Start Server (app.listen aivji server.js cha server.listen vaprayche)
server.listen(PORT, () => {
  console.log(`Server & Socket.io is running on port ${PORT}`);
});

// 1. Create a New Quiz
app.post('/api/quizzes', async (req, res) => {
  try {
    const { groupId, title, questions } = req.body;
    const newQuiz = new Quiz({ groupId, title, questions });
    await newQuiz.save();
    res.status(201).json({ message: 'Quiz created successfully!', quiz: newQuiz });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Quizzes by Group ID
app.get('/api/quizzes/:groupId', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ groupId: req.params.groupId });
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Submit Quiz Score & Update Leaderboard
app.post('/api/quizzes/:quizId/submit', async (req, res) => {
  try {
    const { userId, userName, score } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Check if user already exists in leaderboard, update or push
    const existingEntryIndex = quiz.leaderboard.findIndex(entry => entry.userId.toString() === userId);
    
    if (existingEntryIndex > -1) {
      if (score > quiz.leaderboard[existingEntryIndex].score) {
        quiz.leaderboard[existingEntryIndex].score = score;
      }
    } else {
      quiz.leaderboard.push({ userId, userName, score });
    }

    // Sort leaderboard in descending order of score
    quiz.leaderboard.sort((a, b) => b.score - a.score);

    await quiz.save();
    res.status(200).json({ message: 'Score submitted!', leaderboard: quiz.leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});