'use client';

import React from 'react';

export default function PrayerCard({ prayer, times, icon, formatName }) {
  const formatTime = (time) => {
    if (!time) return '--:--';
    if (typeof time === 'string') {
      const [h, m] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="
      flex flex-col items-center p-6
      /* ELEGANT GREEN GRADIENT applied here */
      bg-gradient-to-br from-green-900 to-green-800 border border-green-700/50 rounded-xl
      shadow-2xl shadow-black/50
      hover:shadow-green-500/40 transform hover:scale-[1.02]
      transition-all duration-300 ease-in-out
    ">
      {/* Icon Section (Adjusted background color for green theme) */}
      <div className="mb-4 text-amber-100 text-3xl p-2 rounded-full bg-green-700/20">
        {icon}
      </div>
      
      {/* Prayer Name (text-white remains highly visible on dark green) */}
      <h2 className="text-2xl md:text-3xl font-sans font-extrabold text-white mb-4 tracking-wider uppercase">
        {formatName(prayer)}
      </h2>
      
      {/* Times Grid */}
      <div className="
        w-full grid grid-cols-2 gap-x-4 gap-y-2
        text-white text-xl md:text-2xl font-medium
        text-center
      ">
        {/* Adhan (Adjusted label color for better harmony with green background) */}
        <p className="col-span-1 text-green-300/70">Adhan</p>
        <p className="col-span-1 text-amber-100 font-extrabold tracking-wider">
          {formatTime(times?.adhan)}
        </p>

        {/* Separator Line (Adjusted color for green theme) */}
        <div className="col-span-2 h-[1px] bg-green-700 my-1"></div>
        
        {/* Iqama (Adjusted label color for better harmony with green background) */}
        <p className="col-span-1 text-green-300/70">Iqama</p>
        <p className="col-span-1 text-amber-100 font-extrabold tracking-wider">
          {formatTime(times?.iqama)}
        </p>
      </div>
    </div>
  );
}