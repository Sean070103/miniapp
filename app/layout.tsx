import type { Metadata } from 'next'
import './globals.css'
import { WalletProvider } from '@/components/providers/wallet-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { WalletSync } from '@/components/providers/wallet-sync'
import { MiniKitContextProvider } from '@/components/providers/MiniKitProvider'
import LBProvider from '@/components/providers/liveblocks-provider'
import { HydrationProvider } from '@/components/providers/hydration-provider'
import { ErrorBoundary } from '@/components/providers/error-boundary'
import { ChunkErrorHandler } from '@/components/providers/chunk-error-handler'
import NotificationSocket from '@/components/providers/notification-socket'

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL || 'https://your-domain.com';
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'DailyBase',
    description: 'Track your daily crypto activities on Base. Build streaks, reflect on your journey, and maintain your Web3 life log.',
    generator: 'Next.js',
    icons: {
      icon: '/db-removebg.png',
      shortcut: '/db-removebg.png',
      apple: '/db-removebg.png',
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/og-image.png`,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'DailyBase'}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'DailyBase',
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${URL}/splash.png`,
            splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#000000",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="pixel-font">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body className="pixel-font" suppressHydrationWarning={true}>
        <ChunkErrorHandler>
          <ErrorBoundary>
            <HydrationProvider>
              <MiniKitContextProvider>
                <LBProvider>
                  <WalletProvider>
                    <AuthProvider>
                      <WalletSync />
                      <NotificationSocket />
                      {children}
                    </AuthProvider>
                  </WalletProvider>
                </LBProvider>
              </MiniKitContextProvider>
            </HydrationProvider>
          </ErrorBoundary>
        </ChunkErrorHandler>
      </body>
    </html>
  )
}
