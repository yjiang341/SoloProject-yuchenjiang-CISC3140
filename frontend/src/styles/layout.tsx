import type { Metadata, Viewport } from 'next'
import { Cinzel, Crimson_Text } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './HomePage.css'

const cinzel = Cinzel({ 
  subsets: ["latin"],
  variable: '--font-heading'
})

const crimsonText = Crimson_Text({ 
  subsets: ["latin"],
  weight: ['400', '600', '700'],
  variable: '--font-body'
})

export const metadata: Metadata = {
  title: 'Truth of Abyss - A Dark Fantasy RPG',
  description: 'Descend into the depths of the Abyss. A text-based D&D RPG where your choices shape your destiny.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1625',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${cinzel.variable} ${crimsonText.variable} font-serif antialiased min-h-screen`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
