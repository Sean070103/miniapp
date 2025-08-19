import { Badge } from "@/components/ui/badge"
import { BookOpen, Sparkles, Star, Zap, TrendingUp } from 'lucide-react'

export function Header() {
     const features = [
     { icon: Star, label: "Track", color: "from-yellow-400 to-orange-500" },
     { icon: Zap, label: "Reflect", color: "from-gray-600 to-black" },
     { icon: TrendingUp, label: "Build Streaks", color: "from-gray-700 to-black" }
   ]

  return (
    <div className="text-center mb-20">
             <div className="flex items-center justify-center mb-8">
         <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">
           DailyBase
         </h1>
       </div>
             <p className="text-2xl text-blue-100 mb-6 font-medium leading-relaxed drop-shadow-sm">
         Your Daily Web3 Life Log on Base
       </p>
       <div className="flex items-center justify-center gap-3 mb-8">
         {features.map((feature, index) => (
           <Badge 
             key={index} 
             variant="secondary" 
             className="bg-white border-gray-300 text-black shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105"
           >
            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color} mr-2`}></div>
            <feature.icon className="w-4 h-4 mr-2" />
            {feature.label}
          </Badge>
        ))}
      </div>
    </div>
  )
}
