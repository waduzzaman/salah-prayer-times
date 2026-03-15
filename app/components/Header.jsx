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
      ✅ Hijri Date (Reliable Mobile Fix)
  ------------------------------ */
  const hijriDate = useMemo(() => {
    if (!currentTime) return "";

    try {
      // List of locales to try. Mobile browsers vary in support for 'umalqura'.
      // 'ar-SA-u-ca-islamic' is the most widely supported fallback for Hijri.
      const locales = [
        "en-u-ca-islamic-umalqura-nu-latn", 
        "en-u-ca-islamic-nu-latn", 
        "ar-SA-u-ca-islamic"
      ];
      
      let formatter;
      
      for (const loc of locales) {
        try {
          const testFormatter = new Intl.DateTimeFormat(loc, {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          
          const parts = testFormatter.formatToParts(currentTime);
          const yearVal = parseInt(parts.find(p => p.type === 'year')?.value || "0");
          
          // Validation: If it returns 2026, it failed and fell back to Gregorian. 
          // Hijri year should be around 1447 right now.
          if (yearVal > 1400 && yearVal < 1500) {
            formatter = testFormatter;
            break;
          }
        } catch (e) { continue; }
      }

      if (!formatter) return "";

      const parts = formatter.formatToParts(currentTime);
      const day = parts.find((p) => p.type === "day")?.value ?? "";
      const month = parts.find((p) => p.type === "month")?.value ?? "";
      const year = parts.find((p) => p.type === "year")?.value ?? "";

      return `${day} ${month} ${year} AH`;
    } catch {
      return "";
    }
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
        {/* Top Info Bar */}
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

        {/* Main Content */}
        <div className="bg-white border-x border-b border-emerald-100 rounded-b-2xl shadow-sm p-6 sm:p-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-emerald-900 mb-6 leading-relaxed">
            بِسْمِ ٱللّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </h1>

          <div className="inline-block bg-emerald-100 px-6 py-2 rounded-full font-bold tracking-widest text-emerald-800 uppercase mb-8 text-sm sm:text-base border border-emerald-200">
            30 Tuxedo Musallah
          </div>

          {/* Live Clock */}
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

          {/* Dates Section - Stacked on Mobile, Row on Desktop */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-emerald-800 font-bold text-sm sm:text-lg border-t border-emerald-50 pt-6">
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

            <span className="text-emerald-700 bg-emerald-50 sm:bg-transparent px-3 py-1 rounded-lg sm:p-0">
              {hijriDate}
            </span>
          </div>

          {/* Calendar CTA */}
          <div className="mt-10">
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="group relative inline-flex items-center justify-center rounded-xl bg-emerald-600 px-8 py-4 text-sm sm:text-base font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-lg active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                View Ramadan 2026 Calendar
              </span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal with Backdrop Blur */}
      {showCalendar && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-3xl p-4 sm:p-8 relative shadow-2xl animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              ✕
            </button>

            <div className="relative w-full h-[60vh] sm:h-[70vh] mb-6">
              <Image
                src="/ramadan-2026.png"
                alt="30 Tuxedo Musallah Ramadan Calendar"
                fill
                className="object-contain"
                priority
              />
            </div>

            <a
              href="/ramadan-2026.png"
              download
              className="flex items-center justify-center w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-md hover:shadow-xl"
            >
              Download Calendar (Full Resolution)
            </a>
          </div>
        </div>
      )}
    </>
  );
}