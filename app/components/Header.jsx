'use client';

import { useState, useEffect } from 'react';
import SunCalc from 'suncalc';

export default function Header({ currentTime }) {
  const [sunrise, setSunrise] = useState('');
  const [sunset, setSunset] = useState('');
  const [location, setLocation] = useState(''); 

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        const { latitude, longitude } = coords;

        // Sunrise & Sunset
        const times = SunCalc.getTimes(new Date(), latitude, longitude);
        setSunrise(times.sunrise.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
        setSunset(times.sunset.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));

        // Reverse geocode
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setLocation(data.address.city || data.address.town || data.address.village || '');
        } catch (err) {
          console.error(err);
        }
      });
    }
  }, []);

  return (
    <header className="relative w-full mb-10">
      {/* Top-right info */}
      <div className="absolute top-0 right-0 mt-2 mr-4 text-right text-amber-200 font-semibold">
        <p>{location}</p>
        <p>Sunrise: {sunrise}</p>
        <p>Sunset: {sunset}</p>
      </div>

      {/* Center content stacked vertically */}
      <div className="flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-white mb-4">Bismillah</h1>
        <p className='text-lg'>30 Tuxedo Musallah</p>

        <p className="text-lg md:text-xl text-amber-200/90 font-mono">
          {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
        </p>

        <p className="text-2xl md:text-3xl text-gray-100 font-mono tracking-wider mt-1">
          {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' , year: 'numeric' })}
        </p>
      </div>
    </header>
  );
}
