"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Info, BookOpen, Sparkles } from "lucide-react"

interface ArticleType {
  value: string
  label: string
  icon: string
  gradient: string
  description: string
  examples: string[]
  tags: string[]
}

export function ArticleTypesShowcase() {
  const [selectedType, setSelectedType] = useState<ArticleType | null>(null)

  const articleTypes: ArticleType[] = [
    {
      value: "defi",
      label: "Base DeFi",
      icon: "💱",
      gradient: "from-blue-400 to-blue-600",
      description: "Track your DeFi activities on Base including swaps, yields, lending, and staking",
      examples: [
        "Swapped ETH for USDC on BaseSwap",
        "Provided liquidity to a Base pool",
        "Staked tokens for yield farming",
        "Borrowed against my crypto collateral"
      ],
      tags: ["#DeFi", "#Base", "#Swaps", "#Yield", "#Lending"]
    },
    {
      value: "nft",
      label: "Base NFT",
      icon: "🖼️",
      gradient: "from-blue-500 to-blue-700",
      description: "Document your NFT journey including mints, trades, and collections",
      examples: [
        "Minted my first Base NFT collection",
        "Traded NFTs on Base marketplace",
        "Joined an exclusive NFT community",
        "Created my own NFT artwork"
      ],
      tags: ["#NFT", "#Base", "#Mint", "#Trade", "#Art"]
    },
    {
      value: "event",
      label: "Base Event",
      icon: "🎪",
      gradient: "from-blue-300 to-blue-500",
      description: "Record your participation in Base events, meetups, and conferences",
      examples: [
        "Attended Base DevCon 2024",
        "Joined a Base community meetup",
        "Participated in a Base hackathon",
        "Watched a Base ecosystem presentation"
      ],
      tags: ["#Event", "#Base", "#Meetup", "#Conference", "#Community"]
    },
    {
      value: "learning",
      label: "Base Learning",
      icon: "📚",
      gradient: "from-blue-600 to-blue-800",
      description: "Track your learning journey with articles, tutorials, and documentation",
      examples: [
        "Read Base documentation and guides",
        "Completed a Base development tutorial",
        "Learned about Base account abstraction",
        "Studied Base ecosystem projects"
      ],
      tags: ["#Learning", "#Base", "#Tutorial", "#Documentation", "#Education"]
    },
    {
      value: "dao",
      label: "Base Governance",
      icon: "🏛️",
      gradient: "from-blue-700 to-blue-900",
      description: "Document your participation in Base governance and DAO activities",
      examples: [
        "Voted on a Base governance proposal",
        "Submitted a governance proposal",
        "Participated in Base DAO discussions",
        "Attended governance community calls"
      ],
      tags: ["#Governance", "#Base", "#DAO", "#Voting", "#Proposal"]
    },
    {
      value: "reward",
      label: "Base Rewards",
      icon: "🎁",
      gradient: "from-blue-200 to-blue-400",
      description: "Track your rewards, airdrops, and achievements on Base",
      examples: [
        "Received Base airdrop tokens",
        "Earned rewards from Base protocols",
        "Completed Base quests and challenges",
        "Got early access to Base features"
      ],
      tags: ["#Rewards", "#Base", "#Airdrop", "#Achievement", "#Quest"]
    },
    {
      value: "other",
      label: "Other Base Activity",
      icon: "✨",
      gradient: "from-blue-500 to-blue-600",
      description: "Document any other Base-related activities and experiences",
      examples: [
        "Explored new Base protocols",
        "Connected with Base community members",
        "Built something on Base",
        "Shared Base knowledge with others"
      ],
      tags: ["#Base", "#Community", "#Build", "#Share", "#Explore"]
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Article Types Guide
          </h2>
        </div>
        <p className="text-blue-600 text-lg max-w-2xl mx-auto">
          Choose from 7 different article types to categorize your Base journey entries
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articleTypes.map((type) => (
          <Dialog key={type.value}>
            <DialogTrigger asChild>
              <Card className="group cursor-pointer border-0 shadow-xl bg-white/90 backdrop-blur-xl hover:bg-white/95 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-blue-100">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${type.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      {type.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-blue-700 transition-colors duration-300">
                        {type.label}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors duration-300"
                    >
                      {type.value}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${type.gradient} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                    {type.icon}
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{type.label}</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600 leading-relaxed">{type.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Example Activities</h4>
                  <div className="space-y-2">
                    {type.examples.map((example, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 text-sm">{example}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Popular Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {type.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center">
                    Click "Create Entry" to start journaling your {type.label.toLowerCase()} experience
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      <div className="text-center mt-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Info className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-blue-800">Pro Tips</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <p className="font-medium mb-2">🎯 Be Specific</p>
            <p>Include details about what you did, learned, or experienced</p>
          </div>
          <div>
            <p className="font-medium mb-2">🏷️ Use Tags</p>
            <p>Add relevant tags to make your entries searchable and organized</p>
          </div>
          <div>
            <p className="font-medium mb-2">📸 Add Photos</p>
            <p>Include screenshots or images to make your entries more visual</p>
          </div>
          <div>
            <p className="font-medium mb-2">📅 Stay Consistent</p>
            <p>Journal regularly to build streaks and track your progress</p>
          </div>
        </div>
      </div>
    </div>
  )
}















