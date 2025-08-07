import { Header } from "./header"
import { HeroSection } from "./hero-section"
import { FeaturesSection } from "./features-section"
import { ActivityTypes } from "./activity-types"
import { CTASection } from "./cta-section"

interface LandingPageProps {
  onConnect: (address: string) => void
}

export function LandingPage({ onConnect }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <HeroSection onConnect={onConnect} />
        <FeaturesSection />
        <ActivityTypes />
        <CTASection onConnect={onConnect} />
      </div>
    </div>
  )
}
