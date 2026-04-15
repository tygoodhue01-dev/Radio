import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'lucide-react';

export default function WebNavBar() {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', label: 'HOME' },
    { to: '/news', label: 'NEWS' },
    { to: '/requests', label: 'REQUEST LINE' },
    { to: '/schedule', label: 'SCHEDULE' },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-[rgba(9,9,11,0.95)] border-b border-[rgba(255,0,127,0.15)]" data-testid="main-navbar">
      <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between px-8 py-3">
        <Link to="/" className="flex items-center" data-testid="nav-logo">
          <span className="text-[22px] font-black text-[#FF007F] tracking-[2px] font-display">THE BEAT </span>
          <span className="text-[22px] font-black text-white tracking-[2px] font-display">515</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.to} to={l.to} data-testid={`nav-${l.label.toLowerCase().replace(/\s/g, '-')}`}
              className={`text-xs font-bold tracking-[2px] py-1 transition-colors
                ${location.pathname === l.to ? 'text-white' : 'text-[#a1a1aa] hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center">
          {!user ? (
            <Link to="/login" data-testid="nav-login"
              className="flex items-center gap-1.5 bg-[#FF007F] rounded-full px-5 py-2.5 text-xs font-extrabold text-white tracking-[1px] hover:opacity-90 transition-opacity">
              <User size={14} /> SIGN IN
            </Link>
          ) : (
            <Link to="/profile" data-testid="nav-profile" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FF007F] flex items-center justify-center">
                <span className="text-white font-extrabold text-sm">{user.name?.charAt(0)}</span>
              </div>
              <span className="text-white font-semibold text-sm hidden sm:inline">{user.name}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
