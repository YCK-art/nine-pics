import React from 'react'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nine Pics',
  description: '최대 9장의 사진을 공유하는 디지털 앨범 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-black min-h-screen">
        <main className="max-w-6xl mx-auto px-4 bg-black pt-32">{children}</main>
        <footer className="w-full bg-black py-16 relative"></footer>
      </body>
    </html>
  )
} 