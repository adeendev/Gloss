// ============================================
// FILE: src/app/layout.tsx
// ============================================

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthSessionProvider } from '@/components/providers/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gloss — Car Detailing Booking Platform',
  description: 'Premium booking, payments, and communication platform for car detailing businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthSessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster position="top-right" />
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}