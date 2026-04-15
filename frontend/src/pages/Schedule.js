import React, { useState, useEffect } from 'react';
import { getScheduleApi } from '../services/api';
import { Calendar, Clock } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScheduleApi().then(d => { setSchedule(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = schedule.filter(s => s.day_of_week === day);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" data-testid="schedule-page">
      <h1 className="font-display text-3xl font-extrabold mb-2 flex items-center gap-3">
        <Calendar size={28} className="text-beat-cyan" /> Schedule
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Weekly programming schedule for The Beat 515</p>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading...</div>
      ) : schedule.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <Calendar size={48} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-500">No schedule available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.map(day => grouped[day].length > 0 && (
            <div key={day} className="glass rounded-xl overflow-hidden" data-testid={`schedule-${day.toLowerCase()}`}>
              <div className="px-5 py-3 bg-white/[0.03] border-b border-white/5">
                <h3 className="font-display font-bold text-sm text-beat-cyan">{day}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {grouped[day].map(s => (
                  <div key={s.schedule_id} className="px-5 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 w-40 flex-shrink-0">
                      <Clock size={12} />
                      <span className="font-mono">{s.time_slot}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{s.show_name}</p>
                      <p className="text-xs text-zinc-400">with {s.dj_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
