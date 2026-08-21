import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api';

export default function TaskBoard({ groupId }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

 // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (groupId) {
      fetchTasks();
    }
  }, [groupId]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tasks/${groupId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo.trim()) return;

    try {
      await axios.post(`${API_URL}/api/tasks`, {
        groupId,
        title,
        assignedTo
      });
      setTitle('');
      setAssignedTo('');
      fetchTasks();
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    try {
      await axios.patch(`${API_URL}/api/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col h-[550px] overflow-hidden font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-800/50 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📋</span>
          <h3 className="font-bold text-base tracking-wide">Task Management & Deliverables</h3>
        </div>
        <span className="text-xs bg-indigo-900/80 border border-indigo-700/50 text-indigo-200 px-3 py-1 rounded-full font-semibold shadow-inner">
          Track Progress
        </span>
      </div>

      {/* Task Add Form - Perfectly Aligned */}
      <form onSubmit={handleAddTask} className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          placeholder="New Task Title..." 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
        />
        <input 
          type="text" 
          placeholder="Assigned To..." 
          value={assignedTo} 
          onChange={(e) => setAssignedTo(e.target.value)}
          className="sm:w-48 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
        />
        <button 
          type="submit" 
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-1.5"
        >
          <span>Add Task</span>
        </button>
      </form>

      {/* Task List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/50 to-slate-100/50">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <span className="text-3xl mb-1">📝</span>
            <p className="text-sm font-medium text-slate-500">No tasks added yet.</p>
            <p className="text-xs text-slate-400">Create a task above to start tracking deliverables!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task._id} 
              className="flex justify-between items-center p-4 border border-slate-200/80 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-1">
                <p className={`font-semibold text-sm ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {task.title}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Assigned to:</span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {task.assignedTo}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => toggleStatus(task._id, task.status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                  task.status === 'Completed' 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200' 
                    : 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
                }`}
              >
                {task.status}
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
}