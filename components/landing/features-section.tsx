import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Wallet } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Rich Journaling",
      description: "Log events, transactions, learnings, and reflections with photos, tags, and wallet activity",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      icon: Calendar,
      title: "Calendar & Streaks",
      description: "Build consistency with daily entries and track your Web3 journey on a visual calendar",
      gradient: "from-blue-500 to-blue-700"
    },
    {
      icon: Wallet,
      title: "Base Identity",
      description: "Your Base wallet is your identity. Connect once and access your journal anywhere",
      gradient: "from-blue-300 to-blue-500"
    }
  ]

  return (
    <div className="grid lg:grid-cols-3 gap-8 mb-24">
      {features.map((feature, index) => (
        <Card key={index} className="group border-0 shadow-xl glass-effect hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-glow">
          <CardHeader className="pb-6">
            <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-3xl flex items-center justify-center mb-8 shadow-glow group-hover:scale-110 transition-transform duration-300`}>
              <feature.icon className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-white text-2xl font-bold mb-4">{feature.title}</CardTitle>
            <CardDescription className="text-blue-100 text-lg leading-relaxed">
              {feature.description}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
