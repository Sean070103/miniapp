import { ConnectWallet } from "@/components/auth/connect-wallet"

interface HeroContentProps {
  onConnect: (address: string) => void
  title?: string
}

export function HeroContent({ onConnect, title = "Daily Base" }: HeroContentProps) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-3 sm:px-6 lg:px-8">
      <div className="text-center space-y-3 sm:space-y-6 lg:space-y-8">
        <h1 
          className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white animate-fade-in-up pixelated-text"
          style={{ 
            fontFamily: "'Jersey 10', monospace",
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
            lineHeight: '1.2'
          }}
        >
          {title}
        </h1>
        <div className="animate-fade-in-delayed">
          <ConnectWallet onConnect={onConnect} />
        </div>
      </div>
    </div>
  )
}
