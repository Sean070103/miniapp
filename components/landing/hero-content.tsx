import { ConnectWallet } from "@/components/auth/connect-wallet"

interface HeroContentProps {
  onConnect: (address: string) => void
  title?: string
}

export function HeroContent({ onConnect, title = "Daily Base" }: HeroContentProps) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
      <div className="text-center pixel-font">
        <h1 
          className="text-[40px] sm:text-[56px] md:text-[72px] lg:text-[96px] leading-[1.1] font-bold animate-fade-in-up text-white"
          style={{ 
            fontFamily: "'Press Start 2P', monospace",
            textShadow: '2px 2px 6px rgba(0,0,0,0.35)',
            lineHeight: '1.2'
          }}
        >
          {title}
        </h1>
        <div className="mt-6 sm:mt-8 animate-fade-in-delayed">
          <ConnectWallet onConnect={onConnect} />
        </div>
      </div>
    </div>
  )
}
