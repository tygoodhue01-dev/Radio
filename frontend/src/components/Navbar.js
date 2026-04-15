import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Radio, Newspaper, Music, Gift, User, Shield, Menu, X, Calendar, Trophy, Clock, Briefcase, Info, Phone } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isActive = (p) => location.pathname === p;

  const mainLinks = [
    { to: '/', icon: Radio, label: 'Home' },
    { to: '/news', icon: Newspaper, label: 'News' },
    { to: '/requests', icon: Music, label: 'Requests' },
    { to: '/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/rewards', icon: Gift, label: 'Rewards' },
  ];

  const moreLinks = [
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/recently-played', icon: Clock, label: 'Recently Played' },
    { to: '/about', icon: Info, label: 'About' },
    { to: '/careers', icon: Briefcase, label: 'Careers' },
    { to: '/contact', icon: Phone, label: 'Contact' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-white/5" data-testid="main-navbar">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
            <div className="w-9 h-9 rounded-lg bg-beat-pink flex items-center justify-center glow-pink transition-transform group-hover:scale-110">
              <Radio size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg leading-none tracking-tight">THE BEAT</span>
              <span className="font-display font-bold text-lg text-beat-pink ml-1">515</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {mainLinks.map(l => (
              <Link key={l.to} to={l.to} data-testid={`nav-${l.label.toLowerCase()}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                  ${isActive(l.to) ? 'bg-beat-pink/15 text-beat-pink' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                <l.icon size={15} />
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'dj' || user.role === 'editor') && (
                  <Link to="/admin" data-testid="nav-admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                      ${isActive('/admin') ? 'bg-beat-cyan/15 text-beat-cyan' : 'text-zinc-400 hover:text-beat-cyan'}`}>
                    <Shield size={15} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                <Link to="/profile" data-testid="nav-profile"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                    ${isActive('/profile') ? 'bg-beat-pink/15 text-beat-pink' : 'text-zinc-400 hover:text-white'}`}>
                  <User size={15} />
                  <span className="hidden sm:inline">{user.name?.split(' ')[0]}</span>
                </Link>
              </>
            ) : (
              <Link to="/login" data-testid="nav-login"
                className="px-4 py-2 rounded-lg bg-beat-pink text-white text-sm font-semibold hover:bg-beat-pinkLight transition-all">
                Sign In
              </Link>
            )}
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-zinc-400 hover:text-white" data-testid="nav-menu-toggle">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-white/5 bg-beat-bg/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {[...mainLinks, ...moreLinks].map(l => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive(l.to) ? 'bg-beat-pink/15 text-beat-pink' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
                  <l.icon size={16} />
                  {l.label}
                </Link>
              ))}
              {user && (
                <button onClick={() => { logout(); setOpen(false); }}
                  className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg" data-testid="nav-logout-mobile">
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
