export default function Countdown({ nextPrayer, countdown }) {
  return (
    <section className="bg-black/20 backdrop-blur-md rounded-2xl p-8 mb-10 text-center shadow-2xl border border-amber-400/30">
      <h2 className="text-xl md:text-2xl text-amber-300 uppercase tracking-widest font-semibold">
        Time until next Salah
      </h2>
      <p className="text-4xl md:text-5xl font-bold my-3 text-white">
        {nextPrayer ? nextPrayer.name : 'Loading...'}
      </p>
      <p className="text-6xl md:text-8xl font-mono font-bold text-amber-200 tracking-tighter">
        {countdown}
      </p>
    </section>
  );
}
