import Header from '@/components/header'
import { Geist } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import Aside from '@/components/aside'

export const metadata = {
  title: 'Easy Agency',
  description: 'The fastest way to build apps with Next.js and Supabase',
}

const geistSans = Geist({
  display: 'swap',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body
        className="bg-background text-foreground list-none w-full flex items-center justify-center
"
      >
        {children}
      </body>
    </html>
  )
}
