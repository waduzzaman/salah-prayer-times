"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "./components/Header";
import Countdown from "./components/Countdown";
import Footer from "./components/Footer";
import { Sunrise, Sun, Cloudy, Sunset, Moon } from "lucide-react";

const SunTimes = dynamic(() => import("./components/SunTimes"), { ssr: false });

export default function Page() {
  /* -------------------- MOUNT GUARD -------------------- */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* -------------------- GOOGLE SHEET DATA -------------------- */
  const [prayerTimesData, setPrayerTimesData] = useState({});

  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12") hours = String(parseInt(hours) + 12);
    if (modifier === "AM" && hours === "12") hours = "00";
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

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
      }
    }
    fetchSheet();
  }, [mounted]);

  /* -------------------- STATE -------------------- */
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextIqama, setNextIqama] = useState(null);
  const [countdown, setCountdown] = useState("--:--:--");
  const [sunsetTime, setSunsetTime] = useState(null);

  /* -------------------- CLOCK -------------------- */
  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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
  const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000);
  const formatTime = (time) => {
    if (!time) return "--:--";
    const d = typeof time === "string" ? parseTime(time) : time;
    return d.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  /* -------------------- SUNSET -------------------- */
  useEffect(() => {
    if (!mounted || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      import("suncalc").then((SunCalc) => {
        const times = SunCalc.getTimes(new Date(), coords.latitude, coords.longitude);
        setSunsetTime(times.sunset);
      });
    });
  }, [mounted]);

  /* -------------------- IQAMA OFFSETS -------------------- */
  const iqamaOffsets = {
    fajr: 5,
    dhuhr: 5,
    asr: 5,
    maghrib: 12,
    isha: 5,
  };

  /* -------------------- NEXT IQAMA LOGIC -------------------- */
  useEffect(() => {
    if (!prayerTimesData.fajr) return;

    const dailyPrayers = prayerTimesData; // no Jummah

    const iqamaEvents = Object.entries(dailyPrayers)
      .map(([name, times]) => {
        let adhan;

        if (name === "maghrib" && sunsetTime) {
          adhan = addMinutes(sunsetTime, 1); // Maghrib dynamic
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
      const tomorrow = addMinutes(parseTime(prayerTimesData.fajr.adhan), iqamaOffsets.fajr);
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
  },  [currentTime, sunsetTime, prayerTimesData, iqamaOffsets]);

  /* -------------------- ICONS -------------------- */
  const prayerIcons = {
    fajr: <Sunrise className="w-10 h-10" />,
    dhuhr: <Sun className="w-10 h-10" />,
    asr: <Cloudy className="w-10 h-10" />,
    maghrib: <Sunset className="w-10 h-10" />,
    isha: <Moon className="w-10 h-10" />,
  };

  const displayPrayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  /* -------------------- PRAYER CARD -------------------- */
  const PrayerCard = ({ prayer }) => {
    const adhan =
      prayer === "maghrib" && sunsetTime
        ? addMinutes(sunsetTime, 1)
        : parseTime(prayerTimesData[prayer]?.adhan);

    const iqama = adhan ? addMinutes(adhan, iqamaOffsets[prayer] || 5) : null;

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
