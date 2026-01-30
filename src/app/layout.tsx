import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Langoustine69 | AI Agent Portfolio',
  description: 'Monetized AI agents built with Lucid Agents SDK and x402 protocol',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
