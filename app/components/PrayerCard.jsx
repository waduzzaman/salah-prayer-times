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
      flex flex-col items-center p-6 bg-gradient-to-b from-amber-50 to-amber-100 border-amber-500/50 rounded-xl
      shadow-2xl shadow-black/50 hover:shadow-amber-500/40 transform hover:scale-[1.02]
      transition-all duration-300 ease-in-out
    ">
      {/* Icon Section */}
      <div className="mb-4 text-amber-100 text-3xl p-2 rounded-full bg-amber-500/20">
        {icon}
      </div>
      
      {/* Prayer Name */}
      <h2 className="text-3xl font-sans font-extrabold text-white mb-4 tracking-wider uppercase">
        {formatName(prayer)}
      </h2>
      
      {/* Times Grid */}
      <div className="
        w-full grid grid-cols-2 gap-x-4 gap-y-2
        text-white text-lg md:text-xl font-medium
        text-center
      ">
        {/* Adhan */}
        <p className="col-span-1 text-gray-100">Adhan</p>
        <p className="col-span-1 text-amber-100 font-extrabold tracking-wider">
          {formatTime(times?.adhan)}
        </p>

        {/* Separator Line */}
        <div className="col-span-2 h-[1px] bg-gray-700 my-1"></div>
        
        {/* Iqama */}
        <p className="col-span-1 text-gray-100">Iqama</p>
        <p className="col-span-1 text-amber-100 font-extrabold tracking-wider">
          {formatTime(times?.iqama)}
        </p>
      </div>
    </div>
  );
}