import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ResourceHub({ groupId, userName }) {
  const [resources, setResources] = useState([]);
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (groupId) {
      fetchResources();
    }
  }, [groupId]);

  const fetchResources = async () => {
    try {
      const res = await axios.get(`http://localhost:5001/api/resources/${groupId}`);
      setResources(res.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;

    try {
      await axios.post('http://localhost:5001/api/resources', {
        groupId,
        title,
        fileUrl,
        uploadedBy: userName || 'Student'
      });
      setTitle('');
      setFileUrl('');
      fetchResources();
    } catch (err) {
      console.error('Error uploading resource:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col h-[550px] overflow-hidden font-sans">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-800/50 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📁</span>
          <h3 className="font-bold text-base tracking-wide">Resource Repository & File Drive</h3>
        </div>
        <span className="text-xs bg-indigo-900/80 border border-indigo-700/50 text-indigo-200 px-3 py-1 rounded-full font-semibold shadow-inner">
          Shared Drive
        </span>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
        <input 
          type="text" 
          placeholder="Resource Title (e.g., Calculus Notes.pdf)" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
        />
        <input 
          type="text" 
          placeholder="File URL (PDF/Image link)..." 
          value={fileUrl} 
          onChange={(e) => setFileUrl(e.target.value)}
          className="sm:w-64 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
        />
        <button 
          type="submit" 
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-md shadow-indigo-200 flex items-center justify-center"
        >
          Upload
        </button>
      </form>

      {/* Resource List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50/50 to-slate-100/50">
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <span className="text-3xl mb-1">📂</span>
            <p className="text-sm font-medium text-slate-500">No resources shared yet.</p>
            <p className="text-xs text-slate-400">Upload notes, PDFs, or images for your group members!</p>
          </div>
        ) : (
          resources.map((res) => (
            <div 
              key={res._id} 
              className="flex justify-between items-center p-4 border border-slate-200/80 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
            >
              <div className="space-y-1">
                <p className="font-semibold text-sm text-slate-800">{res.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Uploaded by:</span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {res.uploadedBy}
                  </span>
                </div>
              </div>

              <a 
                href={res.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Download / View</span>
              </a>
            </div>
          ))
        )}
      </div>

    </div>
  );
}