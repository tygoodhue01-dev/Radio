import React from 'react';
import { Phone, Mail, MapPin, Radio } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8" data-testid="contact-page">
      <h1 className="font-display text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Phone size={28} className="text-beat-cyan" /> Contact Us
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Get in touch with The Beat 515</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-beat-pink/10 flex items-center justify-center">
              <Radio size={18} className="text-beat-pink" />
            </div>
            <div>
              <h3 className="font-display font-bold">Studio Line</h3>
              <p className="text-sm text-zinc-400">Call in during live shows</p>
            </div>
          </div>
          <p className="text-beat-pink font-mono text-lg">(515) 515-BEAT</p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-beat-cyan/10 flex items-center justify-center">
              <Mail size={18} className="text-beat-cyan" />
            </div>
            <div>
              <h3 className="font-display font-bold">Email</h3>
              <p className="text-sm text-zinc-400">General inquiries</p>
            </div>
          </div>
          <p className="text-beat-cyan font-mono">info@thebeat515.com</p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-beat-yellow/10 flex items-center justify-center">
              <MapPin size={18} className="text-beat-yellow" />
            </div>
            <div>
              <h3 className="font-display font-bold">Location</h3>
              <p className="text-sm text-zinc-400">Visit our studio</p>
            </div>
          </div>
          <p className="text-zinc-300 text-sm">515 Main Street<br />Des Moines, IA 50309</p>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Phone size={18} className="text-green-400" />
            </div>
            <div>
              <h3 className="font-display font-bold">Business</h3>
              <p className="text-sm text-zinc-400">Advertising & partnerships</p>
            </div>
          </div>
          <p className="text-green-400 font-mono">ads@thebeat515.com</p>
        </div>
      </div>
    </div>
  );
}
