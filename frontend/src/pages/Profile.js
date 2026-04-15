import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { updateProfileApi, getMyPointsApi, getMyFavoritesApi, getMyStatsApi } from '../services/api';
import WebNavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Shield, Mic2, Headphones, Edit3, Save, X, Music, Gift, Calendar, Star, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout, refresh, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    setName(user.name || '');
    setBio(user.bio || '');
    Promise.all([
      getMyFavoritesApi().catch(() => []),
      getMyStatsApi().catch(() => ({})),
      getMyPointsApi().catch(() => ({ points: 0 }))
    ]).then(([f, s, p]) => {
      setFavorites(f);
      setStats({ ...s, points: p.points || 0 });
      setLoading(false);
    });
  }, [user, authLoading]);

  const save = async () => {
    try {
      await updateProfileApi({ name, bio });
      await refresh();
      setEditing(false);
      alert('Profile updated!');
    } catch (e) { alert(e.message); }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'ADMIN', color: '#FFF000', icon: Shield },
      dj: { label: 'DJ', color: '#FF007F', icon: Mic2 },
      editor: { label: 'EDITOR', color: '#00F0FF', icon: Edit3 },
      listener: { label: 'LISTENER', color: '#71717a', icon: Headphones }
    };
    return badges[role] || badges.listener;
  };

  if (!user && !authLoading) {
    return (
      <div data-testid="profile-page">
        <WebNavBar />
        <div className="flex flex-col items-center justify-center py-20 px-8">
          <User size={48} className="text-[#71717a] mb-4" />
          <h2 className="text-xl font-extrabold text-white">Not Signed In</h2>
          <p className="text-sm text-[#a1a1aa] text-center mt-2 max-w-[280px]">Sign in to access your profile, favorites, and more</p>
          <Link to="/login" className="flex items-center gap-2 bg-[#FF007F] rounded-full px-8 py-3.5 text-sm font-extrabold text-white tracking-[1px] mt-6">
            <User size={16} /> SIGN IN
          </Link>
          <Link to="/register" className="text-[#00F0FF] font-semibold text-sm mt-4">Create an Account</Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;
  const badge = getRoleBadge(user.role);
  const BadgeIcon = badge.icon;

  return (
    <div data-testid="profile-page">
      <WebNavBar />
      <div className="max-w-[600px] mx-auto px-8 pt-8">
        {/* Header Card */}
        <div className="bg-[#18181b] rounded-xl p-6 border border-[rgba(255,255,255,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-r from-[#FF007F]/20 to-[#00F0FF]/10" />

          <div className="relative flex items-center gap-4">
            <div className="w-[72px] h-[72px] rounded-full bg-[#27272a] flex items-center justify-center border-[3px]" style={{ borderColor: badge.color }}>
              <span className="text-[28px] font-black text-white">{user.name?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              {editing ? (
                <input value={name} onChange={e => setName(e.target.value)} data-testid="profile-name-input"
                  className="text-xl font-extrabold text-white bg-transparent border-b-2 border-[#FF007F] py-1 w-full focus:outline-none" />
              ) : (
                <h2 className="text-xl font-extrabold text-white">{user.name}</h2>
              )}
              <p className="text-sm text-[#a1a1aa] mt-0.5">{user.email}</p>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border mt-2" style={{ borderColor: badge.color + '40' }}>
                <BadgeIcon size={12} style={{ color: badge.color }} />
                <span className="text-xs font-extrabold tracking-[1px]" style={{ color: badge.color }}>{badge.label}</span>
              </div>
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="w-10 h-10 rounded-full bg-[rgba(255,0,127,0.2)] flex items-center justify-center" data-testid="profile-edit-btn">
                <Edit3 size={16} className="text-[#FF007F]" />
              </button>
            )}
          </div>

          {editing ? (
            <div className="relative mt-4">
              <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Write a bio..." rows={3} data-testid="profile-bio-input"
                className="w-full bg-transparent border border-[rgba(255,255,255,0.1)] rounded-lg p-4 text-sm text-white resize-none focus:border-[#FF007F] focus:outline-none" />
              <div className="flex gap-3 mt-3 justify-end">
                <button onClick={() => { setEditing(false); setName(user.name || ''); setBio(user.bio || ''); }}
                  className="px-5 py-2.5 rounded-full bg-[#27272a] text-sm font-semibold text-[#a1a1aa]">Cancel</button>
                <button onClick={save} data-testid="profile-save-btn"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF007F] text-sm font-bold text-white">
                  <Save size={14} /> Save
                </button>
              </div>
            </div>
          ) : user.bio ? (
            <p className="relative text-sm text-[#a1a1aa] mt-4 leading-[22px]">{user.bio}</p>
          ) : null}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between bg-[#18181b] rounded-lg p-4 mt-4 border border-[rgba(255,255,255,0.1)]">
          {[
            { val: favorites.length || stats.favorites || 0, label: 'Favorites', icon: Star },
            { val: stats.requests_made || 0, label: 'Requests', icon: Music },
            { val: stats.songs_rated || 0, label: 'Rated', icon: Star },
            { val: stats.points || 0, label: 'Points', icon: Gift },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div className="w-px h-10 bg-[rgba(255,255,255,0.1)]" />}
              <div className="flex-1 text-center">
                <s.icon size={14} className="mx-auto text-[#FF007F]" />
                <p className="text-lg font-extrabold text-white mt-1">{s.val}</p>
                <p className="text-xs text-[#71717a] mt-0.5">{s.label}</p>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-[#a1a1aa] tracking-[2px]">MY FAVORITES</span>
              <span className="text-xs font-bold text-[#71717a]">{favorites.length}</span>
            </div>
            {favorites.slice(0, 5).map((f, i) => (
              <div key={i} className="flex items-center bg-[#18181b] rounded-lg p-4 mb-2 border border-[rgba(255,255,255,0.1)]">
                <div className="w-7 h-7 rounded-full bg-[rgba(255,0,127,0.2)] flex items-center justify-center mr-3">
                  <span className="text-xs font-extrabold text-[#FF007F]">{i + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{f.song_title}</p>
                  <p className="text-xs text-[#a1a1aa] mt-0.5">{f.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6">
          <span className="text-xs font-extrabold text-[#a1a1aa] tracking-[2px] mb-3 block">QUICK ACTIONS</span>

          {(user.role === 'admin' || user.role === 'dj' || user.role === 'editor') && (
            <Link to="/admin" className="flex items-center bg-[#18181b] rounded-lg p-4 mb-2 border border-[rgba(255,255,255,0.1)]">
              <div className="w-11 h-11 rounded-xl bg-[rgba(255,0,127,0.1)] flex items-center justify-center mr-3">
                <Shield size={18} className="text-[#FF007F]" />
              </div>
              <div><p className="text-sm font-bold text-white">Dashboard</p><p className="text-xs text-[#a1a1aa] mt-0.5">Manage station content</p></div>
            </Link>
          )}

          {[
            { to: '/requests', icon: Music, color: '#00F0FF', title: 'Request a Song', sub: 'Get your favorite songs on air' },
            { to: '/rewards', icon: Gift, color: '#FFF000', title: 'Rewards', sub: 'Redeem points for prizes' },
            { to: '/schedule', icon: Calendar, color: '#FF007F', title: 'Show Schedule', sub: "See what's coming up" },
          ].map(a => (
            <Link key={a.to} to={a.to} className="flex items-center bg-[#18181b] rounded-lg p-4 mb-2 border border-[rgba(255,255,255,0.1)]">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mr-3" style={{ backgroundColor: a.color + '15' }}>
                <a.icon size={18} style={{ color: a.color }} />
              </div>
              <div><p className="text-sm font-bold text-white">{a.title}</p><p className="text-xs text-[#a1a1aa] mt-0.5">{a.sub}</p></div>
            </Link>
          ))}
        </div>

        {/* Sign Out */}
        <button onClick={handleLogout} data-testid="profile-logout-btn"
          className="w-full flex items-center justify-center gap-2 mt-8 mb-8 py-4 rounded-lg border border-[rgba(239,68,68,0.4)] text-red-400 font-semibold hover:bg-red-500/10 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
      <Footer />
    </div>
  );
}
