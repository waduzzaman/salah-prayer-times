'use client';

export default function PrayerCard({ prayer, times, icon, formatName }) {
  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m), 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-gray-800/60 p-6 sm:p-8 md:p-6 rounded-3xl flex flex-col items-center text-white shadow-lg 
                    hover:scale-105 transition-transform duration-300 w-full max-w-sm">
      <div className="mb-4 text-5xl sm:text-6xl md:text-4xl">{icon}</div>
      <h2 className="text-3xl sm:text-4xl md:text-2xl font-bold mb-3 text-center">{formatName(prayer)}</h2>
      <p className="text-xl sm:text-2xl md:text-lg mb-1">Adhan: {formatTime(times.adhan)}</p>
      <p className="text-xl sm:text-2xl md:text-lg">Iqama: {formatTime(times.iqama)}</p>
    </div>
  );
}
