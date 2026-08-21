import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api';

export default function TutorMarketplace({ userName }) {
  const [tutors, setTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [slotTime, setSlotTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tutors`);
      setTutors(res.data);
    } catch (err) {
      console.error('Error fetching tutors:', err);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedTutor || !slotTime.trim()) return;

    try {
      const res = await axios.post(`${API_URL}/api/tutors/book`, {
        tutorId: selectedTutor._id,
        studentName: userName || 'Student',
        slotTime
      });
      setMessage(res.data.message);
      setSlotTime('');
      setSelectedTutor(null);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Booking failed!');
    }
  };

  return (
    // Main container la responsive padding ani width dili ahe
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col h-[550px] w-full max-w-5xl mx-auto overflow-hidden font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-indigo-800/50 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-lg sm:text-xl">🎓</span>
          <h3 className="font-bold text-sm sm:text-base tracking-wide">Tutor Marketplace & Booking</h3>
        </div>
        <span className="text-[10px] sm:text-xs bg-indigo-900/80 border border-indigo-700/50 text-indigo-200 px-2.5 sm:px-3 py-1 rounded-full font-semibold shadow-inner">
          1-on-1 Sessions
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-slate-100/50">
        
        {message && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs rounded-xl text-center font-semibold">
            {message}
          </div>
        )}

        {tutors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <span className="text-3xl mb-1">👩‍🏫</span>
            <p className="text-sm font-medium text-slate-500">No tutors available right now.</p>
            <p className="text-xs text-slate-400">Please check back later for verified experts!</p>
          </div>
        ) : (
          // RESPONSIVE GRID: Mobile var 1 column (grid-cols-1), Tablet/Laptop var 2 columns (sm:grid-cols-2)
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {tutors.map((tutor) => (
              <div key={tutor._id} className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm text-slate-800">{tutor.name}</h4>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      ${tutor.hourlyRate}/hr
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 mb-1">{tutor.subject}</p>
                  <p className="text-xs text-slate-500 mb-3">{tutor.bio}</p>
                </div>

                <button 
                  onClick={() => setSelectedTutor(tutor)}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm"
                >
                  Book Slot
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal Popup (Mobile var width set keli ahe jene karun baher janar nahi) */}
        {selectedTutor && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-5 sm:p-6 w-11/12 max-w-md shadow-xl border border-slate-100 space-y-4">
              <h3 className="font-bold text-sm sm:text-base text-slate-800">Book Session with {selectedTutor.name}</h3>
              <p className="text-xs text-slate-500">Subject: <span className="font-semibold text-indigo-600">{selectedTutor.subject}</span></p>

              <form onSubmit={handleBooking} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Select Date & Time Slot:</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 2026-06-15 04:00 PM" 
                    value={slotTime} 
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setSelectedTutor(null)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all shadow-md"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}