import React, { useState, useEffect } from 'react';
import { getLeaderboardApi } from '../services/api';
import { Trophy, Star } from 'lucide-react';
import WebNavBar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getLeaderboardApi().then(d => { setLeaders(d); setLoading(false); }); }, []);

  return (
    <div data-testid="leaderboard-page">
      <WebNavBar />
      <div className="max-w-[600px] mx-auto px-8 py-8">
        <h1 className="text-[28px] font-black text-white tracking-[3px] font-display flex items-center gap-3">
          <Trophy size={28} className="text-[#FFF000]" /> LEADERBOARD
        </h1>
        <p className="text-sm text-[#a1a1aa] mt-1 mb-6">Top listeners by lifetime points</p>

        {loading ? (
          <div className="text-center py-16 text-[#71717a]">Loading...</div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-16 text-[#71717a]">No one on the leaderboard yet.</div>
        ) : (
          <div className="space-y-2" data-testid="leaderboard-list">
            {leaders.map((l, i) => (
              <div key={l.user_id} className="flex items-center bg-[#18181b] rounded-lg p-4 border border-[rgba(255,255,255,0.1)]" data-testid={`leaderboard-entry-${i}`}>
                <span className="text-lg font-black text-[#71717a] w-9">#{i + 1}</span>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-white">{l.name}</span>
                  <span className="text-[9px] text-[#71717a] tracking-[1px] ml-2">{l.role?.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-[#FFF000]" />
                  <span className="text-sm font-bold text-[#FFF000]">{l.lifetime_points}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
