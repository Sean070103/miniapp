interface LandscapeFooterProps {
  jeepSize?: number
  dirtHeight?: number
  jeepPosition?: 'left' | 'center' | 'right'
}

export function LandscapeFooter({ 
  jeepSize = 180, 
  dirtHeight = 120, 
  jeepPosition = 'left' 
}: LandscapeFooterProps) {
  const getJeepPosition = () => {
    switch (jeepPosition) {
      case 'left': return 'left-1/6'
      case 'center': return 'left-1/2'
      case 'right': return 'left-5/6'
      default: return 'left-1/6'
    }
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      {/* Main dirt surface */}
      <div className="relative">
        <img 
          src="/landing%20page/dirt.png" 
          alt="Dirt texture" 
          className="w-full h-auto object-cover"
          style={{ 
            maxHeight: `${dirtHeight}px`,
            objectPosition: 'center bottom',
            display: 'block',
            imageRendering: 'pixelated'
          }}
        />
        
        {/* Jeep positioned on the dirt surface */}
        <div className={`absolute bottom-0 ${getJeepPosition()} transform -translate-x-1/2`} style={{ bottom: '40px' }}>
          <img 
            src="/landing%20page/jeep.png" 
            alt="Jeep vehicle" 
            className="h-auto"
            style={{ 
              height: `${jeepSize}px`,
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            }}
          />
        </div>
      </div>
    </div>
  )
}
