import { GlassWater } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Logo */}
      <div className="relative z-10 animate-fade-in">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 gradient-amber rounded-full blur-xl opacity-50 animate-pulse" />
            <GlassWater className="relative w-24 h-24 text-white" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold text-center">
          <span className="text-gradient-amber">Sip</span>
          <span className="text-gradient-purple">Zy</span>
        </h1>
        
        <p className="text-white/60 text-center mt-4 text-sm font-light tracking-wider">Discover. Rate. Share.</p>
      </div>
    </div>
  );
}
