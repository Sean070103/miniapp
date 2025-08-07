import { Card, CardContent } from "@/components/ui/card"
import { ConnectWallet } from "@/components/auth/connect-wallet"

interface CTASectionProps {
  onConnect: (address: string) => void
}

export function CTASection({ onConnect }: CTASectionProps) {
  return (
    <div className="text-center">
             <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-white overflow-hidden">
         <CardContent className="p-16">
          <div className="space-y-8">
                         <h3 className="text-4xl font-bold text-black mb-4">Start Your DailyBase Journey</h3>
             <p className="text-xl text-black leading-relaxed max-w-3xl mx-auto font-medium">
               Connect your Base wallet and begin tracking your daily crypto activities. 
               Build streaks, reflect on your progress, and maintain your daily Web3 life log.
             </p>
            <ConnectWallet onConnect={onConnect} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
