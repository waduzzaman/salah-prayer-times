"use client";

import React, { useState, useEffect } from "react";
import { Sunrise, Sunset, MapPin, CalendarDays } from "lucide-react";
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

        setSunrise(
          times.sunrise.toLocaleTimeString("en-CA", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        );
        setSunset(
          times.sunset.toLocaleTimeString("en-CA", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        );

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setLocation(
            data.address?.city ||
              data.address?.town ||
              data.address?.suburb ||
              "Toronto"
          );
        } catch {
          setLocation("Toronto");
        }
      },
      () => setLocation("Toronto")
    );
  }, [mounted]);

  return (
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
        <div className="flex items-center justify-center gap-3 text-emerald-800 font-bold text-base sm:text-xl border-t border-emerald-50 pt-8">
          <CalendarDays className="w-5 h-5 text-emerald-600" />
          <span>
            {currentTime
              ? currentTime.toLocaleDateString("en-CA", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : ""}
          </span>
        </div>
      </div>
    </header>
  );
}