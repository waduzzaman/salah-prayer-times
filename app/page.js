'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import Countdown from './components/Countdown';
import Footer from './components/Footer';
import {
  Sunrise,
  Sun,
  Cloudy,
  Sunset,
  Moon,
} from 'lucide-react';

const SunTimes = dynamic(() => import('./components/SunTimes'), { ssr: false });

export default function Page() {
  /* -------------------- STATIC DATA -------------------- */
  const prayerTimesData = {
    fajr: { adhan: '06:25', iqama: '06:30' },
    dhuhr: { adhan: '12:50', iqama: '13:00' },
    asr: { adhan: '16:20', iqama: '16:30' },
    maghrib: { adhan: null, iqama: null },
    isha: { adhan: '19:25', iqama: '19:35' },
    jummah: { adhan: '13:10', iqama: '13:45' },
  };

  /* -------------------- STATE -------------------- */
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextIqama, setNextIqama] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [isJummahDay, setIsJummahDay] = useState(false);
  const [sunsetTime, setSunsetTime] = useState(null);

  /* -------------------- HELPERS -------------------- */
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d;
  };

  const formatPrayerName = (name) =>
    isJummahDay && name === 'jummah'
      ? "Jumu'ah"
      : name.charAt(0).toUpperCase() + name.slice(1);

  /* -------------------- CLOCK -------------------- */
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* -------------------- SUNSET -------------------- */
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      import('suncalc').then((SunCalc) => {
        const times = SunCalc.getTimes(
          new Date(),
          coords.latitude,
          coords.longitude
        );
        setSunsetTime(times.sunset);
      });
    });
  }, []);

  /* -------------------- NEXT IQAMA -------------------- */
  useEffect(() => {
    const now = new Date();
    const jummah = now.getDay() === 5;
    setIsJummahDay(jummah);

    const dailyPrayers = jummah
      ? { ...prayerTimesData, dhuhr: prayerTimesData.jummah }
      : prayerTimesData;

    const iqamaEvents = Object.entries(dailyPrayers)
      .filter(([n]) => n !== 'jummah')
      .map(([name, times]) => {
        let iqamaTime;
        if (name === 'maghrib' && sunsetTime) {
          const adhan = new Date(sunsetTime.getTime() + 60 * 1000);
          iqamaTime = new Date(adhan.getTime() + 3 * 60 * 1000);
        } else {
          iqamaTime = parseTime(times.iqama);
        }
        return { name, time: iqamaTime };
      })
      .sort((a, b) => a.time - b.time);

    let next = iqamaEvents.find((p) => p.time > now);
    if (!next) {
      const tomorrow = parseTime(prayerTimesData.fajr.iqama);
      tomorrow.setDate(tomorrow.getDate() + 1);
      next = { name: 'fajr', time: tomorrow };
    }

    setNextIqama(next);

    const diff = next.time - now;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    setCountdown(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
  }, [currentTime, sunsetTime]);

  /* -------------------- ICONS -------------------- */
  const prayerIcons = {
    fajr: <Sunrise className="w-10 h-10" />,
    dhuhr: <Sun className="w-10 h-10" />,
    jummah: <Sun className="w-10 h-10" />,
    asr: <Cloudy className="w-10 h-10" />,
    maghrib: <Sunset className="w-10 h-10" />,
    isha: <Moon className="w-10 h-10" />,
  };

  const displayPrayers = isJummahDay
    ? ['fajr', 'jummah', 'asr', 'maghrib', 'isha']
    : ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  /* -------------------- UPDATED PRAYER CARD (MATCHES COUNTDOWN UI) -------------------- */
  const PrayerCard = ({ prayer, times, icon }) => {
    const formatTime = (time) => {
      if (!time) return '--:--';
      const d = typeof time === 'string' ? parseTime(time) : time;
      return d.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    return (
      <section className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center shadow-md flex flex-col items-center">
        {/* Icon */}
        <div className="mb-4 text-emerald-600 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
          {icon}
        </div>

        {/* Prayer Name */}
        <p className="text-2xl sm:text-3xl font-semibold uppercase text-gray-800 mb-6">
          {formatPrayerName(prayer)}
        </p>

        {/* Times Container */}
        <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-1">Adhan</span>
            <span className="font-mono text-3xl font-bold text-emerald-900">{formatTime(times?.adhan)}</span>
          </div>
          
          <div className="h-px bg-emerald-200 w-1/2 mx-auto"></div>

          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-1">Iqama</span>
            <span className="font-mono text-4xl sm:text-5xl font-bold text-emerald-900 tracking-tight">
              {formatTime(times?.iqama)}
            </span>
          </div>
        </div>
      </section>
    );
  };

  /* -------------------- RENDER -------------------- */
  return (
    <main className="w-full max-w-7xl mx-auto flex flex-col items-center px-4 sm:px-6 md:px-8 py-8 space-y-8">
      <Header currentTime={currentTime} />
      
      <div className="w-full">
        <Countdown nextPrayer={nextIqama} countdown={countdown} />
      </div>

      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayPrayers.map((p) => {
          let times;
          if (p === 'maghrib' && sunsetTime) {
            const adhan = new Date(sunsetTime.getTime() + 60 * 1000);
            const iqama = new Date(adhan.getTime() + 3 * 60 * 1000);
            times = { adhan, iqama };
          } else if (p === 'maghrib') {
            times = { adhan: null, iqama: null };
          } else {
            const key = p === 'jummah' ? 'jummah' : p;
            times = prayerTimesData[key];
          }

          return (
            <PrayerCard
              key={p}
              prayer={p}
              times={times}
              icon={prayerIcons[p]}
            />
          );
        })}
      </section>

      <Footer />
    </main>
  );
}