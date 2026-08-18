import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuizRoom({ groupId, userId, userName }) {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // Create Quiz Form States
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/quizzes/${groupId}`);
        setQuizzes(res.data);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      }
    };

    if (groupId) {
      fetchQuizzes();
    }
  }, [groupId]);
  const fetchQuizzes = async () => {
    try {
      // Backend port corrected from 5000 to 5001 to match Dashboard & Server
      const res = await axios.get(`http://localhost:5001/api/quizzes/${groupId}`);
      setQuizzes(res.data);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const newQuizData = {
        groupId,
        title,
        questions: [{ questionText, options, correctOptionIndex }]
      };
      await axios.post('http://localhost:5001/api/quizzes', newQuizData);
      setTitle('');
      setQuestionText('');
      setOptions(['', '', '', '']);
      setCreating(false);
      fetchQuizzes();
    } catch (err) {
      console.error('Error creating quiz:', err);
    }
  };

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
  };

  const handleNextQuestion = async (quiz) => {
    const isCorrect = selectedOption === quiz.questions[currentQuestionIndex].correctOptionIndex;
    const updatedScore = isCorrect ? score + 1 : score;
    
    if (isCorrect) {
      setScore(updatedScore);
    }

    if (currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // Quiz Finished, Submit Score using updatedScore to avoid state delay
      setShowResult(true);
      try {
        await axios.post(`http://localhost:5001/api/quizzes/${quiz._id}/submit`, {
          userId,
          userName: userName || 'Student',
          score: updatedScore
        });
        fetchQuizzes();
      } catch (err) {
        console.error('Error submitting score:', err);
      }
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🧠 Group Quizzes & Leaderboard</h2>
        <button 
          onClick={() => setCreating(!creating)}
          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
        >
          {creating ? 'Cancel' : '+ Create Quiz'}
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreateQuiz} className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Create New Quiz</h3>
          <input 
            type="text" placeholder="Quiz Title" value={title} onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-2 mb-2 border rounded" required 
          />
          <input 
            type="text" placeholder="Question Text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} 
            className="w-full p-2 mb-2 border rounded" required 
          />
          {options.map((opt, idx) => (
            <input 
              key={idx} type="text" placeholder={`Option ${idx + 1}`} value={opt} 
              onChange={(e) => {
                const newOpts = [...options];
                newOpts[idx] = e.target.value;
                setOptions(newOpts);
              }} 
              className="w-full p-2 mb-2 border rounded" required 
            />
          ))}
          <label className="block text-sm font-medium mb-1">Correct Option Index (0 to 3):</label>
          <input 
            type="number" min="0" max="3" value={correctOptionIndex} onChange={(e) => setCorrectOptionIndex(Number(e.target.value))} 
            className="w-full p-2 mb-2 border rounded" required 
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm">Save Quiz</button>
        </form>
      )}

      {!activeQuiz ? (
        <div>
          <h3 className="font-semibold text-lg mb-2">Available Quizzes</h3>
          {quizzes.length === 0 ? <p className="text-gray-500">No quizzes available yet. Create one!</p> : (
            <div className="space-y-3">
              {quizzes.map((q) => (
                <div key={q._id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{q.title}</h4>
                    <p className="text-xs text-gray-500">{q.questions.length} Question(s)</p>
                  </div>
                  <button 
                    onClick={() => { setActiveQuiz(q); setCurrentQuestionIndex(0); setScore(0); setShowResult(false); setSelectedOption(null); }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Take Quiz
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-2">🏆 Leaderboard</h3>
            {quizzes.map((q) => (
              <div key={q._id} className="mb-4">
                <h4 className="text-sm font-bold text-gray-700">{q.title}</h4>
                <ul className="list-disc pl-5 text-sm">
                  {q.leaderboard && q.leaderboard.length > 0 ? (
                    q.leaderboard.map((entry, idx) => (
                      <li key={idx}>{entry.userName}: <b>{entry.score} pts</b></li>
                    ))
                  ) : (
                    <li className="text-gray-400 list-none">No scores yet. Be the first!</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 border rounded bg-gray-50">
          {!showResult ? (
            <div>
              <h3 className="font-bold text-lg mb-2">{activeQuiz.title}</h3>
              <p className="mb-3">Q{currentQuestionIndex + 1}: {activeQuiz.questions[currentQuestionIndex].questionText}</p>
              <div className="space-y-2 mb-4">
                {activeQuiz.questions[currentQuestionIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full p-2 text-left border rounded ${selectedOption === idx ? 'bg-blue-500 text-white' : 'bg-white'}`}
                  >
                    {idx + 1}. {opt}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => handleNextQuestion(activeQuiz)}
                disabled={selectedOption === null}
                className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {currentQuestionIndex + 1 === activeQuiz.questions.length ? 'Submit Quiz' : 'Next Question'}
              </button>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-lg text-green-600 mb-2">Quiz Completed! 🎉</h3>
              <p className="mb-4">Your Score: <b>{score} / {activeQuiz.questions.length}</b></p>
              <button 
                onClick={() => setActiveQuiz(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Back to Quizzes
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}