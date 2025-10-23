import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/components/providers/WalletProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ErrorProvider } from '@/components/providers/ErrorProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Solana Asset Tokenization Platform',
  description: 'Invest in real world assets powered by Solana blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
          <ThemeProvider>
            <ErrorProvider>
              <WalletProvider>
                {children}
              </WalletProvider>
            </ErrorProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}