'use client';

import React from 'react';

export default function PrayerCard({ prayer, times, icon }) {
  
  // Internal helper to format the prayer name
  const displayPrayerName = (name) => {
    if (!name) return 'Prayer';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Internal helper to format time
  const formatTime = (time) => {
    if (!time) return '--:--';
    try {
      if (typeof time === 'string') {
        const [h, m] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
        return date.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
      return time.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return time;
    }
  };

  return (
    <section
      className="
        bg-white
        border border-emerald-200
        rounded-3xl
        px-6 py-10 sm:px-10 sm:py-14
        text-center
        shadow-lg
        w-full
      "
    >
      {/* Icon - Matches the sub-heading text style */}
      <div className="flex justify-center mb-6">
        <div className="text-emerald-600 text-3xl sm:text-4xl p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          {icon || '🕌'}
        </div>
      </div>

      {/* Prayer Name - Matches the Countdown "Prayer Name" text exactly */}
      <p
        className="
          text-4xl sm:text-5xl md:text-6xl
          font-semibold uppercase
          text-gray-800
          mb-10
        "
      >
        {displayPrayerName(prayer)}
      </p>

      {/* Times Container - Matches the Countdown Timer Box style */}
      <div
        className="
          bg-emerald-50
          border border-emerald-200
          rounded-2xl
          py-8 px-6
          space-y-6
        "
      >
        {/* Adhan Section */}
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base text-emerald-700 uppercase tracking-widest font-medium mb-1">
            Adhan
          </span>
          <span className="font-mono text-4xl sm:text-5xl font-bold text-emerald-900 tracking-tight">
            {formatTime(times?.adhan)}
          </span>
        </div>

        {/* Divider - Clean line matching the emerald theme */}
        <div className="h-px bg-emerald-200 w-1/2 mx-auto"></div>

        {/* Iqama Section */}
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base text-emerald-700 uppercase tracking-widest font-medium mb-1">
            Iqama
          </span>
          <span className="font-mono text-5xl sm:text-6xl md:text-7xl font-bold text-emerald-900 tracking-tighter">
            {formatTime(times?.iqama)}
          </span>
        </div>
      </div>
    </section>
  );
}