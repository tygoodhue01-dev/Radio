import React from 'react';
import { Phone, Mail, MapPin, Radio } from 'lucide-react';
import WebNavBar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Contact() {
  return (
    <div data-testid="contact-page">
      <WebNavBar />
      <div className="max-w-[800px] mx-auto px-8 py-8">
        <h1 className="text-[28px] font-black text-white tracking-[3px] font-display">CONTACT</h1>
        <p className="text-sm text-[#a1a1aa] mt-1 mb-6">Get in touch with The Beat 515</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Radio, color: '#FF007F', bg: 'rgba(255,0,127,0.1)', title: 'Studio Line', sub: 'Call in during live shows', val: '(515) 515-BEAT' },
            { icon: Mail, color: '#00F0FF', bg: 'rgba(0,240,255,0.1)', title: 'Email', sub: 'General inquiries', val: 'info@thebeat515.com' },
            { icon: MapPin, color: '#FFF000', bg: 'rgba(255,240,0,0.1)', title: 'Location', sub: 'Visit our studio', val: '515 Main Street\nDes Moines, IA 50309' },
            { icon: Phone, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', title: 'Business', sub: 'Advertising & partnerships', val: 'ads@thebeat515.com' },
          ].map(c => (
            <div key={c.title} className="bg-[#18181b] rounded-xl p-6 border border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: c.bg }}>
                  <c.icon size={18} style={{ color: c.color }} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{c.title}</h3>
                  <p className="text-xs text-[#a1a1aa]">{c.sub}</p>
                </div>
              </div>
              <p className="font-mono whitespace-pre-line" style={{ color: c.color }}>{c.val}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
