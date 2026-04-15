import React, { useState, useEffect } from 'react';
import { getLeaderboardApi } from '../services/api';
import { Trophy, Medal } from 'lucide-react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboardApi().then(d => { setLeaders(d); setLoading(false); });
  }, []);

  const colors = ['text-beat-yellow', 'text-zinc-300', 'text-orange-400'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" data-testid="leaderboard-page">
      <h1 className="font-display text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Trophy size={28} className="text-beat-yellow" /> Leaderboard
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Top listeners by lifetime points</p>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading...</div>
      ) : leaders.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <Trophy size={48} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-500">No one on the leaderboard yet. Start earning points!</p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="leaderboard-list">
          {leaders.map((l, i) => (
            <div key={l.user_id} className={`glass rounded-xl p-4 flex items-center gap-4 glass-hover transition-all
              ${i === 0 ? 'border border-beat-yellow/20' : ''}`}
              data-testid={`leaderboard-entry-${i}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-lg
                ${i < 3 ? 'bg-white/5' : 'bg-white/[0.02]'} ${colors[i] || 'text-zinc-500'}`}>
                {i < 3 ? <Medal size={20} /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{l.name}</p>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-beat-cyan/10 text-beat-cyan">{l.role}</span>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-beat-yellow">{l.lifetime_points?.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-600 font-mono">pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
