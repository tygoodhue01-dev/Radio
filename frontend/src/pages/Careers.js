import React, { useState } from 'react';
import { submitJobApplicationApi } from '../services/api';
import { Briefcase, Send, CheckCircle } from 'lucide-react';
import WebNavBar from '../components/Navbar';
import Footer from '../components/Footer';

const positions = ['DJ / On-Air Talent', 'News Editor', 'Social Media Manager', 'Event Coordinator', 'Sales Representative', 'Other'];

export default function Careers() {
  const [form, setForm] = useState({ position: '', name: '', email: '', phone: '', cover_letter: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try { await submitJobApplicationApi(form); setSubmitted(true); } catch (err) { setError(err.message); }
  };

  return (
    <div data-testid="careers-page">
      <WebNavBar />
      <div className="max-w-[600px] mx-auto px-8 py-8">
        {submitted ? (
          <div className="text-center py-16" data-testid="careers-success">
            <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
            <h2 className="text-2xl font-bold font-display mb-2">Application Submitted!</h2>
            <p className="text-[#71717a]">Thank you for your interest. We'll review your application and get back to you soon.</p>
          </div>
        ) : (
          <>
            <h1 className="text-[28px] font-black text-white tracking-[3px] font-display flex items-center gap-3">
              <Briefcase size={28} className="text-[#FF007F]" /> CAREERS
            </h1>
            <p className="text-sm text-[#a1a1aa] mt-1 mb-6">Join the team at The Beat 515</p>
            <div className="bg-[#18181b] rounded-xl p-6 border border-[rgba(255,255,255,0.1)]">
              <form onSubmit={handleSubmit} className="space-y-3" data-testid="careers-form">
                <select value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} required data-testid="careers-position-select"
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm text-white focus:outline-none">
                  <option value="" className="bg-[#09090b]">Select Position *</option>
                  {positions.map(p => <option key={p} value={p} className="bg-[#09090b]">{p}</option>)}
                </select>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Name *" required data-testid="careers-name-input"
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#71717a] focus:border-[#FF007F] focus:outline-none" />
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email *" required data-testid="careers-email-input"
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#71717a] focus:border-[#FF007F] focus:outline-none" />
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone *" required data-testid="careers-phone-input"
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#71717a] focus:border-[#FF007F] focus:outline-none" />
                <textarea value={form.cover_letter} onChange={e => setForm(p => ({ ...p, cover_letter: e.target.value }))} placeholder="Cover Letter *" required rows={5} data-testid="careers-cover-letter-input"
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-sm text-white placeholder:text-[#71717a] focus:border-[#FF007F] focus:outline-none resize-none" />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button type="submit" data-testid="careers-submit-btn"
                  className="w-full bg-[#FF007F] rounded-full py-3.5 flex items-center justify-center gap-2 text-sm font-extrabold text-white tracking-[1px] hover:opacity-90">
                  <Send size={16} /> Submit Application
                </button>
              </form>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
