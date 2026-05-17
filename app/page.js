"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WelcomeSplash from "./components/WelcomeSplash";
import { Sunrise, Sun, Cloudy, Sunset, Moon } from "lucide-react";

const SunTimes = dynamic(() => import("./components/SunTimes"), { ssr: false });

export default function Page() {
  /* -------------------- MOUNT & LOADING GUARD -------------------- */
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  /* -------------------- STATE -------------------- */
  const [prayerTimesData, setPrayerTimesData] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextIqama, setNextIqama] = useState(null);
  const [countdown, setCountdown] = useState("--:--:--");
  const [sunriseTime, setSunriseTime] = useState(null);
  const [sunsetTime, setSunsetTime] = useState(null);
  const [activePrayer, setActivePrayer] = useState(null);

  /* -------------------- HELPERS -------------------- */
  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return "00:00";
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") hours = String(parseInt(hours) + 12);
    if (modifier === "AM" && hours === "12") hours = "00";
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d;
  };

  const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);

  const formatTime = (time) => {
    if (!time) return "--:--";
    const d = typeof time === "string" ? parseTime(time) : time;
    return d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  /* -------------------- GOOGLE SHEET DATA -------------------- */
  useEffect(() => {
    if (!mounted) return;
    async function fetchSheet() {
      try {
        const res = await fetch(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vRB_o40MdOw7VvT51EilJH8OdnXhKXy5AXU8W-cuzyD3ENz3jS6tfbDxm_hrlDSOW9o3ZVmyo7QUnkj/pub?output=csv",
          { cache: "no-store" }
        );
        const text = await res.text();
        const rows = text.split("\n").slice(1);

        const formatted = {};
        rows.forEach((row) => {
          const [prayer, time] = row.split(",");
          if (prayer && time)
            formatted[prayer.trim().toLowerCase()] = { adhan: convertTo24Hour(time.trim()) };
        });
        setPrayerTimesData(formatted);
      } catch (err) {
        console.error("Sheet fetch failed:", err);
      } finally {
        // Delay to allow the musalli to experience the Bismillah welcome
        setTimeout(() => setLoading(false), 2000);
      }
    }
    fetchSheet();
  }, [mounted]);

  /* -------------------- CLOCK -------------------- */
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [mounted]);

  /* -------------------- SUNRISE & SUNSET -------------------- */
  useEffect(() => {
    if (!mounted || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      import("suncalc").then((SunCalc) => {
        const times = SunCalc.getTimes(new Date(), coords.latitude, coords.longitude);
        setSunriseTime(times.sunrise);
        setSunsetTime(times.sunset);
      });
    });
  }, [mounted]);

  /* -------------------- IQAMA OFFSETS -------------------- */
  const iqamaOffsets = {
    fajr: 5,
    dhuhr: 5,
    asr: 5,
    maghrib: 5,
    isha: 5,
  };

  /* -------------------- NEXT IQAMA LOGIC -------------------- */
  useEffect(() => {
    if (!prayerTimesData.fajr) return;

    const dailyPrayers = prayerTimesData;

    const iqamaEvents = Object.entries(dailyPrayers)
      .map(([name, times]) => {
        let adhan;
        if (name === "maghrib" && sunsetTime) {
          adhan = addMinutes(sunsetTime, 1);
        } else {
          adhan = parseTime(times?.adhan);
        }
        if (!adhan) return null;
        const iqama = addMinutes(adhan, iqamaOffsets[name] || 5);
        return { name, time: iqama };
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time);

    let next = iqamaEvents.find((p) => p.time > new Date());
    if (!next && prayerTimesData.fajr) {
      const tomorrowAdhan = parseTime(prayerTimesData.fajr.adhan);
      const tomorrow = addMinutes(tomorrowAdhan, iqamaOffsets.fajr);
      tomorrow.setDate(tomorrow.getDate() + 1);
      next = { name: "fajr", time: tomorrow };
    }
    setNextIqama(next);

    if (!next) return;
    const diff = next.time - new Date();
    if (diff <= 0) return setCountdown("00:00:00");

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    setCountdown(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
  }, [currentTime, sunsetTime, prayerTimesData]);

  /* -------------------- ACTIVE PRAYER LOGIC -------------------- */
  useEffect(() => {
    if (!prayerTimesData.fajr || !mounted) return;

    const dailyPrayers = prayerTimesData;
    const now = new Date();

    // Build array of prayer events with adhan times
    const prayerEvents = Object.entries(dailyPrayers)
      .map(([name, times]) => {
        let adhan;
        if (name === "maghrib" && sunsetTime) {
          adhan = addMinutes(sunsetTime, 1);
        } else {
          adhan = parseTime(times?.adhan);
        }
        return { name, adhan };
      })
      .filter(Boolean)
      .sort((a, b) => a.adhan - b.adhan);

    // Find current prayer: the one whose adhan has passed and next adhan hasn't come yet
    let current = null;
    for (let i = 0; i < prayerEvents.length; i++) {
      const currentAdhan = prayerEvents[i].adhan;
      let nextAdhan;
      
      // For last prayer (isha), next is fajr of next day
      if (i === prayerEvents.length - 1) {
        const fajrAdhan = parseTime(prayerTimesData.fajr?.adhan);
        nextAdhan = addMinutes(fajrAdhan, 24 * 60); // next day
      } else {
        nextAdhan = prayerEvents[i + 1].adhan;
      }

      if (now >= currentAdhan && now < nextAdhan) {
        current = prayerEvents[i].name;
        break;
      }
    }

    setActivePrayer(current);
  }, [currentTime, prayerTimesData, sunsetTime]);

  /* -------------------- UI HELPERS -------------------- */
  const prayerIcons = {
    fajr: <Sunrise className="w-10 h-10" />,
    dhuhr: <Sun className="w-10 h-10" />,
    asr: <Cloudy className="w-10 h-10" />,
    maghrib: <Sunset className="w-10 h-10" />,
    isha: <Moon className="w-10 h-10" />,
  };

  const displayPrayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  const PrayerRow = ({ prayer }) => {
    const adhan =
      prayer === "maghrib" && sunsetTime
        ? addMinutes(sunsetTime, 1)
        : parseTime(prayerTimesData[prayer]?.adhan);

    const iqama = adhan ? addMinutes(adhan, iqamaOffsets[prayer] || 5) : null;

    // Determine if this is the active prayer
    const isActive = activePrayer === prayer;

    return (
      <tr className={`border-b border-emerald-200 hover:bg-emerald-50 ${isActive ? 'bg-red-50/50' : ''}`}>
        <td className="px-6 py-4 text-left text-sm font-medium text-gray-900">
          <div className="flex items-center space-x-3">
            {prayerIcons[prayer]}
            <p className="text-xl font-semibold uppercase text-gray-800">{prayer}</p>
          </div>
        </td>
        <td className="px-6 py-4 text-left text-sm font-medium text-gray-900">
          <span className="text-sm uppercase tracking-widest text-emerald-700 font-semibold mb-1 block">Adhan</span>
          <span className="font-mono text-4xl font-bold text-emerald-900">
            {mounted ? formatTime(adhan) : "--:--"}
          </span>
        </td>
        <td className="px-6 py-4 text-left text-sm font-medium text-gray-900">
          <span className="text-sm uppercase tracking-widest text-emerald-700 font-semibold mb-1 block">Iqama</span>
          <span className="font-mono text-4xl font-bold text-emerald-900 tracking-tight">
            {mounted ? formatTime(iqama) : "--:--"}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <>
      <WelcomeSplash isLoading={loading} />
      
       <main className={`w-full max-w-7xl mx-auto flex flex-col items-center px-4 sm:px-6 md:px-8 py-8 space-y-8 transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
         <Header sunriseTime={sunriseTime} sunsetTime={sunsetTime} />
         <section className="w-full">
           <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-emerald-200">
               <thead className="bg-emerald-50">
                 <tr>
                   <th className="px-6 py-3 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">Prayer</th>
                   <th className="px-6 py-3 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">Adhan</th>
                   <th className="px-6 py-3 text-left text-sm font-medium text-emerald-700 uppercase tracking-wider">Iqama</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-emerald-200">
                 {displayPrayers.map((p) => (
                   <PrayerRow key={p} prayer={p} />
                 ))}
               </tbody>
             </table>
           </div>
         </section>
         <Footer />
       </main>
    </>
  );
}