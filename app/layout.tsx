import React from 'react'
import './globals.css'
import type { Metadata } from 'next'
import Navbar from './components/Navbar'
import Home from './page'

export const metadata: Metadata = {
  title: 'Nine Pics',
  description: '최대 9장의 사진을 공유하는 디지털 앨범 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // fetchUserStats를 children(Home)에서 props로 받아서 Navbar에 전달
  // children이 함수형 컴포넌트라면 props로 전달 가능
  // 예시: <Home onUserChanged={fetchUserStats} />
  return (
    <html lang="ko">
      <body className="bg-black min-h-screen">
        {/* <Navbar onUserChanged={fetchUserStats} /> */}
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 bg-black pt-32">{children}</main>
        <footer className="w-full bg-black py-16 relative"></footer>
      </body>
    </html>
  )
} 