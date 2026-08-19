import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ChatRoom({ groupId, userId, userName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (groupId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [groupId]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/chats/${groupId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };
  

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post('http://localhost:5001/api/chats', {
        groupId,
        userId,
        userName: userName || 'Student',
        message: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col h-[550px] overflow-hidden font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-800/50 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-xl">💬</span>
          <h3 className="font-bold text-base tracking-wide">Group Chat Room</h3>
        </div>
        <span className="text-xs bg-indigo-900/80 border border-indigo-700/50 text-indigo-200 px-3 py-1 rounded-full font-semibold shadow-inner">
          Live Sync
        </span>
      </div>

      {/* Messages Box - Auto scroll kadhun takla aahe, athee manual scrolling rahatil */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/50 to-slate-100/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <span className="text-3xl mb-1">💭</span>
            <p className="text-sm font-medium text-slate-500">No messages yet.</p>
            <p className="text-xs text-slate-400">Send a message to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === userId;
            return (
              <div 
                key={msg._id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[11px] font-semibold text-slate-600 mb-1 px-1">
                    {msg.userName}
                  </span>
                )}
                <div 
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <p className="break-words">{msg.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Input & Send Button Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3">
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
        />
        <button 
          type="submit" 
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200 flex items-center justify-center"
        >
          Send
        </button>
      </form>

    </div>
  );
}