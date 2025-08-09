import { ConnectWallet } from "@/components/auth/connect-wallet"

interface LandingPageProps {
  onConnect: (address: string) => void
}

export function LandingPage({ onConnect }: LandingPageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* System-themed Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Circuit board pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.2) 2px, transparent 2px),
              radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.2) 2px, transparent 2px)
            `,
            backgroundSize: '40px 40px, 40px 40px, 80px 80px, 80px 80px'
          }}></div>
        </div>
        
        {/* Digital grid lines */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}></div>
        </div>
        
        {/* System nodes */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Data streams */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-300 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-1/2 w-40 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* System status indicators */}
        <div className="absolute top-8 right-8 flex space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Digital readouts */}
        <div className="absolute bottom-8 left-8 text-blue-300 font-mono text-xs opacity-50">
          <div>SYSTEM: ONLINE</div>
          <div>BASE: CONNECTED</div>
        </div>
        
        {/* Hexagonal pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
            `,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center space-y-8">
          <h1 
            className="text-4xl font-bold text-white animate-fade-in-up pixelated-text"
            style={{ 
              fontFamily: "'Press Start 2P', monospace",
              color: 'white'
            }}
          >
            DailyBase
          </h1>
          <div className="animate-fade-in-delayed">
            <ConnectWallet onConnect={onConnect} />
          </div>
        </div>
      </div>
    </div>
  )
}
