import React from "react"

interface BackgroundEffectsProps {
  mode?: 'day' | 'night'
}

export function BackgroundEffects({ mode = 'day' }: BackgroundEffectsProps) {
  return (
    <div className="absolute inset-0">
      {/* Sky gradient changes with mode */}
      <div className={`absolute inset-0 ${mode === 'night' ? 'bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800' : 'bg-blue-400'}`} />
      {mode === 'night' && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 45% at 50% 40%, rgba(56,189,248,0.12), rgba(59,130,246,0.06) 55%, transparent 70%)',
          }}
        />
      )}

      {/* Sun or Moon */}
      {mode === 'day' ? (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-0" style={{ animation: 'sunPulse 6s ease-in-out infinite' }}>
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-yellow-300 shadow-[0_0_40px_rgba(255,221,87,0.7)]" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute inset-0 rounded-full bg-yellow-200/40 blur-xl" />
          </div>
        </div>
      ) : (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20" style={{ animation: 'moonPulse 8s ease-in-out infinite' }}>
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-slate-200 shadow-[0_0_30px_rgba(200,220,255,0.5)]" style={{ imageRendering: 'pixelated' }} />
            <div className="absolute inset-0 rounded-full bg-white/20 blur-lg" />
          </div>
        </div>
      )}

      {/* Pixelated clouds - only in day mode */}
      {mode === 'day' && (
        <>
          <div 
            className="absolute top-2 sm:top-1 md:top-2 left-2 sm:left-6 md:left-8"
            style={{ animation: 'cloudShake 4s ease-in-out infinite' }}
          >
            <img 
              src="/landing%20page/cloud.png" 
              alt="Cloud" 
              className="h-36 sm:h-40 md:h-52 w-auto opacity-90"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div 
            className="absolute top-6 sm:top-2 md:top-3 left-24 sm:left-40 md:left-48 hidden sm:block"
            style={{ animation: 'cloudShake 3.5s ease-in-out infinite' }}
          >
            <img 
              src="/landing%20page/cloud.png" 
              alt="Cloud" 
              className="h-28 sm:h-32 md:h-40 w-auto opacity-85"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div 
            className="absolute top-4 sm:top-3 md:top-4 left-1/2 transform -translate-x-1/2"
            style={{ animation: 'cloudShake 4.5s ease-in-out infinite' }}
          >
            <img 
              src="/landing%20page/cloud.png" 
              alt="Cloud" 
              className="h-32 sm:h-36 md:h-44 w-auto opacity-80"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div 
            className="absolute top-8 sm:top-1 md:top-2 right-2 sm:right-40 md:right-48"
            style={{ animation: 'cloudShake 3s ease-in-out infinite' }}
          >
            <img 
              src="/landing%20page/cloud.png" 
              alt="Cloud" 
              className="h-40 sm:h-42 md:h-54 w-auto opacity-85"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div 
            className="absolute top-12 sm:top-4 md:top-5 right-6 sm:right-12 md:right-16 hidden sm:block"
            style={{ animation: 'cloudShake 3.8s ease-in-out infinite' }}
          >
            <img 
              src="/landing%20page/cloud.png" 
              alt="Cloud" 
              className="h-24 sm:h-28 md:h-32 w-auto opacity-80"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </>
      )}

      {/* Stars and Northern Lights - only in night mode */}
      {mode === 'night' && (
        <>
          {/* Aurora (Northern Lights) - behind stars and moon */}
          <div className="absolute top-20 left-0 right-0 h-56 sm:h-64 md:h-72 z-0 pointer-events-none overflow-hidden">
            <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(16,185,129,0.35)"/>
                  <stop offset="50%" stopColor="rgba(59,130,246,0.28)"/>
                  <stop offset="100%" stopColor="rgba(139,92,246,0.26)"/>
                </linearGradient>
                <linearGradient id="ag2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(56,189,248,0.28)"/>
                  <stop offset="50%" stopColor="rgba(20,184,166,0.30)"/>
                  <stop offset="100%" stopColor="rgba(99,102,241,0.24)"/>
                </linearGradient>
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="25" result="b"/>
                  <feBlend in="SourceGraphic" in2="b" mode="screen"/>
                </filter>
              </defs>
              <g className="aurora-group">
                <path d="M0,300 C180,230 360,260 560,210 C780,160 960,240 1200,190" stroke="url(#ag1)" strokeWidth="90" strokeLinecap="round" fill="none" filter="url(#softGlow)" opacity="0.35"/>
                <path d="M0,260 C220,200 420,240 640,190 C880,140 1040,220 1200,170" stroke="url(#ag2)" strokeWidth="70" strokeLinecap="round" fill="none" filter="url(#softGlow)" opacity="0.30"/>
                <path d="M0,320 C200,260 380,280 600,230 C840,180 1020,250 1200,210" stroke="url(#ag2)" strokeWidth="50" strokeLinecap="round" fill="none" filter="url(#softGlow)" opacity="0.26"/>
              </g>
            </svg>
          </div>

          {/* Stars - above aurora */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Base scattered stars */}
            <div className="absolute inset-0 opacity-35" style={{ backgroundImage: `radial-gradient(2px 2px at 12% 26%, rgba(255,255,255,0.95), transparent 42%), radial-gradient(1.4px 1.4px at 28% 12%, rgba(255,255,255,0.85), transparent 42%), radial-gradient(1.8px 1.8px at 52% 18%, rgba(255,255,255,0.9), transparent 42%), radial-gradient(1.5px 1.5px at 74% 30%, rgba(255,255,255,0.85), transparent 42%), radial-gradient(1.2px 1.2px at 86% 22%, rgba(255,255,255,0.8), transparent 42%), radial-gradient(1.2px 1.2px at 18% 64%, rgba(255,255,255,0.8), transparent 42%), radial-gradient(1.5px 1.5px at 42% 72%, rgba(255,255,255,0.85), transparent 42%), radial-gradient(1.6px 1.6px at 66% 68%, rgba(255,255,255,0.9), transparent 42%), radial-gradient(1.4px 1.4px at 82% 78%, rgba(255,255,255,0.8), transparent 42%)` }} />

            {/* Twinkling layer A */}
            <div className="absolute inset-0 stars-1" style={{ backgroundImage: `radial-gradient(1.2px 1.2px at 8% 40%, rgba(255,255,255,0.85), transparent 50%), radial-gradient(1.4px 1.4px at 22% 52%, rgba(191,219,254,0.9), transparent 50%), radial-gradient(1.2px 1.2px at 38% 28%, rgba(224,231,255,0.9), transparent 50%), radial-gradient(1.4px 1.4px at 58% 44%, rgba(219,234,254,0.9), transparent 50%), radial-gradient(1.2px 1.2px at 72% 20%, rgba(255,255,255,0.9), transparent 50%), radial-gradient(1.4px 1.4px at 90% 36%, rgba(219,234,254,0.85), transparent 50%), radial-gradient(1.2px 1.2px at 30% 80%, rgba(255,255,255,0.9), transparent 50%), radial-gradient(1.4px 1.4px at 64% 82%, rgba(191,219,254,0.85), transparent 50%)` }} />

            {/* Twinkling layer B */}
            <div className="absolute inset-0 stars-2" style={{ backgroundImage: `radial-gradient(1.2px 1.2px at 16% 18%, rgba(255,255,255,0.85), transparent 50%), radial-gradient(1.4px 1.4px at 44% 12%, rgba(219,234,254,0.9), transparent 50%), radial-gradient(1.2px 1.2px at 68% 16%, rgba(224,231,255,0.9), transparent 50%), radial-gradient(1.4px 1.4px at 88% 14%, rgba(191,219,254,0.9), transparent 50%), radial-gradient(1.2px 1.2px at 12% 86%, rgba(255,255,255,0.9), transparent 50%), radial-gradient(1.4px 1.4px at 46% 90%, rgba(219,234,254,0.85), transparent 50%), radial-gradient(1.2px 1.2px at 72% 84%, rgba(255,255,255,0.9), transparent 50%), radial-gradient(1.4px 1.4px at 92% 88%, rgba(191,219,254,0.85), transparent 50%)` }} />
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes cloudShake {
          0% { transform: translateX(0px) translateY(0px) rotate(0deg); }
          25% { transform: translateX(2px) translateY(-1px) rotate(0.2deg); }
          50% { transform: translateX(-1px) translateY(1px) rotate(-0.1deg); }
          75% { transform: translateX(1px) translateY(-0.5px) rotate(0.1deg); }
          100% { transform: translateX(0px) translateY(0px) rotate(0deg); }
        }

        @keyframes sunPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px rgba(255,221,87,0.5)); }
          50% { transform: scale(1.03); filter: drop-shadow(0 0 18px rgba(255,221,87,0.7)); }
        }

        @keyframes moonPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(200,220,255,0.4)); }
          50% { transform: scale(1.02); filter: drop-shadow(0 0 14px rgba(200,220,255,0.6)); }
        }

        /* Star twinkle animations */
        .stars-1 { animation: twinkleA 4.5s ease-in-out infinite; opacity: .55; }
        .stars-2 { animation: twinkleB 6.5s ease-in-out infinite; opacity: .6; }
        @keyframes twinkleA { 0%,100% { opacity: .25 } 50% { opacity: .75 } }
        @keyframes twinkleB { 0%,100% { opacity: .2 } 50% { opacity: .85 } }

        /* Aurora gradients + animation */
        .aurora {
          background: conic-gradient(from 180deg at 50% 50%, rgba(16,185,129,0.35), rgba(56,189,248,0.25), rgba(99,102,241,0.22), rgba(20,184,166,0.3), rgba(16,185,129,0.35));
          animation: auroraWave 14s ease-in-out infinite alternate;
          transform: rotate(8deg);
          mix-blend-mode: soft-light;
          -webkit-mask-image: radial-gradient(120% 80% at 50% 35%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0) 85%);
          mask-image: radial-gradient(120% 80% at 50% 35%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0) 85%);
          filter: blur(50px);
        }

        .aurora-2 {
          background: conic-gradient(from 200deg at 50% 50%, rgba(56,189,248,0.3), rgba(20,184,166,0.34), rgba(59,130,246,0.22), rgba(139,92,246,0.22), rgba(56,189,248,0.3));
          animation: auroraWave 16s ease-in-out infinite alternate-reverse;
          transform: rotate(-6deg);
          mix-blend-mode: soft-light;
          -webkit-mask-image: radial-gradient(120% 80% at 45% 40%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0) 85%);
          mask-image: radial-gradient(120% 80% at 45% 40%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0) 85%);
          filter: blur(55px);
        }

        .aurora-3 {
          background: conic-gradient(from 240deg at 50% 50%, rgba(20,184,166,0.32), rgba(59,130,246,0.24), rgba(139,92,246,0.22), rgba(16,185,129,0.32));
          animation: auroraWave 18s ease-in-out infinite alternate;
          transform: rotate(4deg);
          mix-blend-mode: soft-light;
          -webkit-mask-image: radial-gradient(120% 80% at 55% 35%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0) 85%);
          mask-image: radial-gradient(120% 80% at 55% 35%, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0) 85%);
          filter: blur(60px);
        }

        /* Small scattered aurora blobs */
        .aurora-sm {
          background: conic-gradient(from 180deg at 50% 50%, rgba(16,185,129,0.28), rgba(56,189,248,0.2), rgba(99,102,241,0.18));
          animation: auroraDrift 20s ease-in-out infinite alternate;
          transform: rotate(10deg);
          mix-blend-mode: soft-light;
        }
        .aurora-sm-2 {
          background: conic-gradient(from 200deg at 50% 50%, rgba(56,189,248,0.24), rgba(20,184,166,0.22), rgba(139,92,246,0.18));
          animation: auroraDrift 22s ease-in-out infinite alternate-reverse;
          transform: rotate(-8deg);
          mix-blend-mode: soft-light;
        }
        .aurora-sm-3 {
          background: conic-gradient(from 210deg at 50% 50%, rgba(20,184,166,0.22), rgba(59,130,246,0.2), rgba(99,102,241,0.16));
          animation: auroraDrift 24s ease-in-out infinite alternate;
          transform: rotate(6deg);
          mix-blend-mode: soft-light;
        }
        .aurora-sm-4 {
          background: conic-gradient(from 230deg at 50% 50%, rgba(139,92,246,0.18), rgba(56,189,248,0.2), rgba(16,185,129,0.22));
          animation: auroraDrift 26s ease-in-out infinite alternate-reverse;
          transform: rotate(-5deg);
          mix-blend-mode: soft-light;
        }
        .aurora-sm-5 {
          background: conic-gradient(from 250deg at 50% 50%, rgba(56,189,248,0.2), rgba(139,92,246,0.18), rgba(20,184,166,0.2));
          animation: auroraDrift 28s ease-in-out infinite alternate;
          transform: rotate(4deg);
          mix-blend-mode: soft-light;
        }

        @keyframes auroraDrift {
          0% { transform: translateX(-2%) translateY(0%) rotate(5deg); }
          50% { transform: translateX(2%) translateY(-1%) rotate(7deg); }
          100% { transform: translateX(-1%) translateY(1%) rotate(5deg); }
        }

        @keyframes auroraWave {
          0% { transform: translateX(-3%) rotate(6deg) skewX(2deg); }
          50% { transform: translateX(3%) rotate(8deg) skewX(-2deg); }
          100% { transform: translateX(-2%) rotate(6deg) skewX(1deg); }
        }
      `}</style>
    </div>
  )
}
