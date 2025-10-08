'use client';


import { useState, useEffect } from 'react';
import Header from './components/Header';
import Countdown from './components/Countdown';
import PrayerCard from './components/PrayerCard';
import Footer from './components/Footer';
import { Sunrise, Sun, Cloudy, Sunset, Moon } from 'lucide-react';

import dynamic from 'next/dynamic';

const SunTimes = dynamic(() => import('./components/SunTimes'), { ssr: false });


export default function Page() {
  const prayerTimesData = {
    fajr: { adhan: "05:35", iqama: "06:30" },
    dhuhr: { adhan: "13:10", iqama: "13:45" },
    asr: { adhan: "17:01", iqama: "17:15" },
    maghrib: { adhan: "19:48", iqama: "19:50" },
    isha: { adhan: "21:15", iqama: "20:30" },
    jummah: { adhan: "13:10", iqama: "13:45" },
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextIqama, setNextIqama] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [isJummahDay, setIsJummahDay] = useState(false);

  const parseTime = (timeStr) => {
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
    return d;
  };

  const formatPrayerName = (name) => isJummahDay && name === 'dhuhr' ? "Jumu'ah" : name.charAt(0).toUpperCase() + name.slice(1);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Next Iqama countdown
  useEffect(() => {
    const now = new Date();
    const isJummah = now.getDay() === 5;
    setIsJummahDay(isJummah);

    const dailyPrayers = isJummah ? { ...prayerTimesData, dhuhr: prayerTimesData.jummah } : prayerTimesData;

    const iqamaEvents = Object.entries(dailyPrayers)
      .filter(([n]) => n !== 'jummah')
      .map(([n, t]) => ({ name: `${formatPrayerName(n)} Iqama`, time: parseTime(t.iqama) }))
      .sort((a, b) => a.time - b.time);

    let nextEvent = iqamaEvents.find(p => p.time > now);
    if (!nextEvent) {
      const tomorrowFajrIqama = parseTime(prayerTimesData.fajr.iqama);
      tomorrowFajrIqama.setDate(tomorrowFajrIqama.getDate() + 1);
      nextEvent = { name: 'Fajr Iqama', time: tomorrowFajrIqama };
    }

    setNextIqama(nextEvent);

    const diff = nextEvent.time - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setCountdown(`${hours % 12 || 12}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`);
  }, [currentTime]);

  const prayerIcons = {
    fajr: <Sunrise className="w-8 h-8 text-amber-200/80" />,
    dhuhr: <Sun className="w-8 h-8 text-amber-200/80" />,
    jummah: <Sun className="w-8 h-8 text-amber-200/80" />,
    asr: <Cloudy className="w-8 h-8 text-amber-200/80" />,
    maghrib: <Sunset className="w-8 h-8 text-amber-200/80" />,
    isha: <Moon className="w-8 h-8 text-amber-200/80" />,
  };

  const displayPrayers = isJummahDay ? ['fajr','jummah','asr','maghrib','isha'] : ['fajr','dhuhr','asr','maghrib','isha'];

  return (
    <main className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center p-6">
      <Header currentTime={currentTime} />
      <Countdown nextPrayer={nextIqama} countdown={countdown} />

  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
  {displayPrayers.map((p) => (
    <PrayerCard
      key={p}
      prayer={p}
      times={prayerTimesData[p]}
      icon={prayerIcons[p]}
      formatName={formatPrayerName}
    />
  ))}
</section>


      <Footer />
    </main>
  );
}
