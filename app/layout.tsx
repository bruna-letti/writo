import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Writo — Daily Language Practice',
  description: 'AI-powered writing practice for language learners',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#EFEAE6]">{children}</body>
    </html>
  )
}
