import './globals.css'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { ReactNode } from 'react'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'mmBoard',
  description: '개인 관리',
  applicationName: 'mmBoard',
  appleWebApp: {
    capable: true,
    title: 'mmBoard',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  themeColor: '#1e293b',
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
}

const paperlogy = localFont({
  src: [
    { path: '../fonts/Paperlogy/Paperlogy-4Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/Paperlogy/Paperlogy-5Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/Paperlogy/Paperlogy-6SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/Paperlogy/Paperlogy-7Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-paperlogy',
  display: 'swap',
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className={paperlogy.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
