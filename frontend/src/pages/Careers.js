import React, { useState } from 'react';
import { submitJobApplicationApi } from '../services/api';
import { Briefcase, Send, CheckCircle } from 'lucide-react';

const positions = ['DJ / On-Air Talent', 'News Editor', 'Social Media Manager', 'Event Coordinator', 'Sales Representative', 'Other'];

export default function Careers() {
  const [form, setForm] = useState({ position: '', name: '', email: '', phone: '', cover_letter: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      await submitJobApplicationApi(form);
      setSubmitted(true);
    } catch (err) { setError(err.message); }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center" data-testid="careers-success">
        <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
        <h2 className="font-display text-2xl font-bold mb-2">Application Submitted!</h2>
        <p className="text-zinc-500">Thank you for your interest in joining The Beat 515. We'll review your application and get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8" data-testid="careers-page">
      <h1 className="font-display text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Briefcase size={28} className="text-beat-pink" /> Careers
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Join the team at The Beat 515</p>

      <div className="glass rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="careers-form">
          <select value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none"
            data-testid="careers-position-select">
            <option value="" className="bg-zinc-900">Select Position *</option>
            {positions.map(p => <option key={p} value={p} className="bg-zinc-900">{p}</option>)}
          </select>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Name *" required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-beat-pink focus:outline-none"
            data-testid="careers-name-input" />
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email *" required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-beat-pink focus:outline-none"
            data-testid="careers-email-input" />
          <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone *" required
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-beat-pink focus:outline-none"
            data-testid="careers-phone-input" />
          <textarea value={form.cover_letter} onChange={e => setForm(p => ({ ...p, cover_letter: e.target.value }))} placeholder="Cover Letter *" required rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-600 focus:border-beat-pink focus:outline-none resize-none"
            data-testid="careers-cover-letter-input" />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" data-testid="careers-submit-btn"
            className="w-full py-3 rounded-lg bg-beat-pink text-white font-semibold text-sm hover:bg-beat-pinkLight transition-all flex items-center justify-center gap-2">
            <Send size={16} /> Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
