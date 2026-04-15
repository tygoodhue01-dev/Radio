import React, { useState, useEffect } from 'react';
import { getRecentlyPlayedApi } from '../services/api';
import { Clock, Music } from 'lucide-react';

export default function RecentlyPlayed() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentlyPlayedApi(50).then(d => { setSongs(d); setLoading(false); });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" data-testid="recently-played-page">
      <h1 className="font-display text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Clock size={28} className="text-beat-cyan" /> Recently Played
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Songs recently aired on The Beat 515</p>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading...</div>
      ) : songs.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <Music size={48} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-500">No recently played songs available yet.</p>
        </div>
      ) : (
        <div className="space-y-2" data-testid="recently-played-list">
          {songs.map((s, i) => (
            <div key={i} className="glass rounded-xl px-5 py-3 flex items-center gap-4 glass-hover transition-all" data-testid={`song-item-${i}`}>
              <div className="w-10 h-10 rounded-lg bg-beat-pink/10 flex items-center justify-center flex-shrink-0">
                <Music size={16} className="text-beat-pink" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{s.song_title}</p>
                <p className="text-xs text-zinc-400">{s.artist}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-zinc-600 font-mono">
                  {s.played_at ? new Date(s.played_at).toLocaleTimeString() : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
