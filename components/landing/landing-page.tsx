import { BackgroundEffects } from "./background-effects"
import { HeroContent } from "./hero-content"
import React from "react"

interface LandingPageProps {
  onConnect: (address: string) => void
  title?: string
}

export function LandingPage({ 
  onConnect, 
  title = "Daily Base"
}: LandingPageProps) {
  const [mode, setMode] = React.useState<'day' | 'night'>(() => {
    if (typeof window === 'undefined') return 'day'
    return (localStorage.getItem('db-landing-mode') as 'day' | 'night') || 'day'
  })

  const toggleMode = () => {
    const next = mode === 'day' ? 'night' : 'day'
    setMode(next)
    if (typeof window !== 'undefined') localStorage.setItem('db-landing-mode', next)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* System-themed Background */}
      <BackgroundEffects mode={mode} />
      
      {/* Content */}
      <HeroContent onConnect={onConnect} title={title} />

      {/* Day/Night Toggle */}
      <button
        onClick={toggleMode}
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 border border-white/30 text-white text-xs sm:text-sm backdrop-blur-sm hover:bg-white/20 transition-all"
      >
        {mode === 'day' ? 'Night Mode' : 'Day Mode'}
      </button>

      {/* Dirt positioned to fill the gap up to the measurement line */}
      <div className="absolute bottom-0 left-0 right-0 z-30 w-full h-[60px] sm:h-[80px] md:h-[100px] lg:h-[120px] overflow-hidden">
        {/* First dirt layer */}
        <div
          className="absolute bottom-0 left-0 w-full h-full"
          style={{
            backgroundImage: "url('/landing page/dirt.png')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "100% 100%",
            backgroundPosition: "bottom",
            imageRendering: "pixelated",
            width: "100vw",
            minWidth: "100vw",
            marginTop: "-8px",
            pointerEvents: "none",
          }}
        />
        
        {/* Second dirt layer - offset to fill gaps */}
        <div
          className="absolute bottom-0 left-0 w-full h-full"
          style={{
            backgroundImage: "url('/landing page/dirt.png')",
            backgroundRepeat: "repeat-x",
            backgroundSize: "100% 100%",
            backgroundPosition: "bottom",
            imageRendering: "pixelated",
            width: "100vw",
            minWidth: "100vw",
            marginTop: "-8px",
            marginLeft: "-50px",
            opacity: "0.9",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Jeep positioned on the grass with enhanced shake while driving */}
      <div 
        className="absolute bottom-1 sm:bottom-2 md:bottom-3 lg:bottom-4 z-40"
        style={{
          animation: 'driveWithShake 20s linear infinite',
        }}
      >
        <img 
          src="/landing page/jeep.png" 
          alt="Jeep vehicle" 
          className="h-20 sm:h-32 md:h-40 lg:h-48 w-auto"
          style={{ 
            imageRendering: "pixelated",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
          }}
        />
      </div>

      <style jsx>{`
        @keyframes driveWithShake {
          0% {
            transform: translateX(-200px) translateY(0px) rotate(0deg);
            opacity: 0;
          }
          3% {
            transform: translateX(0px) translateY(0px) rotate(0deg);
            opacity: 1;
          }
          8% {
            transform: translateX(100px) translateY(-2px) rotate(0.5deg);
            opacity: 1;
          }
          15% {
            transform: translateX(200px) translateY(1px) rotate(-0.3deg);
            opacity: 1;
          }
          22% {
            transform: translateX(300px) translateY(-1px) rotate(0.2deg);
            opacity: 1;
          }
          30% {
            transform: translateX(400px) translateY(2px) rotate(-0.4deg);
            opacity: 1;
          }
          40% {
            transform: translateX(500px) translateY(-1px) rotate(0.3deg);
            opacity: 1;
          }
          50% {
            transform: translateX(600px) translateY(1px) rotate(-0.2deg);
            opacity: 1;
          }
          60% {
            transform: translateX(700px) translateY(-2px) rotate(0.4deg);
            opacity: 1;
          }
          70% {
            transform: translateX(800px) translateY(1px) rotate(-0.3deg);
            opacity: 1;
          }
          80% {
            transform: translateX(900px) translateY(-1px) rotate(0.2deg);
            opacity: 1;
          }
          90% {
            transform: translateX(1000px) translateY(2px) rotate(-0.5deg);
            opacity: 1;
          }
          95% {
            transform: translateX(calc(100vw + 100px)) translateY(0px) rotate(0deg);
            opacity: 0;
          }
          100% {
            transform: translateX(-200px) translateY(0px) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
