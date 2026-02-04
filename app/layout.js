import './globals.css';

export const metadata = {
  title: '30 Tuxedo Musallah | Salah Timer',
  description: 'Elegant Salah and Iqama times for 30 Tuxedo Musallah, Toronto.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 1. Changed text-gray-100 to text-slate-900 for high contrast legibility.
        2. Added selection:bg-emerald-100 for a nice touch when users highlight text.
      */}
      <body className="antialiased bg-slate-50 text-slate-900 selection:bg-emerald-100 relative min-h-screen">
        
        {/* The Background Pattern:
          Lowered opacity to 0.02 so it's barely there—very elegant.
          Used a fixed position so it doesn't move when scrolling.
        */}
        <div 
          className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-[0.02] z-0"
          style={{ backgroundSize: '400px' }} // Controlled size for a "nicher" look
        />

        {/* Main Content:
          Added relative and z-10 to ensure content stays above the background pattern.
        */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}