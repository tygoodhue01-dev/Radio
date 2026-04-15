import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminStatsApi, getAdminUsersApi, getAdminRequestsApi, updateUserApi, deleteUserApi, updateRequestStatusApi, deleteRequestApi, createNewsApi } from '../services/api';
import { Shield, Users, Newspaper, Music, Trash2, Check, X, Plus, BarChart3, UserCog } from 'lucide-react';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [newsForm, setNewsForm] = useState({ title: '', content: '', summary: '', category: 'general', image_url: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user || !['admin', 'dj', 'editor'].includes(user.role)) { navigate('/'); return; }
    loadData();
  }, [user, navigate]);

  const loadData = () => {
    if (user?.role === 'admin') {
      getAdminStatsApi().then(setStats);
      getAdminUsersApi().then(setUsers);
    }
    getAdminRequestsApi().then(setRequests);
  };

  const handleRequestStatus = async (id, status) => {
    await updateRequestStatusApi(id, status);
    getAdminRequestsApi().then(setRequests);
  };

  const handleDeleteRequest = async (id) => {
    await deleteRequestApi(id);
    getAdminRequestsApi().then(setRequests);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await deleteUserApi(id);
    getAdminUsersApi().then(setUsers);
  };

  const handleRoleChange = async (id, role) => {
    await updateUserApi(id, { role });
    getAdminUsersApi().then(setUsers);
  };

  const handleCreateNews = async (e) => {
    e.preventDefault(); setMsg('');
    try {
      await createNewsApi(newsForm);
      setMsg('Article created!');
      setNewsForm({ title: '', content: '', summary: '', category: 'general', image_url: '' });
    } catch (err) { setMsg(err.message); }
  };

  if (!user || !['admin', 'dj', 'editor'].includes(user.role)) return null;

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: BarChart3, roles: ['admin'] },
    { id: 'users', label: 'Users', icon: Users, roles: ['admin'] },
    { id: 'requests', label: 'Requests', icon: Music, roles: ['admin', 'dj'] },
    { id: 'news', label: 'Create News', icon: Newspaper, roles: ['admin', 'editor'] },
  ].filter(t => t.roles.includes(user.role));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="admin-page">
      <h1 className="font-display text-3xl font-extrabold mb-6 flex items-center gap-3">
        <Shield size={28} className="text-beat-cyan" /> Admin Panel
      </h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2" data-testid="admin-tabs">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} data-testid={`admin-tab-${t.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
              ${tab === t.id ? 'bg-beat-cyan text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === 'stats' && user.role === 'admin' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="admin-stats">
          {[
            { label: 'Total Users', value: stats.total_users, color: 'text-beat-cyan' },
            { label: 'Total News', value: stats.total_news, color: 'text-beat-pink' },
            { label: 'Total Requests', value: stats.total_requests, color: 'text-beat-yellow' },
            { label: 'Pending Requests', value: stats.pending_requests, color: 'text-orange-400' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-5 text-center" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
              <p className="text-xs text-zinc-500 uppercase font-mono">{s.label}</p>
              <p className={`font-display text-3xl font-extrabold mt-2 ${s.color}`}>{s.value ?? '...'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && user.role === 'admin' && (
        <div className="glass rounded-xl overflow-hidden" data-testid="admin-users">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-mono uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-mono uppercase">Email</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-mono uppercase">Role</th>
                  <th className="text-right px-4 py-3 text-xs text-zinc-500 font-mono uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.user_id} className="border-b border-white/5 hover:bg-white/[0.02]" data-testid={`user-row-${u.user_id}`}>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={e => handleRoleChange(u.user_id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none"
                        data-testid={`role-select-${u.user_id}`}>
                        {['admin', 'dj', 'editor', 'listener'].map(r => (
                          <option key={r} value={r} className="bg-zinc-900">{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.user_id !== user.user_id && (
                        <button onClick={() => handleDeleteUser(u.user_id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          data-testid={`delete-user-${u.user_id}`}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requests Management */}
      {tab === 'requests' && (
        <div className="glass rounded-xl p-6" data-testid="admin-requests">
          <h2 className="font-display font-bold text-lg mb-4">Song Requests</h2>
          {requests.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-8">No requests</p>
          ) : (
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r.request_id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                  data-testid={`admin-request-${r.request_id}`}>
                  <div>
                    <p className="font-semibold text-sm">{r.song_title} {r.artist && <span className="text-zinc-400 font-normal">by {r.artist}</span>}</p>
                    <p className="text-xs text-zinc-500">Requested by {r.user_name}</p>
                    <span className={`inline-block mt-1 text-[10px] font-mono px-1.5 py-0.5 rounded
                      ${r.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : r.status === 'approved' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => handleRequestStatus(r.request_id, 'approved')}
                          className="p-2 text-green-400 hover:bg-green-500/10 rounded transition-colors" data-testid={`approve-req-${r.request_id}`}>
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleRequestStatus(r.request_id, 'rejected')}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors" data-testid={`reject-req-${r.request_id}`}>
                          <X size={16} />
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDeleteRequest(r.request_id)}
                      className="p-2 text-zinc-500 hover:bg-white/5 rounded transition-colors" data-testid={`delete-req-${r.request_id}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create News */}
      {tab === 'news' && (
        <div className="glass rounded-xl p-6" data-testid="admin-create-news">
          <h2 className="font-display font-bold text-lg mb-4">Create News Article</h2>
          <form onSubmit={handleCreateNews} className="space-y-4">
            <input value={newsForm.title} onChange={e => setNewsForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-beat-pink focus:outline-none"
              data-testid="news-title-input" />
            <select value={newsForm.category} onChange={e => setNewsForm(p => ({ ...p, category: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none"
              data-testid="news-category-select">
              {['general', 'music', 'events', 'local', 'contests'].map(c => (
                <option key={c} value={c} className="bg-zinc-900">{c}</option>
              ))}
            </select>
            <input value={newsForm.summary} onChange={e => setNewsForm(p => ({ ...p, summary: e.target.value }))} placeholder="Summary"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-beat-pink focus:outline-none"
              data-testid="news-summary-input" />
            <textarea value={newsForm.content} onChange={e => setNewsForm(p => ({ ...p, content: e.target.value }))} placeholder="Full content..." required rows={6}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-beat-pink focus:outline-none resize-none"
              data-testid="news-content-input" />
            <input value={newsForm.image_url} onChange={e => setNewsForm(p => ({ ...p, image_url: e.target.value }))} placeholder="Image URL (optional)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-beat-pink focus:outline-none"
              data-testid="news-image-input" />
            {msg && <p className={`text-xs ${msg.includes('created') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
            <button type="submit" data-testid="news-create-btn"
              className="w-full py-3 rounded-lg bg-beat-pink text-white font-semibold text-sm hover:bg-beat-pinkLight transition-all flex items-center justify-center gap-2">
              <Plus size={16} /> Publish Article
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
