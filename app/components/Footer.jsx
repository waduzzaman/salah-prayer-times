"use client";

import { BookOpen, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full max-w-5xl mx-auto mt-16 mb-12 px-4">
      <div className="bg-white border border-emerald-100 rounded-[2rem] p-8 md:p-12 shadow-sm flex flex-col items-center text-center">
        
        {/* Decorative Icon */}
        <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600">
          <BookOpen className="w-6 h-6" />
        </div>

        {/* Verse Section */}
        <div className="flex flex-col items-center max-w-2xl">
          <blockquote className="text-xl sm:text-2xl font-serif italic text-slate-700 leading-relaxed mb-6">
            "And establish prayer and give zakah and bow with those who bow [in worship and obedience]."
          </blockquote>
          
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-emerald-200"></div>
            <cite className="text-emerald-700 font-bold uppercase tracking-widest text-xs sm:text-sm not-italic">
              Qur'an 2:43
            </cite>
            <div className="h-px w-8 bg-emerald-200"></div>
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="w-full mt-12 pt-8 border-t border-emerald-50 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs sm:text-sm font-medium">
          <p>© {new Date().getFullYear()} 30 Tuxedo Musallah • Toronto</p>
          
          <div className="flex items-center gap-1 text-emerald-600/60">
            <span>Built with</span>
            <Heart className="w-3 h-3 fill-current" />
            <span>for the Ummah</span>
          </div>
        </div>
      </div>
    </footer>
  );
}