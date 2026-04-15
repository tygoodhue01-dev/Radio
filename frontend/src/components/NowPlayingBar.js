import React, { useState, useEffect, useRef } from 'react';
import { getNowPlayingApi, getStreamConfigApi } from '../services/api';
import { Play, Pause, Radio, Volume2, VolumeX } from 'lucide-react';

export default function NowPlayingBar() {
  const [np, setNp] = useState({ song_title: 'The Beat 515', artist: 'Live Radio' });
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const [npData, config] = await Promise.all([getNowPlayingApi(), getStreamConfigApi()]);
      setNp(npData);
      setStreamUrl(config.stream_url || 'https://streaming.live365.com/a72818');
    };
    load();
    const interval = setInterval(async () => {
      const d = await getNowPlayingApi();
      setNp(d);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(streamUrl);
      audioRef.current.crossOrigin = 'anonymous';
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5" data-testid="now-playing-bar">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button onClick={toggle} data-testid="play-pause-btn"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0
            ${playing ? 'bg-beat-pink glow-pink' : 'bg-zinc-800 hover:bg-beat-pink'}`}>
          {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {playing && (
              <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse">
                LIVE
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" data-testid="now-playing-title">{np.song_title}</p>
              <p className="text-xs text-zinc-400 truncate" data-testid="now-playing-artist">{np.artist}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={toggleMute} className="p-2 text-zinc-400 hover:text-white transition-colors" data-testid="mute-btn">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-beat-pink/10 border border-beat-pink/20">
            <Radio size={12} className="text-beat-pink" />
            <span className="text-[10px] font-mono text-beat-pink font-medium">515 FM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
