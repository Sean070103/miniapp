import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ActivityTypes() {
  return (
    <div className="max-w-6xl mx-auto mb-24">
      <div className="text-center mb-16">
        <h3 className="text-4xl font-bold text-gray-800 mb-6">Article Types You Can Journal</h3>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Document every aspect of your Base journey with these 7 article types
        </p>
      </div>
      
      <div className="text-center">
        <Button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 border-0">
          Learn More
        </Button>
      </div>
    </div>
  )
}
