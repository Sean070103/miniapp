import { ConnectWallet } from "@/components/auth/connect-wallet"

interface HeroContentProps {
  onConnect: (address: string) => void
  title?: string
}

export function HeroContent({ onConnect, title = "Daily Base" }: HeroContentProps) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center container-mobile">
      <div className="text-center space-responsive-md pixel-font">
        <h1 
          className="text-responsive-2xl sm:text-responsive-3xl md:text-responsive-4xl lg:text-responsive-5xl font-bold animate-fade-in-up bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent"
          style={{ 
            fontFamily: "'Press Start 2P', monospace",
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
