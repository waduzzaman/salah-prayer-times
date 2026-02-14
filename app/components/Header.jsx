"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Sunrise, Sunset, MapPin, CalendarDays } from "lucide-react";
import Image from "next/image";
import SunCalc from "suncalc";

export default function Header({ currentTime }) {
  const [sunrise, setSunrise] = useState("");
  const [sunset, setSunset] = useState("");
  const [location, setLocation] = useState("Loading location...");
  const [showCalendar, setShowCalendar] = useState(false);

  /* -----------------------------
      ✅ Hijri Date
  ------------------------------ */
  const hijriDate = useMemo(() => {
    try {
      const formatter = new Intl.DateTimeFormat(
        "en-u-ca-islamic-umalqura-nu-latn",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );

      const parts = formatter.formatToParts(currentTime);
      const day = parts.find((p) => p.type === "day")?.value ?? "";
      const month = parts.find((p) => p.type === "month")?.value ?? "";
      const year = parts.find((p) => p.type === "year")?.value ?? "";

      return `${day} ${month} ${year} AH`;
    } catch (e) {
      return "";
    }
  }, [currentTime]);

  /* -----------------------------
      ✅ Geolocation + SunCalc
  ------------------------------ */
  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocation("Location unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const times = SunCalc.getTimes(new Date(), latitude, longitude);

        setSunrise(times.sunrise.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }));
        setSunset(times.sunset.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }));

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setLocation(data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Toronto");
        } catch {
          setLocation("Toronto");
        }
      },
      () => setLocation("Toronto")
    );
  }, []);

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
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:items-center bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-t-2xl text-emerald-900 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>{location}</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <Sunrise className="w-4 h-4 text-amber-500" />
              <span>{sunrise || "--:--"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sunset className="w-4 h-4 text-orange-500" />
              <span>{sunset || "--:--"}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white border-x border-b border-emerald-100 rounded-b-2xl shadow-sm p-6 sm:p-10 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif text-emerald-900 mb-6">
            بِسْمِ ٱللّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </h1>

          <p className="text-base sm:text-xl bg-emerald-100 px-3 py-2 rounded-md font-semibold tracking-wide text-slate-800 uppercase mb-6">
            30 Tuxedo Musallah
          </p>

          <div className="text-4xl sm:text-6xl md:text-7xl font-mono font-bold text-emerald-950 mb-6">
            {currentTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-emerald-800 font-semibold text-sm sm:text-lg">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
            <span className="hidden sm:inline text-emerald-300">•</span>
            <span className="text-emerald-700/80">{hijriDate}</span>
          </div>

          {/* ✨ SHINING ROTATING BORDER BUTTON 
          */}
          <div className="relative mt-8 inline-block group">
            <button
              type="button"
              onClick={() => setShowCalendar(true)}
              className="relative p-[3px] overflow-hidden rounded-xl focus:outline-none transition-transform active:scale-95"
            >
              {/* The Rotating Background Layer */}
              <span className="absolute inset-[-1000%] animate-border-rotate bg-[conic-gradient(from_90deg_at_50%_50%,#10b981_0%,#d1fae5_50%,#10b981_100%)]" />
              
              {/* The Button Label Layer */}
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-8 py-3 text-sm sm:text-base font-bold text-white backdrop-blur-3xl hover:bg-emerald-700 transition-colors">
                View & Download Ramadan 2026 Calendar
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Modal */}
      {showCalendar && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white w-full max-w-4xl rounded-2xl p-4 sm:p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeModal} className="absolute top-3 right-4 text-gray-500 hover:text-black text-xl">✕</button>
            <div className="relative w-full h-[60vh] sm:h-[70vh]">
              <Image src="/ramadan-2026.png" alt="Ramadan 2026" fill className="object-contain rounded-xl" priority />
            </div>
            <div className="mt-6">
              <a href="/ramadan-2026.png" download className="block w-full text-center px-6 py-3 bg-emerald-600 text-white rounded-xl shadow font-bold hover:bg-emerald-700">
                Download Full Resolution
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}