import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getRequestsApi, createRequestApi, getChatApi, sendChatApi } from '../services/api';
import { Music, Send, MessageCircle, ListMusic } from 'lucide-react';

export default function Requests() {
  const { user } = useAuth();
  const [tab, setTab] = useState('request');
  const [requests, setRequests] = useState([]);
  const [chat, setChat] = useState([]);
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [msg, setMsg] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    getRequestsApi().then(setRequests);
    getChatApi().then(setChat);
    const iv = setInterval(() => getChatApi().then(setChat), 10000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError(''); setSuccess('');
    try {
      await createRequestApi({ song_title: song, artist, message: msg });
      setSuccess('Request submitted!');
      setSong(''); setArtist(''); setMsg('');
      getRequestsApi().then(setRequests);
      getChatApi().then(setChat);
    } catch (err) { setError(err.message); }
  };

  const submitChat = async (e) => {
    e.preventDefault();
    if (!user || !chatMsg.trim()) return;
    try {
      await sendChatApi(chatMsg);
      setChatMsg('');
      getChatApi().then(setChat);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="requests-page">
      <h1 className="font-display text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Music size={28} className="text-beat-pink" /> Song Requests
      </h1>
      <p className="text-zinc-500 text-sm mb-6">Request songs and chat with other listeners</p>

      <div className="flex gap-2 mb-6" data-testid="request-tabs">
        <button onClick={() => setTab('request')} data-testid="tab-request"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
            ${tab === 'request' ? 'bg-beat-pink text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
          <ListMusic size={16} /> Request
        </button>
        <button onClick={() => setTab('chat')} data-testid="tab-chat"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
            ${tab === 'chat' ? 'bg-beat-pink text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
          <MessageCircle size={16} /> Live Chat
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Form or Chat Input */}
        <div>
          {tab === 'request' ? (
            <div className="glass rounded-xl p-6">
              <h2 className="font-display font-bold text-lg mb-4">Make a Request</h2>
              {!user ? (
                <p className="text-zinc-500 text-sm">Please <Link to="/login" className="text-beat-pink">sign in</Link> to make requests.</p>
              ) : (
                <form onSubmit={submitRequest} className="space-y-4" data-testid="request-form">
                  <input value={song} onChange={e => setSong(e.target.value)} placeholder="Song Title *" required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-beat-pink focus:outline-none transition-colors"
                    data-testid="request-song-input" />
                  <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-beat-pink focus:outline-none transition-colors"
                    data-testid="request-artist-input" />
                  <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Message (optional)" rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-beat-pink focus:outline-none resize-none transition-colors"
                    data-testid="request-message-input" />
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  {success && <p className="text-green-400 text-xs">{success}</p>}
                  <button type="submit" data-testid="request-submit-btn"
                    className="w-full py-3 rounded-lg bg-beat-pink text-white font-semibold text-sm hover:bg-beat-pinkLight transition-all flex items-center justify-center gap-2">
                    <Send size={16} /> Submit Request
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="glass rounded-xl p-6 flex flex-col h-[500px]">
              <h2 className="font-display font-bold text-lg mb-4">Live Chat</h2>
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2" data-testid="chat-messages">
                {chat.map(m => (
                  <div key={m.message_id} className={`flex flex-col ${m.type === 'request' ? 'items-start' : 'items-start'}`}>
                    <div className={`rounded-lg px-3 py-2 max-w-[85%] text-sm
                      ${m.type === 'request' ? 'bg-beat-pink/10 border border-beat-pink/20' : 'bg-white/5'}`}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-xs">{m.user_name}</span>
                        {m.user_role !== 'listener' && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-beat-cyan/10 text-beat-cyan">{m.user_role}</span>
                        )}
                      </div>
                      <p className="text-zinc-300">{m.message}</p>
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-0.5 px-1">{new Date(m.created_at).toLocaleTimeString()}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              {!user ? (
                <p className="text-zinc-500 text-sm text-center">Please <Link to="/login" className="text-beat-pink">sign in</Link> to chat.</p>
              ) : (
                <form onSubmit={submitChat} className="flex gap-2" data-testid="chat-form">
                  <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm placeholder:text-zinc-600 focus:border-beat-pink focus:outline-none transition-colors"
                    data-testid="chat-input" />
                  <button type="submit" data-testid="chat-send-btn"
                    className="px-4 py-2.5 rounded-lg bg-beat-pink text-white hover:bg-beat-pinkLight transition-all">
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right: Recent Requests */}
        <div className="glass rounded-xl p-6">
          <h2 className="font-display font-bold text-lg mb-4">Recent Requests</h2>
          {requests.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No requests yet. Be the first!</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2" data-testid="requests-list">
              {requests.map(r => (
                <div key={r.request_id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors" data-testid={`request-item-${r.request_id}`}>
                  <div className="w-8 h-8 rounded-lg bg-beat-pink/10 flex items-center justify-center flex-shrink-0">
                    <Music size={14} className="text-beat-pink" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{r.song_title}</p>
                    {r.artist && <p className="text-xs text-zinc-400">{r.artist}</p>}
                    <p className="text-[10px] text-zinc-600 mt-1">by {r.user_name} &middot; {new Date(r.created_at).toLocaleTimeString()}</p>
                    {r.message && <p className="text-xs text-zinc-500 mt-1 italic">"{r.message}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
