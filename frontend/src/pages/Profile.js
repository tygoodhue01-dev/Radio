import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfileApi, getMyPointsApi } from '../services/api';
import { User, Save, LogOut, Star, Gift } from 'lucide-react';

export default function Profile() {
  const { user, logout, refresh, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [points, setPoints] = useState({ points: 0, lifetime_points: 0 });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    setName(user.name || '');
    setBio(user.bio || '');
    getMyPointsApi().then(setPoints);
  }, [user, authLoading, navigate]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await updateProfileApi({ name, bio });
      await refresh();
      setMsg('Profile updated!');
    } catch { setMsg('Failed to save'); }
    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" data-testid="profile-page">
      <h1 className="font-display text-3xl font-extrabold mb-8 flex items-center gap-3">
        <User size={28} className="text-beat-pink" /> Profile
      </h1>

      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-beat-pink to-purple-600 flex items-center justify-center text-2xl font-display font-bold">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-display font-bold text-xl">{user.name}</p>
            <p className="text-sm text-zinc-400">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-beat-cyan/10 text-beat-cyan">{user.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/[0.03] rounded-lg p-4 text-center">
            <Star size={16} className="mx-auto text-beat-yellow mb-1" />
            <p className="font-display font-bold text-2xl text-beat-yellow">{points.points}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-mono">Points</p>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-4 text-center">
            <Gift size={16} className="mx-auto text-beat-cyan mb-1" />
            <p className="font-display font-bold text-2xl text-beat-cyan">{points.lifetime_points}</p>
            <p className="text-[10px] text-zinc-500 uppercase font-mono">Lifetime</p>
          </div>
        </div>

        <form onSubmit={save} className="space-y-4" data-testid="profile-form">
          <div>
            <label className="text-xs text-zinc-500 uppercase font-mono mb-1 block">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-beat-pink focus:outline-none transition-colors"
              data-testid="profile-name-input" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 uppercase font-mono mb-1 block">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-beat-pink focus:outline-none resize-none transition-colors"
              data-testid="profile-bio-input" />
          </div>
          {msg && <p className={`text-xs ${msg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>{msg}</p>}
          <button type="submit" disabled={saving} data-testid="profile-save-btn"
            className="w-full py-3 rounded-lg bg-beat-pink text-white font-semibold text-sm hover:bg-beat-pinkLight transition-all flex items-center justify-center gap-2">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <button onClick={handleLogout} data-testid="profile-logout-btn"
        className="w-full py-3 rounded-lg bg-red-500/10 text-red-400 font-semibold text-sm hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center justify-center gap-2">
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}
