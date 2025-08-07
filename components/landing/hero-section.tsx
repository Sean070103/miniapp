import { Card, CardContent } from "@/components/ui/card"
import { ConnectWallet } from "@/components/auth/connect-wallet"

interface HeroSectionProps {
  onConnect: (address: string) => void
}

export function HeroSection({ onConnect }: HeroSectionProps) {
     const exampleEntries = [
     { color: "from-gray-600 to-gray-800", text: "Bought my first NFT on Base", icon: "🎨" },
     { color: "from-gray-700 to-gray-900", text: "Attended Base meetup", icon: "🎪" },
     { color: "from-gray-800 to-black", text: "Learned about Base L2", icon: "📚" },
     { color: "from-gray-500 to-gray-700", text: "Earned Base rewards", icon: "🎁" }
   ]

  return (
    <div className="max-w-7xl mx-auto mb-24">
             <Card className="border-0 shadow-2xl bg-white overflow-hidden">
         <CardContent className="p-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                                 <h2 className="text-5xl font-bold leading-tight text-black">
                   Track Your
                   <span className="block text-gradient">
                     Daily Activities
                   </span>
                 </h2>
                                 <p className="text-xl text-black leading-relaxed max-w-lg font-medium">
                   Whether you're building, trading, learning, or exploring Web3 — 
                   document your daily crypto activities and build meaningful streaks on Base.
                 </p>
              </div>
              <ConnectWallet onConnect={onConnect} />
            </div>
            <div className="relative">
                             <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
                 <div className="space-y-6">
                   {exampleEntries.map((item, index) => (
                     <div 
                       key={index} 
                       className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 transition-all duration-300 hover:scale-105 group"
                     >
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                                             <span className="text-black font-semibold text-lg">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
