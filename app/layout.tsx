import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NaWziN Chat',
  description: 'A Telegram-like messaging application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}

