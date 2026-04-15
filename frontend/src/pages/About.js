import React from 'react';
import { Radio, Mic2, Users, Heart } from 'lucide-react';
import WebNavBar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div data-testid="about-page">
      <WebNavBar />
      <div className="max-w-[800px] mx-auto px-8 py-8">
        <h1 className="text-[28px] font-black text-white tracking-[3px] font-display">ABOUT</h1>
        <p className="text-xl text-[#FF007F] font-display font-bold mt-1 mb-8">Proud. Loud. Local.</p>
        <div className="space-y-4">
          {[
            { icon: Radio, color: '#FF007F', title: 'Our Station', text: 'The Beat 515 is your premier Top 40 radio station, broadcasting live from the heart of the 515 area code. We bring you the hottest hits, breaking music news, and unforgettable events that keep our community connected through music.' },
            { icon: Mic2, color: '#00F0FF', title: 'Our DJs', text: 'Our talented lineup of DJs brings personality, energy, and passion to every show. From morning drives to late-night sessions, our on-air talent keeps the music flowing and the vibes right.' },
            { icon: Users, color: '#FFF000', title: 'Our Community', text: "We're more than a radio station; we're a community. Through our rewards program, live events, and interactive request line, we keep listeners engaged and give back to the community that supports us." },
            { icon: Heart, color: '#ef4444', title: 'Our Mission', text: 'To deliver the best Top 40 music experience while championing local artists, supporting community events, and creating meaningful connections through the power of music.' },
          ].map(s => (
            <div key={s.title} className="bg-[#18181b] rounded-xl p-6 border border-[rgba(255,255,255,0.1)]">
              <div className="flex items-center gap-3 mb-3">
                <s.icon size={20} style={{ color: s.color }} />
                <h2 className="font-display font-bold text-lg">{s.title}</h2>
              </div>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
