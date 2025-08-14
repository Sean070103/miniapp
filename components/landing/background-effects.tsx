export function BackgroundEffects() {
  return (
    <div className="absolute inset-0 bg-blue-400">
      {/* Pixelated clouds - positioned to match the image */}
      <div 
        className="absolute top-2 sm:top-1 md:top-2 left-2 sm:left-6 md:left-8"
        style={{ animation: 'cloudShake 4s ease-in-out infinite' }}
      >
        <img 
          src="/landing%20page/cloud.png" 
          alt="Cloud" 
          className="h-36 sm:h-40 md:h-52 w-auto opacity-90"
          style={{ 
            imageRendering: 'pixelated'
          }}
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
          style={{ 
            imageRendering: 'pixelated'
          }}
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
          style={{ 
            imageRendering: 'pixelated'
          }}
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
          style={{ 
            imageRendering: 'pixelated'
          }}
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
          style={{ 
            imageRendering: 'pixelated'
          }}
        />
      </div>

      <style jsx>{`
        @keyframes cloudShake {
          0% {
            transform: translateX(0px) translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateX(2px) translateY(-1px) rotate(0.2deg);
          }
          50% {
            transform: translateX(-1px) translateY(1px) rotate(-0.1deg);
          }
          75% {
            transform: translateX(1px) translateY(-0.5px) rotate(0.1deg);
          }
          100% {
            transform: translateX(0px) translateY(0px) rotate(0deg);
          }
        }
      `}</style>
    </div>
  )
}
