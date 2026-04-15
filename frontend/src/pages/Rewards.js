import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getRewardsApi, getMyPointsApi, getMyHistoryApi, dailyCheckInApi, redeemRewardApi } from '../services/api';
import { Gift, Star, Zap, Check, Trophy, Clock } from 'lucide-react';

const icons = { megaphone: Zap, flash: Zap, star: Star, 'shield-checkmark': Check, ticket: Gift, people: Trophy };

export default function Rewards() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [points, setPoints] = useState({ points: 0, lifetime_points: 0 });
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getRewardsApi().then(setRewards);
    if (user) {
      getMyPointsApi().then(setPoints);
      getMyHistoryApi().then(setHistory);
    }
  }, [user]);

  const checkIn = async () => {
    setMsg(''); setError('');
    try {
      const d = await dailyCheckInApi();
      setMsg(d.message);
      getMyPointsApi().then(setPoints);
      getMyHistoryApi().then(setHistory);
    } catch (e) { setError(e.message); }
  };

  const redeem = async (id) => {
    setMsg(''); setError('');
    try {
      const d = await redeemRewardApi(id);
      setMsg(d.message);
      getMyPointsApi().then(setPoints);
      getMyHistoryApi().then(setHistory);
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="rewards-page">
      <h1 className="font-display text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Gift size={28} className="text-beat-yellow" /> Rewards
      </h1>
      <p className="text-zinc-500 text-sm mb-6">Earn points, unlock rewards, climb the leaderboard</p>

      {user ? (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="glass rounded-xl p-5 text-center" data-testid="points-display">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Current Points</p>
              <p className="font-display text-4xl font-extrabold text-beat-yellow mt-2">{points.points}</p>
            </div>
            <div className="glass rounded-xl p-5 text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Lifetime Points</p>
              <p className="font-display text-4xl font-extrabold text-beat-cyan mt-2">{points.lifetime_points}</p>
            </div>
            <div className="glass rounded-xl p-5 flex flex-col items-center justify-center">
              <button onClick={checkIn} data-testid="daily-checkin-btn"
                className="px-6 py-3 rounded-xl bg-beat-yellow text-black font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2">
                <Check size={16} /> Daily Check-In (+25)
              </button>
              {msg && <p className="text-green-400 text-xs mt-2 text-center">{msg}</p>}
              {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
            </div>
          </div>

          <h2 className="font-display font-bold text-xl mb-4">Rewards Catalog</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" data-testid="rewards-catalog">
            {rewards.map(r => {
              const Icon = icons[r.icon] || Gift;
              return (
                <div key={r.reward_id} className="glass rounded-xl p-5 glass-hover transition-all" data-testid={`reward-${r.reward_id}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-beat-yellow/10 flex items-center justify-center">
                      <Icon size={18} className="text-beat-yellow" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm">{r.name}</h3>
                      <p className="text-xs text-beat-yellow font-mono">{r.points_cost} pts</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mb-4">{r.description}</p>
                  <button onClick={() => redeem(r.reward_id)} disabled={points.points < r.points_cost}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-all
                      ${points.points >= r.points_cost
                        ? 'bg-beat-pink text-white hover:bg-beat-pinkLight'
                        : 'bg-white/5 text-zinc-600 cursor-not-allowed'}`}
                    data-testid={`redeem-btn-${r.reward_id}`}>
                    {points.points >= r.points_cost ? 'Redeem' : 'Not Enough Points'}
                  </button>
                </div>
              );
            })}
          </div>

          {history.length > 0 && (
            <>
              <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
                <Clock size={18} className="text-zinc-400" /> Recent Activity
              </h2>
              <div className="glass rounded-xl p-4 space-y-2" data-testid="points-history">
                {history.slice(0, 10).map(h => (
                  <div key={h.transaction_id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-sm">{h.description}</p>
                      <p className="text-[10px] text-zinc-600">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`font-mono font-bold text-sm ${h.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {h.points > 0 ? '+' : ''}{h.points}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="glass rounded-xl p-10 text-center">
          <Gift size={48} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-500 mb-4">Sign in to start earning points and redeeming rewards!</p>
          <Link to="/login" className="inline-block px-6 py-3 rounded-xl bg-beat-pink text-white font-semibold text-sm" data-testid="rewards-login-link">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
