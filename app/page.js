'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from './components/Header';
import Countdown from './components/Countdown';
import Footer from './components/Footer';
import { Sunrise, Sun, Cloudy, Sunset, Moon } from 'lucide-react';

const SunTimes = dynamic( () => import( './components/SunTimes' ), { ssr: false } );

export default function Page ()
{
  const prayerTimesData = {
    fajr: { adhan: "06:25", iqama: "06:35" },
    dhuhr: { adhan: "12:50", iqama: "13:00" },
    asr: { adhan: "15:35", iqama: "15:45" },
    maghrib: { adhan: null, iqama: null }, // dynamic
    isha: { adhan: "19:25", iqama: "19:35" },
    jummah: { adhan: "13:10", iqama: "13:45" },
  };

  const [ currentTime, setCurrentTime ] = useState( new Date() );
  const [ nextIqama, setNextIqama ] = useState( null );
  const [ countdown, setCountdown ] = useState( '' );
  const [ isJummahDay, setIsJummahDay ] = useState( false );
  const [ sunsetTime, setSunsetTime ] = useState( null );

  const parseTime = ( timeStr ) =>
  {
    if ( !timeStr ) return null;
    const [ h, m ] = timeStr.split( ':' );
    const d = new Date();
    d.setHours( parseInt( h ), parseInt( m ), 0, 0 );
    return d;
  };

  const formatPrayerName = ( name ) => isJummahDay && name === 'dhuhr' ? "Jumu'ah" : name.charAt( 0 ).toUpperCase() + name.slice( 1 );

  // Update current time every second
  useEffect( () =>
  {
    const timer = setInterval( () => setCurrentTime( new Date() ), 1000 );
    return () => clearInterval( timer );
  }, [] );

  // Compute dynamic sunset for Maghrib
  useEffect( () =>
  {
    if ( navigator.geolocation )
    {
      navigator.geolocation.getCurrentPosition( ( { coords } ) =>
      {
        const { latitude, longitude } = coords;
        import( 'suncalc' ).then( SunCalc =>
        {
          const times = SunCalc.getTimes( new Date(), latitude, longitude );
          setSunsetTime( times.sunset );
        } );
      } );
    }
  }, [] );

  // Countdown & next Iqama logic
  useEffect( () =>
  {
    const now = new Date();
    const isJummah = now.getDay() === 5;
    setIsJummahDay( isJummah );

    const dailyPrayers = isJummah ? { ...prayerTimesData, dhuhr: prayerTimesData.jummah } : prayerTimesData;

    const iqamaEvents = Object.entries( dailyPrayers )
      .filter( ( [ n ] ) => n !== 'jummah' )
      .map( ( [ n, t ] ) =>
      {
        let adhanTime, iqamaTime;
        if ( n === 'maghrib' && sunsetTime )
        {
          // Set Adhan 2 minutes after sunset
          adhanTime = new Date( sunsetTime.getTime() + 2 * 60 * 1000 );

          // Set Iqama 1 minute after Adhan
          iqamaTime = new Date( adhanTime.getTime() + 1 * 60 * 1000 );
        } else
        {
          adhanTime = parseTime( t.adhan );
          iqamaTime = parseTime( t.iqama );
        }
        return { name: `${ formatPrayerName( n ) } Iqama`, time: iqamaTime, adhanTime, prayer: n };
      } )
      .sort( ( a, b ) => a.time - b.time );

    let nextEvent = iqamaEvents.find( p => p.time > now );
    if ( !nextEvent )
    {
      const tomorrowFajrIqama = parseTime( prayerTimesData.fajr.iqama );
      tomorrowFajrIqama.setDate( tomorrowFajrIqama.getDate() + 1 );
      nextEvent = { name: 'Fajr Iqama', time: tomorrowFajrIqama };
    }

    setNextIqama( nextEvent );

    const diff = nextEvent.time - now;
    const hours = Math.floor( diff / ( 1000 * 60 * 60 ) );
    const minutes = Math.floor( ( diff % ( 1000 * 60 * 60 ) ) / ( 1000 * 60 ) );
    const seconds = Math.floor( ( diff % ( 1000 * 60 ) ) / 1000 );
    setCountdown( `${ hours }:${ String( minutes ).padStart( 2, '0' ) }:${ String( seconds ).padStart( 2, '0' ) }` );
  }, [ currentTime, sunsetTime ] );

  const prayerIcons = {
    fajr: <Sunrise className="w-10 h-10 md:w-12 md:h-12 text-amber-100/80" />,
    dhuhr: <Sun className="w-10 h-10 md:w-12 md:h-12 text-amber-100/80" />,
    jummah: <Sun className="w-10 h-10 md:w-12 md:h-12 text-amber-100/80" />,
    asr: <Cloudy className="w-10 h-10 md:w-12 md:h-12 text-amber-100/80" />,
    maghrib: <Sunset className="w-10 h-10 md:w-12 md:h-12 text-amber-100/80" />,
    isha: <Moon className="w-10 h-10 md:w-12 md:h-12 text-amber-100/80" />,
  };

  const displayPrayers = isJummahDay ? [ 'fajr', 'jummah', 'asr', 'maghrib', 'isha' ] : [ 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha' ];

  // Elegant PrayerCard inline design (NOW WITH DARK BACKGROUND)
  const PrayerCard = ( { prayer, times, icon } ) =>
  {
    const formatTime = ( time ) =>
    {
      if ( !time ) return '--:--';
      if ( typeof time === 'string' )
      {
        const [ h, m ] = time.split( ':' );
        const date = new Date();
        date.setHours( parseInt( h ), parseInt( m ), 0, 0 );
        return date.toLocaleTimeString( [], { hour: 'numeric', minute: '2-digit', hour12: true } );
      }
      return time.toLocaleTimeString( [], { hour: 'numeric', minute: '2-digit', hour12: true } );
    };

    return (
      <div className="
  flex flex-col items-center p-6
  /* Deep Dark Green Gradient */
  bg-gradient-to-br from-green-950 via-green-900 to-green-800
  border border-green-800/50 rounded-xl
  shadow-2xl shadow-black/70
  hover:shadow-green-600/40 transform hover:scale-[1.02]
  transition-all duration-300 ease-in-out
">

        <div className="mb-4 text-amber-00 text-3xl p-2 rounded-full bg-amber-500/20">
          { icon }
        </div>
        <h2 className="text-3xl font-sans font-extrabold text-white mb-4 tracking-wider uppercase">
          { formatPrayerName( prayer ) }
        </h2>

        {/* Times Grid */ }
        <div className="
          w-full grid grid-cols-2 gap-x-4 gap-y-2
          text-white text-lg md:text-xl font-medium
          text-center
        ">
          <p className="col-span-1 text-gray-400">Adhan</p>
          <p className="col-span-1 text-amber-300 font-extrabold tracking-wider">
            <span className="font-bold">{ formatTime( times?.adhan ) }</span>
          </p>

          <div className="col-span-2 h-[1px] bg-gray-200 my-1"></div>

          <p className="col-span-1 text-gray-400">Iqama</p>
          <p className="col-span-1 text-amber-300 font-extrabold tracking-wider">
            <span className="font-bold">{ formatTime( times?.iqama ) }</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <main className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center p-4">
      <Header currentTime={ currentTime } />
      <Countdown nextPrayer={ nextIqama } countdown={ countdown } />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 w-full">
        { displayPrayers.map( ( p ) =>
        {
          let times;
          if ( p === 'maghrib' && sunsetTime )
          {
            const adhanTime = new Date( sunsetTime.getTime() + 1 * 60 * 1000 );
            const iqamaTime = new Date( adhanTime.getTime() + 1 * 60 * 1000 );
            times = { adhan: adhanTime, iqama: iqamaTime };
          } else if ( p === 'maghrib' )
          {
            times = { adhan: null, iqama: null };
          } else
          {
            // Use jummah data for dhuhr slot on Friday
            const prayerKey = p === 'jummah' ? 'dhuhr' : p;
            times = prayerTimesData[ prayerKey ];
          }

          return <PrayerCard key={ p } prayer={ p } times={ times } icon={ prayerIcons[ p ] } />;
        } ) }
      </section>

      <Footer />
    </main>
  );
}