import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNewsDetailApi } from '../services/api';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export default function NewsDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getNewsDetailApi(id).then(setArticle).catch(() => setError('Article not found'));
  }, [id]);

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center">
      <p className="text-zinc-500">{error}</p>
      <Link to="/news" className="text-beat-pink text-sm mt-4 inline-block">Back to News</Link>
    </div>
  );
  if (!article) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-zinc-500">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" data-testid="news-detail-page">
      <Link to="/news" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-beat-pink mb-6 transition-colors" data-testid="news-back-btn">
        <ArrowLeft size={16} /> Back to News
      </Link>
      {article.image_url && (
        <img src={article.image_url} alt={article.title} className="w-full h-64 object-cover rounded-xl mb-6" />
      )}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-beat-cyan bg-beat-cyan/10 px-2 py-0.5 rounded">{article.category}</span>
        <span className="text-xs text-zinc-500 flex items-center gap-1"><Calendar size={12} />{new Date(article.created_at).toLocaleDateString()}</span>
        <span className="text-xs text-zinc-500 flex items-center gap-1"><User size={12} />{article.author_name}</span>
      </div>
      <h1 className="font-display text-3xl font-extrabold mb-6" data-testid="news-detail-title">{article.title}</h1>
      <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap" data-testid="news-detail-content">
        {article.content}
      </div>
    </div>
  );
}
