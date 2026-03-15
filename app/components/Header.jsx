"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Sunrise, Sunset, MapPin, CalendarDays } from "lucide-react";
import Image from "next/image";
import SunCalc from "suncalc";

export default function Header() {
  /* -----------------------------
      ✅ Hydration Safe Mount
  ------------------------------ */
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* -----------------------------
      ✅ Live Clock
  ------------------------------ */
  const [currentTime, setCurrentTime] = useState(null);

  useEffect(() => {
    if (!mounted) return;
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  /* -----------------------------
      ✅ Sunrise / Sunset & Location
  ------------------------------ */
  const [sunrise, setSunrise] = useState("--:--");
  const [sunset, setSunset] = useState("--:--");
  const [location, setLocation] = useState("Loading location...");
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    if (!("geolocation" in navigator)) {
      setLocation("Toronto");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const times = SunCalc.getTimes(new Date(), latitude, longitude);

        setSunrise(times.sunrise.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true }));
        setSunset(times.sunset.toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true }));

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setLocation(data.address?.city || data.address?.town || data.address?.suburb || "Toronto");
        } catch {
          setLocation("Toronto");
        }
      },
      () => setLocation("Toronto")
    );
  }, [mounted]);

  /* -----------------------------
      ✅ Hijri Date (Bulletproof Fix)
  ------------------------------ */
  const hijriDate = useMemo(() => {
    if (!currentTime) return "";

    // Method 1: Try Browser Intl API
    try {
      const locale = "en-u-ca-islamic-umalqura-nu-latn";
      const formatter = new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const parts = formatter.formatToParts(currentTime);
      const year = parseInt(parts.find(p => p.type === 'year')?.value || "0");
      
      // If the browser actually returned a Hijri year (around 1447)
      if (year > 1400 && year < 1500) {
        const d = parts.find(p => p.type === "day")?.value;
        const m = parts.find(p => p.type === "month")?.value;
        return `${d} ${m} ${year} AH`;
      }
    } catch (e) {
      // Fall through to Method 2
    }

    // Method 2: Mathematical Fallback (Kuwaiti Algorithm)
    // Used when mobile browsers fail to provide Islamic calendar data
    const day = currentTime.getDate();
    const month = currentTime.getMonth();
    const year = currentTime.getFullYear();
    
    let m = month + 1;
    let y = year;
    if (m < 3) {
        y -= 1;
        m += 12;
    }

    let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + 2 - Math.floor(y / 100) + Math.floor(Math.floor(y / 100) / 4) - 1524.5;
    jd = Math.floor(jd) + 0.5;
    const iEpoch = 1948439.5;
    const iCycles = Math.floor((jd - iEpoch) / 10631);
    const iCycleDay = Math.floor(jd - iEpoch) % 10631;
    const iYear = Math.floor((iCycleDay) / 354.366);
    const iYearDay = Math.floor(iCycleDay - (iYear * 354.366) + 0.5);
    
    const hYear = (iCycles * 30) + iYear + 1;
    const hMonthNames = ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"];
    
    let hMonth = Math.floor((iYearDay - 1) / 29.5);
    if (hMonth > 11) hMonth = 11;
    const hDay = Math.floor(iYearDay - (hMonth * 29.5) + 0.5);

    return `${hDay} ${hMonthNames[hMonth]} ${hYear} AH`;
  }, [currentTime]);

  /* -----------------------------
      ✅ Modal Controls
  ------------------------------ */
  const closeModal = useCallback(() => setShowCalendar(false), []);

  useEffect(() => {
    if (!showCalendar) return;
    const handleKeyDown = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showCalendar, closeModal]);

  useEffect(() => {
    document.body.style.overflow = showCalendar ? "hidden" : "auto";
  }, [showCalendar]);

  return (
    <>
      <header className="w-full px-4 sm:px-6 lg:px-0 max-w-5xl mx-auto mb-10">
        {/* Info Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-t-2xl text-emerald-900 text-sm font-medium">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{location}</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <Sunrise className="w-4 h-4 text-amber-500" />
              <span>{sunrise}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sunset className="w-4 h-4 text-orange-500" />
              <span>{sunset}</span>
            </div>
          </div>
        </div>

        {/* Main Board */}
        <div className="bg-white border-x border-b border-emerald-100 rounded-b-2xl shadow-sm p-6 sm:p-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-emerald-900 mb-6 leading-relaxed">
            بِسْمِ ٱللّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </h1>

          <div className="inline-block bg-emerald-100 px-6 py-2 rounded-full font-bold tracking-widest text-emerald-800 uppercase mb-8 text-xs sm:text-sm border border-emerald-200">
            30 Tuxedo Musallah
          </div>

          {/* Clock */}
          <div className="text-5xl sm:text-6xl md:text-8xl font-mono font-bold text-emerald-950 mb-8 tracking-tighter">
            {currentTime
              ? currentTime.toLocaleTimeString("en-CA", {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })
              : "00:00:00"}
          </div>

          {/* Date Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 text-emerald-800 font-bold text-sm sm:text-lg border-t border-emerald-50 pt-8">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              <span>
                {currentTime ? currentTime.toLocaleDateString("en-CA", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }) : ""}
              </span>
            </div>

            <span className="hidden sm:inline text-emerald-200">|</span>

            <span className="text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl sm:bg-transparent sm:p-0">
              {hijriDate}
            </span>
          </div>

          {/* Action Button */}
          <div className="mt-10">
            <button
              onClick={() => setShowCalendar(true)}
              className="relative inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-10 py-4 text-sm sm:text-base font-bold text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-200/50"
            >
              View Ramadan 2026 Calendar
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Calendar Modal */}
      {showCalendar && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-3xl p-4 sm:p-6 relative shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              ✕
            </button>

            <div className="relative w-full h-[65vh] sm:h-[75vh]">
              <Image
                src="/ramadan-2026.png"
                alt="30 Tuxedo Musallah Calendar"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="mt-4 flex gap-3">
               <a
                href="/ramadan-2026.png"
                download
                className="flex-1 text-center py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
              >
                Download PDF/Image
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}