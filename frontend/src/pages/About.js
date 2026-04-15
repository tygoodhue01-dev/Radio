import React from 'react';
import { Radio, Mic2, Users, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8" data-testid="about-page">
      <h1 className="font-display text-3xl font-extrabold mb-2">About The Beat 515</h1>
      <p className="text-xl text-beat-pink font-display font-medium mb-8">Proud. Loud. Local.</p>

      <div className="space-y-6">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Radio size={20} className="text-beat-pink" />
            <h2 className="font-display font-bold text-lg">Our Station</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            The Beat 515 is your premier Top 40 radio station, broadcasting live from the heart of the 515 area code. We bring you the hottest hits, breaking music news, and unforgettable events that keep our community connected through music.
          </p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Mic2 size={20} className="text-beat-cyan" />
            <h2 className="font-display font-bold text-lg">Our DJs</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Our talented lineup of DJs brings personality, energy, and passion to every show. From morning drives to late-night sessions, our on-air talent keeps the music flowing and the vibes right.
          </p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Users size={20} className="text-beat-yellow" />
            <h2 className="font-display font-bold text-lg">Our Community</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            We're more than a radio station; we're a community. Through our rewards program, live events, and interactive request line, we keep listeners engaged and give back to the community that supports us.
          </p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Heart size={20} className="text-red-400" />
            <h2 className="font-display font-bold text-lg">Our Mission</h2>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            To deliver the best Top 40 music experience while championing local artists, supporting community events, and creating meaningful connections through the power of music.
          </p>
        </div>
      </div>
    </div>
  );
}
