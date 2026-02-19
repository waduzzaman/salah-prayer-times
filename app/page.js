"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Header from "./components/Header";
import Countdown from "./components/Countdown";
import Footer from "./components/Footer";
import {
  Sunrise,
  Sun,
  Cloudy,
  Sunset,
  Moon,
} from "lucide-react";

const SunTimes = dynamic(() => import("./components/SunTimes"), {
  ssr: false,
});

export default function Page() {
  /* -------------------- MOUNT GUARD -------------------- */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* -------------------- STATIC DATA -------------------- */
  const prayerTimesData = {
    fajr: { adhan: "06:00" },
    dhuhr: { adhan: "12:55" },
    asr: { adhan: "16:55" },
    maghrib: { adhan: null },
    isha: { adhan: "19:30" },
    jummah: { adhan: "13:10" },
  };

  /* -------------------- STATE -------------------- */
  const [currentTime, setCurrentTime] = useState(null);
  const [nextIqama, setNextIqama] = useState(null);
  const [countdown, setCountdown] = useState("--:--:--");
  const [isJummahDay, setIsJummahDay] = useState(false);
  const [sunsetTime, setSunsetTime] = useState(null);

  /* -------------------- CLOCK -------------------- */
  useEffect(() => {
    if (!mounted) return;

    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted]);

  /* -------------------- HELPERS -------------------- */
  const parseTime = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d;
  };

  const addMinutes = (date, mins) =>
    new Date(date.getTime() + mins * 60000);

  const formatTime = (time) => {
    if (!time) return "--:--";
    const d = typeof time === "string" ? parseTime(time) : time;

    return d.toLocaleTimeString("en-CA", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* -------------------- SUNSET -------------------- */
  useEffect(() => {
    if (!mounted) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      import("suncalc").then((SunCalc) => {
        const times = SunCalc.getTimes(
          new Date(),
          coords.latitude,
          coords.longitude
        );
        setSunsetTime(times.sunset);
      });
    });
  }, [mounted]);

  /* -------------------- NEXT IQAMA LOGIC -------------------- */
  useEffect(() => {
    if (!currentTime) return;

    const now = new Date();
    const jummah = now.getDay() === 5;
    setIsJummahDay(jummah);

    const dailyPrayers = jummah
      ? { ...prayerTimesData, dhuhr: prayerTimesData.jummah }
      : prayerTimesData;

    const iqamaEvents = Object.entries(dailyPrayers)
      .filter(([n]) => n !== "jummah")
      .map(([name, times]) => {
        let adhan;

        if (name === "maghrib" && sunsetTime) {
          adhan = addMinutes(sunsetTime, 1);
        } else {
          adhan = parseTime(times.adhan);
        }

        if (!adhan) return null;

        const iqama = addMinutes(adhan, 3);
        return { name, time: iqama };
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time);

    let next = iqamaEvents.find((p) => p.time > now);

    if (!next) {
      const tomorrow = addMinutes(parseTime("06:00"), 3);
      tomorrow.setDate(tomorrow.getDate() + 1);
      next = { name: "fajr", time: tomorrow };
    }

    setNextIqama(next);

    const diff = next.time - now;

    if (diff <= 0) {
      setCountdown("00:00:00");
      return;
    }

    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    setCountdown(
      `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    );
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
    ? ["fajr", "jummah", "asr", "maghrib", "isha"]
    : ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  /* -------------------- PRAYER CARD -------------------- */
  const PrayerCard = ({ prayer }) => {
    let adhan;
    let iqama;
    
    // Magrib

    if (prayer === "maghrib" && sunsetTime) {
      adhan = addMinutes(sunsetTime, 1);
      iqama = addMinutes(adhan, 12);
    } else {
      const key = prayer === "jummah" ? "jummah" : prayer;
      adhan = parseTime(prayerTimesData[key]?.adhan);
      iqama = adhan ? addMinutes(adhan, 5) : null;
    }

    return (
      <section className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center shadow-md flex flex-col items-center">
        <div className="mb-4 text-emerald-600 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
          {prayerIcons[prayer]}
        </div>

        <p className="text-2xl sm:text-3xl font-semibold uppercase text-gray-800 mb-6">
          {prayer}
        </p>

        <div className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-1">
              Adhan
            </span>
            <span className="font-mono text-3xl font-bold text-emerald-900">
              {mounted ? formatTime(adhan) : "--:--"}
            </span>
          </div>

          <div className="h-px bg-emerald-200 w-1/2 mx-auto"></div>

          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold mb-1">
              Iqama
            </span>
            <span className="font-mono text-4xl sm:text-5xl font-bold text-emerald-900 tracking-tight">
              {mounted ? formatTime(iqama) : "--:--"}
            </span>
          </div>
        </div>
      </section>
    );
  };

  /* -------------------- RENDER -------------------- */
  return (
    <main className="w-full max-w-7xl mx-auto flex flex-col items-center px-4 sm:px-6 md:px-8 py-8 space-y-8">
      <Header />

      <div className="w-full">
        <Countdown nextPrayer={nextIqama} countdown={countdown} />
      </div>

      <section className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayPrayers.map((p) => (
          <PrayerCard key={p} prayer={p} />
        ))}
      </section>

      <Footer />
    </main>
  );
}
