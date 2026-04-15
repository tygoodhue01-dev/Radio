import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNowPlayingApi, getNewsApi, getShowsApi, getEventsApi, getContestsApi } from '../services/api';
import { Radio, Newspaper, Music, Calendar, Trophy, ChevronRight, Zap, Mic2 } from 'lucide-react';

export default function Home() {
  const [np, setNp] = useState({ song_title: 'The Beat 515', artist: 'Live Radio' });
  const [news, setNews] = useState([]);
  const [shows, setShows] = useState([]);
  const [events, setEvents] = useState([]);
  const [contests, setContests] = useState([]);

  useEffect(() => {
    getNowPlayingApi().then(setNp);
    getNewsApi().then(d => setNews(d.slice(0, 4)));
    getShowsApi().then(setShows);
    getEventsApi().then(d => setEvents(d.slice(0, 3)));
    getContestsApi().then(d => setContests(d.slice(0, 2)));
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-beat-pink/20 via-transparent to-beat-cyan/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-beat-pink/8 rounded-full blur-[120px]" />
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-12 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="animate-float-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-beat-pink/10 border border-beat-pink/20 mb-6">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-mono text-beat-pink font-medium">LIVE NOW</span>
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-extrabold leading-[1.05] mb-4">
                THE BEAT<br /><span className="text-beat-pink">515</span>
              </h1>
              <p className="text-xl text-zinc-400 font-display font-medium mb-2">Proud. Loud. Local.</p>
              <p className="text-sm text-zinc-500 mb-8 max-w-md">Your favorite Top 40 radio station, streaming live from the heart of the 515.</p>
              <div className="flex flex-wrap gap-3">
                <Link to="/requests" data-testid="hero-request-btn"
                  className="px-6 py-3 rounded-xl bg-beat-pink text-white font-semibold text-sm hover:bg-beat-pinkLight transition-all glow-pink flex items-center gap-2">
                  <Music size={16} /> Request a Song
                </Link>
                <Link to="/news" data-testid="hero-news-btn"
                  className="px-6 py-3 rounded-xl bg-white/5 text-white font-semibold text-sm hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2">
                  <Newspaper size={16} /> Latest News
                </Link>
              </div>
            </div>

            <div className="animate-float-in" style={{ animationDelay: '0.15s' }}>
              <div className="glass rounded-2xl p-6 border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-beat-pink to-purple-600 flex items-center justify-center glow-pink">
                    <Radio size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Now Playing</p>
                    <p className="font-display font-bold text-lg" data-testid="hero-now-playing-title">{np.song_title}</p>
                    <p className="text-sm text-zinc-400">{np.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <Mic2 size={14} className="text-beat-cyan" />
                  <span className="text-xs text-zinc-500">DJ: {np.dj_name || 'AutoDJ'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shows */}
      {shows.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10" data-testid="shows-section">
          <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
            <Mic2 size={20} className="text-beat-cyan" /> Our Shows
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shows.map(s => (
              <div key={s.show_id} className="glass rounded-xl overflow-hidden glass-hover transition-all group" data-testid={`show-card-${s.show_id}`}>
                {s.image_url && (
                  <img src={s.image_url} alt={s.name} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                )}
                <div className="p-4">
                  <h3 className="font-display font-bold text-base">{s.name}</h3>
                  <p className="text-xs text-beat-cyan mt-1">{s.schedule}</p>
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* News */}
      <section className="max-w-6xl mx-auto px-4 py-10" data-testid="news-section">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl flex items-center gap-2">
            <Zap size={20} className="text-beat-yellow" /> Latest News
          </h2>
          <Link to="/news" className="text-sm text-beat-pink hover:text-beat-pinkLight flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {news.map(n => (
            <Link key={n.news_id} to={`/news/${n.news_id}`}
              className="glass rounded-xl overflow-hidden glass-hover transition-all group block" data-testid={`news-card-${n.news_id}`}>
              {n.image_url && (
                <img src={n.image_url} alt={n.title} className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              )}
              <div className="p-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-beat-cyan bg-beat-cyan/10 px-2 py-0.5 rounded">{n.category}</span>
                <h3 className="font-display font-bold text-base mt-2 group-hover:text-beat-pink transition-colors">{n.title}</h3>
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{n.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Events */}
      {events.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10" data-testid="events-section">
          <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-beat-pink" /> Upcoming Events
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(e => (
              <div key={e.event_id} className="glass rounded-xl p-5 glass-hover transition-all" data-testid={`event-card-${e.event_id}`}>
                <h3 className="font-display font-bold">{e.title}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs text-beat-cyan">
                  <Calendar size={12} />
                  <span>{e.date} {e.time && `at ${e.time}`}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">{e.venue}</p>
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{e.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contests */}
      {contests.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10" data-testid="contests-section">
          <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
            <Trophy size={20} className="text-beat-yellow" /> Active Contests
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {contests.map(c => (
              <div key={c.contest_id} className="glass rounded-xl p-5 border border-beat-yellow/10 glass-hover transition-all" data-testid={`contest-card-${c.contest_id}`}>
                <h3 className="font-display font-bold">{c.title}</h3>
                <p className="text-xs text-beat-yellow mt-1">Prize: {c.prize}</p>
                <p className="text-xs text-zinc-500 mt-2">{c.description}</p>
                <p className="text-xs text-zinc-600 mt-2">Ends: {c.end_date}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
