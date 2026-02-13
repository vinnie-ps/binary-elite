import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { Toaster } from 'sonner'


const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'Binary Elite | Elite Tech Education',
  description: 'A collective of developers, designers, and AI builders pushing the boundaries of learning through technology.',
  icons: {
    icon: '/icon.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-[var(--color-bg-dark)] text-[var(--color-text-primary)] antialiased relative">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  )
}
