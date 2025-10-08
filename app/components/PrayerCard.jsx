'use client';

export default function PrayerCard({ prayer, times, icon, formatName }) {
  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(h), parseInt(m), 0, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-xl flex flex-col items-center text-white">
      <div className="mb-2">{icon}</div>
      <h2 className="text-xl font-semibold">{formatName(prayer)}</h2>
      <p>Adhan: {formatTime(times.adhan)}</p>
      <p>Iqama: {formatTime(times.iqama)}</p>
    </div>
  );
}
