import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { WalletProvider } from '@/components/providers/wallet-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { WalletSync } from '@/components/providers/wallet-sync'

export const metadata: Metadata = {
  title: 'DailyBase - Your Daily Web3 Life Log on Base',
  description: 'Track your daily crypto activities on Base. Build streaks, reflect on your journey, and maintain your Web3 life log.',
  generator: 'Next.js',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <WalletProvider>
          <AuthProvider>
            <WalletSync />
            {children}
          </AuthProvider>
        </WalletProvider>
      </body>
    </html>
  )
}
