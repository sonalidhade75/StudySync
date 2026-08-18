import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './Dashboard.css';
import QuizRoom from './QuizRoom';
import ChatRoom from './ChatRoom'; 
import TaskBoard from './TaskBoard';
import ResourceHub from './ResourceHub';
import TutorMarketplace from './TutorMarketplace';

// Socket connection (Backend URL)
const socket = io('http://localhost:5001');

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete Web Development Module', completed: false },
    { id: 2, title: 'Submit Project Proposal', completed: true },
  ]);
  const [newTask, setNewTask] = useState('');

  // Study Groups States & Fetch Logic
  const [myGroups, setMyGroups] = useState([]);
  
  // Live Chat & Whiteboard States
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [activeFeature, setActiveFeature] = useState('chat'); // 'chat', 'whiteboard', or 'quiz'

  // User details securely retrieved from localStorage
  const userId = localStorage.getItem('userId') || '640000000000000000000001';
  const userName = localStorage.getItem('userName') || 'Sonali';

  // Canvas Refs for Whiteboard
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/groups/user/${userId}`);
      setMyGroups(res.data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

 useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/groups/user/${userId}`);
        setMyGroups(res.data);
      } catch (err) {
        console.error('Error fetching groups:', err);
      }
    };

    if (activeTab === 'groups') {
      fetchGroups();
    }
  }, [activeTab, userId]);

  // Socket.io listener for incoming messages & drawings
  useEffect(() => {
    socket.on('receive_message', (data) => {
      setChatMessages((prev) => [...prev, data]);
    });

    socket.on('drawing', (data) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = data.color || '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(data.x0, data.y0);
      ctx.lineTo(data.x1, data.y1);
      ctx.stroke();
      ctx.closePath();
    });

    return () => {
      socket.off('receive_message');
      socket.off('drawing');
    };
  }, []);

  const handleJoinRoom = (group) => {
    setSelectedGroup(group);
    socket.emit('join_room', group._id);
    setChatMessages([]);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedGroup) return;

    const messageData = {
      roomId: selectedGroup._id,
      sender: userName,
      message: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socket.emit('send_message', messageData);
    setMessage('');
  };

  // Whiteboard drawing handlers
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.lastX = e.clientX - rect.left;
    canvas.lastY = e.clientY - rect.top;
  };

  const draw = (e) => {
    if (!isDrawing || !selectedGroup) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.lastX, canvas.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();

    // Emit drawing data to socket server
    socket.emit('drawing', {
      roomId: selectedGroup._id,
      x0: canvas.lastX,
      y0: canvas.lastY,
      x1: x,
      y1: y,
      color: '#0284c7'
    });

    canvas.lastX = x;
    canvas.lastY = y;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    // RESPONSIVE WRAPPER: Mobile var column, Laptop var row
    <div className="dashboard-container flex flex-col lg:flex-row min-h-screen w-full bg-slate-50 font-sans">
      
      {/* Sidebar with Clickable Tabs */}
      <aside className="sidebar w-full lg:w-64 bg-slate-900 text-white p-4 flex flex-col justify-between shrink-0 shadow-md">
        <div>
          <h3 className="text-lg font-bold mb-6 flex items-center space-x-2"><span>🎓</span> <span>StudySync</span></h3>
          <ul className="sidebar-menu space-y-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <li 
              className={`cursor-pointer px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'}`} 
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </li>
            <li 
              className={`cursor-pointer px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'notes' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'}`} 
              onClick={() => setActiveTab('notes')}
            >
              📝 My Notes
            </li>
            <li 
              className={`cursor-pointer px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'planner' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'}`} 
              onClick={() => setActiveTab('planner')}
            >
              📅 Study Planner
            </li>
            <li 
              className={`cursor-pointer px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'groups' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800'}`} 
              onClick={() => setActiveTab('groups')}
            >
             👥 Study Groups
            </li>
          </ul>
        </div>
      </aside>
      {/* Main Content Area */}
      <main className="dashboard-content flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <header className="dash-header mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome Back, {userName}! 👋</h2>
          <p className="text-xs sm:text-sm text-slate-500">Manage your progress and study activities here.</p>
        </header>

        {/* TAB 1: OVERVIEW & PLANNER */}
        {(activeTab === 'overview' || activeTab === 'planner') && (
          <>
            {/* RESPONSIVE STATS GRID: Mobile var 1 column, Tablet/Laptop var 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="stat-card bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-500">Total Tasks</h4>
                <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">{tasks.length}</p>
              </div>
              <div className="stat-card bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-500">Completed</h4>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{tasks.filter((t) => t.completed).length}</p>
              </div>
              <div className="stat-card bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm sm:col-span-2 lg:col-span-1">
                <h4 className="text-xs sm:text-sm font-semibold text-slate-500">Study Hours</h4>
                <p className="text-xl sm:text-2xl font-bold text-indigo-600 mt-1">12 hrs</p>
              </div>
            </div>

            <section className="planner-section bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4">📅 Daily Study Planner</h3>
              <form onSubmit={addTask} className="task-form flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Add a new study task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="btn-primary w-full sm:w-auto px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm">Add Task</button>
              </form>

              <ul className="task-list space-y-2">
                {tasks.map((task) => (
                  <li key={task.id} className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs sm:text-sm ${task.completed ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 line-through' : 'bg-slate-50 border-slate-200 text-slate-700'}`} onClick={() => toggleTask(task.id)}>
                    <span>{task.completed ? '✅' : '⏳'} {task.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {/* TAB 2: MY NOTES */}
        {activeTab === 'notes' && (
          <section className="planner-section bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">📝 My Study Notes</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-3">Here you can write and save your subject notes.</p>
            <textarea 
              rows="8" 
              className="w-full p-4 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              placeholder="Type your notes here..."
            />
          </section>
        )}

        {/* TAB 3: STUDY GROUPS & REAL-TIME ROOM */}
        {activeTab === 'groups' && (
         <section className="planner-section bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">👥 Study Groups & Real-Time Rooms</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">Create or join groups, share resources, chat live, draw on the whiteboard, and play quizzes.</p>
            
            {/* Forms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Create Group Form */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm sm:text-base text-slate-800 mb-3">Create New Group</h4>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const name = e.target.groupName.value;
                  const description = e.target.groupDesc.value;
                  
                  try {
                    const res = await axios.post('http://localhost:5001/api/groups/create', { name, description, userId });
                    alert(`Group Created Successfully! Invite Code: ${res.data.group.inviteCode}`);
                    e.target.reset();
                    fetchGroups(); 
                  } catch (err) {
                    console.error('Full Error:', err.response ? err.response.data : err.message);
                    alert('Error creating group: ' + (err.response?.data?.message || err.message));
                  }
                }} className="space-y-3">
                  <input type="text" name="groupName" placeholder="Group Name (e.g. Calculus 101)" required className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white" />
                  <input type="text" name="groupDesc" placeholder="Group Description" required className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white" />
                  <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm">Create Group</button>
                </form>
              </div>

              {/* Join Group Form */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-sm sm:text-base text-slate-800 mb-3">Join Existing Group</h4>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const inviteCode = e.target.inviteCode.value;
                  
                  try {
                    const res = await axios.post('http://localhost:5001/api/groups/join', { inviteCode, userId });
                    alert(res.data.message || 'Joined Group Successfully!');
                    e.target.reset();
                    fetchGroups(); 
                  } catch (err) {
                    console.error('Full Error:', err.response ? err.response.data : err.message);
                    alert('Error joining group: ' + (err.response?.data?.message || err.message));
                  }
                }} className="space-y-3">
                  <input type="text" name="inviteCode" placeholder="Enter Invite Code (e.g. a1b2c3d4)" required className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white" />
                  <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm">Join Group</button>
                </form>
              </div>
            </div>

            {/* Group List & Virtual Study Room */}
            <div>
              <h4 className="font-bold text-sm sm:text-base text-slate-800 mb-4">My Study Groups</h4>
              {myGroups.length === 0 ? (
                <p className="text-xs sm:text-sm text-slate-500 italic">No groups found. Create or join one above!</p>
              ) : (
                <div className="space-y-4">
                  {myGroups.map((group) => (
                    <div key={group._id} className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <h5 className="text-base sm:text-lg font-bold text-slate-800 mb-1">{group.name}</h5>
                          <p className="text-xs sm:text-sm text-slate-500 mb-2">{group.description}</p>
                          <span className="text-[11px] sm:text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md inline-block">
                            Invite Code: <code className="font-semibold text-indigo-600">{group.inviteCode}</code>
                          </span>
                        </div>
                        <button 
                          onClick={() => handleJoinRoom(group)}
                          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all ${selectedGroup?._id === group._id ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                          {selectedGroup?._id === group._id ? '🟢 Room Active' : '🚀 Enter Study Room'}
                        </button>
                      </div>

                      {/* VIRTUAL STUDY ROOM (LIVE CHAT, WHITEBOARD & QUIZ) */}
                      {selectedGroup?._id === group._id && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-slate-200 gap-3">
                            <h6 className="font-bold text-xs sm:text-sm text-slate-800 m-0">Virtual Room: {selectedGroup.name}</h6>
                            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                              <button 
                                onClick={() => setActiveFeature('chat')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFeature === 'chat' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                              >
                                💬 Chat
                              </button>
                              <button 
                                onClick={() => setActiveFeature('whiteboard')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFeature === 'whiteboard' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                              >
                                🎨 Whiteboard
                              </button>
                              <button 
                                onClick={() => setActiveFeature('quiz')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFeature === 'quiz' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                              >
                                🧠 Quiz
                              </button>
                              <button 
                                onClick={() => setActiveFeature('tasks')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFeature === 'tasks' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                              >
                                📋 Tasks
                              </button>
                              <button 
                                onClick={() => setActiveFeature('resources')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFeature === 'resources' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                              >
                                📁 Resources
                              </button>
                              <button 
                                onClick={() => setActiveFeature('tutors')}
                                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFeature === 'tutors' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                              >
                                🎓 Tutors
                              </button>
                            </div>
                          </div>

                          {/* CHAT VIEW */}
                          {activeFeature === 'chat' && (
                            <div>
                              <div className="h-48 overflow-y-auto bg-white p-3 rounded-xl border border-slate-200 mb-3 flex flex-col gap-2 shadow-inner">
                                {chatMessages.length === 0 ? (
                                  <p className="text-slate-400 text-xs text-center my-auto">No messages yet. Start conversation below!</p>
                                ) : (
                                  chatMessages.map((msg, idx) => (
                                    <div key={idx} className="bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100">
                                      <strong className="text-indigo-600">{msg.sender}: </strong> {msg.message}
                                      <span className="text-[10px] text-slate-400 float-right mt-0.5">{msg.time}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                              <form onSubmit={sendMessage} className="flex gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Type a message..." 
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                />
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm">Send</button>
                              </form>
                            </div>
                          )}

                          {/* WHITEBOARD VIEW */}
                          {activeFeature === 'whiteboard' && (
                            <div className="text-center overflow-x-auto">
                              <p className="text-xs text-slate-500 mb-2">Draw below. Drawings will sync in real-time across all group members!</p>
                              <canvas
                                ref={canvasRef}
                                width={500}
                                height={250}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                className="bg-white border border-slate-300 rounded-xl cursor-crosshair mx-auto shadow-sm max-w-full"
                              />
                            </div>
                          )}

                          {/* QUIZ & LEADERBOARD VIEW */}
                          {activeFeature === 'quiz' && (
                            <QuizRoom groupId={selectedGroup._id} userId={userId} userName={userName} />
                          )}

                          {activeFeature === 'tasks' && selectedGroup && (
                            <TaskBoard groupId={selectedGroup._id} />
                          )}

                          {activeFeature === 'resources' && selectedGroup && (
                            <ResourceHub groupId={selectedGroup._id} userName={userName} />
                          )}

                          {activeFeature === 'tutors' && (
                            <TutorMarketplace userName={userName} />
                          )}

                          {/* CHAT VIEW */}
                          {activeFeature === 'chat' && (
                            <ChatRoom groupId={selectedGroup._id} userId={userId} userName={userName} />
                          )}

                        </div>
                      )}
                         
                      {/* Shared Resources List */}
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <h6 className="font-semibold text-xs sm:text-sm text-slate-700 mb-2">Shared Resources & Notes:</h6>
                        {group.resources && group.resources.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1 mb-3 text-xs sm:text-sm text-slate-600">
                            {group.resources.map((resItem, idx) => (
                              <li key={idx}>
                                <strong className="text-slate-800">{resItem.title}</strong>: {resItem.content}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 italic mb-3">No resources shared yet.</p>
                        )}

                        {/* Add Resource Form */}
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const title = e.target.resTitle.value;
                          const content = e.target.resContent.value;

                          try {
                            await axios.post(`http://localhost:5001/api/groups/${group._id}/resources`, { title, content, userId });
                            alert('Resource added successfully!');
                            e.target.reset();
                            fetchGroups();
                          } catch (err) {
                            console.error(err);
                            alert('Error adding resource');
                          }
                        }} className="flex flex-col sm:flex-row gap-2">
                          <input type="text" name="resTitle" placeholder="Resource Title" required className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
                          <input type="text" name="resContent" placeholder="Content / Link" required className="flex-2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs" />
                          <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm">Add Resource</button>
                        </form>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;