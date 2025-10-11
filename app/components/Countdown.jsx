export default function Countdown({ nextPrayer, countdown }) {
  return (
    <section
      className="
      bg-gradient-to-br from-green-950 via-green-900 to-green-800
      border border-green-800/50 rounded-3xl p-12 mb-12 text-center
      shadow-[0_25px_50px_-12px_rgba(0,0,0,0.85)]
      hover:shadow-green-600/50 transform hover:scale-[1.05]
      transition-all duration-300 ease-in-out
    "
    >
      <h2 className="text-2xl md:text-3xl text-amber-300 uppercase tracking-widest font-semibold mb-4">
        Time until next Salah
      </h2>
      <p className="text-5xl md:text-6xl font-bold my-4 text-white tracking-tight">
        {nextPrayer ? nextPrayer.name : "Loading..."}
      </p>
      <p className="text-7xl md:text-9xl font-mono font-extrabold text-red-500 tracking-tighter drop-shadow-[0_5px_10px_rgba(0,0,0,0.7)]"
      >
        {countdown}
      </p>
    </section>
  );
}
