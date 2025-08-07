import { Badge } from "@/components/ui/badge"

export function ActivityTypes() {
  const activities = [
    { icon: "💱", title: "DeFi on Base", desc: "Swaps, yields, lending, staking", color: "from-blue-400 to-blue-600" },
    { icon: "🖼️", title: "Base NFTs", desc: "Mints, trades, collections", color: "from-blue-500 to-blue-700" },
    { icon: "🎪", title: "Base Events", desc: "Meetups, conferences, workshops", color: "from-blue-300 to-blue-500" },
    { icon: "📚", title: "Learning Base", desc: "Articles, tutorials, documentation", color: "from-blue-600 to-blue-800" },
    { icon: "🎁", title: "Base Rewards", desc: "Airdrops, incentives, achievements", color: "from-blue-200 to-blue-400" },
    { icon: "🏛️", title: "Base Governance", desc: "Proposals, voting, participation", color: "from-blue-700 to-blue-900" }
  ]

  return (
    <div className="max-w-6xl mx-auto mb-24">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-white mb-6">What Can You Journal?</h3>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">Document every aspect of your Base journey</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activities.map((item, index) => (
          <div key={index} className="group p-8 rounded-3xl hover:scale-105 transition-all">
            <Badge variant="blue" className="w-16 h-16 flex items-center justify-center text-3xl mb-6">
              {item.icon}
            </Badge>
            <h4 className="font-bold text-blue-700 text-xl mb-3">{item.title}</h4>
            <p className="text-blue-600 text-lg leading-relaxed font-semibold">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
