export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Primary floating elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Secondary floating elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-float" style={{ animationDelay: '3s' }}></div>
      
      {/* Small accent elements */}
      <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-slow"></div>
      <div className="absolute bottom-1/3 left-1/3 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
    </div>
  )
}
