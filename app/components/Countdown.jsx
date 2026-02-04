export default function Countdown({ nextPrayer, countdown }) {
  return (
    <section
      className="
        bg-white
        border border-emerald-200
        rounded-3xl
        px-6 py-10 sm:px-10 sm:py-14 md:px-16 md:py-20
        text-center
        shadow-lg
      "
    >
      {/* Heading */}
      <h2
        className="
          text-lg sm:text-xl md:text-2xl
          text-emerald-700
          font-medium
          tracking-wide
          mb-6
        "
      >
        Time Remaining Until Next Prayer
      </h2>

      {/* Prayer Name */}
      <p
        className="
          text-4xl sm:text-5xl md:text-6xl lg:text-7xl
          font-semibold uppercase
          text-gray-800
          mb-10
        "
      >
        {nextPrayer ? nextPrayer.name : "Loading..."}
      </p>

      {/* Countdown Timer */}
      <div
        className="
          bg-emerald-50
          border border-emerald-200
          rounded-2xl
          py-8 px-4
        "
      >
        <p
          className="
            font-mono
            text-6xl sm:text-7xl md:text-8xl lg:text-9xl
            font-bold
            text-emerald-900
            tracking-tight
          "
        >
          {countdown}
        </p>

        <p
          className="
            mt-4
            text-base sm:text-lg
            text-emerald-700
          "
        >
          Hours : Minutes : Seconds
        </p>
      </div>
    </section>
  );
}
