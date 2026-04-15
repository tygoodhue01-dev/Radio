import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNewsApi } from '../services/api';
import { Newspaper, Filter } from 'lucide-react';

const categories = ['', 'music', 'events', 'local', 'contests', 'general'];

export default function News() {
  const [news, setNews] = useState([]);
  const [cat, setCat] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNewsApi(cat || undefined).then(d => { setNews(d); setLoading(false); });
  }, [cat]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8" data-testid="news-page">
      <h1 className="font-display text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Newspaper size={28} className="text-beat-pink" /> News
      </h1>
      <p className="text-zinc-500 text-sm mb-6">Stay updated with the latest from The Beat 515</p>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2" data-testid="news-category-filter">
        <Filter size={14} className="text-zinc-500 flex-shrink-0" />
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)} data-testid={`news-filter-${c || 'all'}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all
              ${cat === c ? 'bg-beat-pink text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
            {c || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading...</div>
      ) : news.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">No articles found</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {news.map(n => (
            <Link key={n.news_id} to={`/news/${n.news_id}`}
              className="glass rounded-xl overflow-hidden glass-hover transition-all group block" data-testid={`news-item-${n.news_id}`}>
              {n.image_url && (
                <img src={n.image_url} alt={n.title} className="w-full h-44 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-beat-cyan bg-beat-cyan/10 px-2 py-0.5 rounded">{n.category}</span>
                  <span className="text-[10px] text-zinc-600">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-display font-bold text-lg group-hover:text-beat-pink transition-colors">{n.title}</h3>
                <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{n.summary}</p>
                <p className="text-xs text-zinc-600 mt-3">By {n.author_name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
