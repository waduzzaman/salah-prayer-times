"use client";

import { Sunrise, Sunset, MapPin, CalendarDays } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import SunCalc from "suncalc";

export default function Header({ currentTime }) {
  const [sunrise, setSunrise] = useState("");
  const [sunset, setSunset] = useState("");
  const [location, setLocation] = useState("Loading location...");

  // Calculate Hijri Date natively (Instant & Reliable)
  const hijriDate = useMemo(() => {
    try {
      const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const parts = formatter.formatToParts(currentTime);
      const d = parts.find(p => p.type === 'day').value;
      const m = parts.find(p => p.type === 'month').value;
      const y = parts.find(p => p.type === 'year').value;
      return `${d} ${m} ${y} AH`;
    } catch (e) {
      return "";
    }
  }, [currentTime]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude, longitude } = coords;
      const times = SunCalc.getTimes(new Date(), latitude, longitude);

      setSunrise(times.sunrise.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }));
      setSunset(times.sunset.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }));

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        setLocation(data.address.city || data.address.town || data.address.village || data.address.state || "Toronto");
      } catch (err) {
        console.error(err);
      }
    });
  }, []);

  return (
    <header className="w-full max-w-5xl mx-auto mb-12">
      {/* Top Metadata Bar */}
      <div className="flex justify-between items-center bg-emerald-50/50 border-b border-emerald-100 px-6 py-3 rounded-t-3xl text-emerald-900">
        <div className="flex items-center gap-2 font-medium">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="text-sm tracking-wide">{location}</span>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <Sunrise className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold">{sunrise || "--:--"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold">{sunset || "--:--"}</span>
          </div>
        </div>
      </div>

      {/* Main Brand & Time Section */}
      <div className="bg-white border-x border-b border-emerald-100 rounded-b-3xl shadow-sm p-8 flex flex-col items-center text-center">
        
        {/* Arabic Calligraphy Style Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-emerald-900 mb-6 drop-shadow-sm">
          بِسْمِ ٱللّٰهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </h1>

        <div className="w-24 h-1 bg-emerald-100 rounded-full mb-6"></div>

        <p className="text-xl bg-emerald-100 p-2 rounded-sm outline-1 sm:text-2xl font-bold tracking-[0.2em] text-slate-800 uppercase mb-4">
          30 Tuxedo Musallah
        </p>

 {/* Elegant Glass-Style Clock Box */}
<div className="relative w-full max-w-2xl mx-auto group">
  {/* Soft ambient glow */}
  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
  
  <div className="relative bg-white border border-emerald-100 px-6 py-8 sm:px-12 sm:py-10 rounded-[2rem] shadow-xl shadow-emerald-900/5 overflow-hidden">
    
    {/* Decorative Background Element */}
    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>

    {/* Small Elegant Label */}
    <div className="flex justify-center mb-4">
      <span className="bg-emerald-100/50 text-emerald-800 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-emerald-200/50">
        Current Local Time
      </span>
    </div>

    {/* The Time Display */}
    <div className="flex justify-center items-baseline gap-1 sm:gap-2 text-emerald-950">
      <p className="text-5xl sm:text-7xl md:text-8xl font-mono font-bold tracking-tighter tabular-nums">
        {currentTime.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).split(' ')[0]} 
      </p>
      
      {/* AM/PM styled smaller for elegance */}
      <span className="text-xl sm:text-3xl font-bold text-emerald-700/60 uppercase">
        {currentTime.toLocaleTimeString([], { hour12: true }).split(' ')[1]}
      </span>
    </div>
  </div>
</div>

        {/* Combined Date Display (English & Hijri) */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-emerald-800 font-bold text-lg sm:text-xl">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            <span>
              {currentTime.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          
          {/* Elegant Dot Separator (Hidden on tiny screens) */}
          <span className="hidden sm:inline text-emerald-300">•</span>
          
          <span className="text-emerald-700/80 font-medium">
            {hijriDate}
          </span>
        </div>
      </div>
    </header>
  );
}