'use client'

import React, { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import Image from 'next/image'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'
import ViewsModal from '../components/ViewsModal'

interface Photo {
  id: string
  url: string
  alt: string
}

const slotColors = [
  '#EAF4F8', // 1
  '#D4F1E1', // 2
  '#FFE3D2', // 3
  '#F7CED7', // 4
  '#E0D4F7', // 5
  '#7D9EEB', // 6
  '#8151D5', // 7
  '#2D3A70', // 8
  '#121212', // 9
]

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyD0464CV_q1OwDzte8XOwyOaP6BlO6lm9A",
  authDomain: "nine-pics-a761a.firebaseapp.com",
  projectId: "nine-pics-a761a",
  storageBucket: "nine-pics-a761a.firebasestorage.app",
  messagingSenderId: "149224975487",
  appId: "1:149224975487:web:3e669ea918435f5319a34a",
  measurementId: "G-TNE9LHNHMN"
}

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

const db = getFirestore()

export default function UserAlbumPage({ params }: { params: { uid: string } }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [viewCount, setViewCount] = useState(0)
  const [albumMeta, setAlbumMeta] = useState<{ totalViews: number, createdAt: string | null }>({ totalViews: 0, createdAt: null })
  const [showViewsModal, setShowViewsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 조회수에 따른 슬롯 해제 로직
  const getUnlockedSlots = () => {
    if (viewCount >= 1000) return 9
    if (viewCount >= 500) return 6
    if (viewCount >= 200) return 4
    if (viewCount >= 50) return 2
    return 1
  }

  const unlockedSlots = getUnlockedSlots()

  // Firestore에서 특정 유저의 앨범 데이터 구독
  useEffect(() => {
    if (!params.uid) return

    const albumId = `user-${params.uid}`
    const albumRef = doc(db, 'albums', albumId)
    
    const unsubscribe = onSnapshot(albumRef, (snap) => {
      setIsLoading(false)
      if (snap.exists()) {
        const data = snap.data()
        setPhotos((data.photos || []).slice(0, getUnlockedSlots()))
        setAlbumMeta({
          totalViews: data.totalViews || data.viewCount || 0,
          createdAt: data.createdAt || null,
        })
        setViewCount(data.totalViews || data.viewCount || 0)
      } else {
        setPhotos([])
        setAlbumMeta({ totalViews: 0, createdAt: null })
        setViewCount(0)
      }
    })

    return () => unsubscribe()
  }, [params.uid])

  // daysSinceCreated 계산
  const daysSinceCreated = albumMeta.createdAt ? Math.max(1, Math.ceil((Date.now() - new Date(albumMeta.createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 1

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-inconsolata">nine-pics</h1>
          <p className="text-gray-600">@{params.uid}</p>
        </div>

        {/* 통계 정보 */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600 font-inconsolata">Views</span>
              </div>
              <button
                onClick={() => setShowViewsModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-inconsolata"
              >
                자세히 보기
              </button>
            </div>
            <div className="text-3xl font-bold text-gray-900 font-inconsolata">{viewCount.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">
              {daysSinceCreated}일 전 생성
            </div>
          </div>
        </div>

        {/* 사진 그리드 */}
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }, (_, index) => {
              const photo = photos[index]
              const isUnlocked = index < unlockedSlots
              const hasPhoto = photo && photo.url

              return (
                <div
                  key={index}
                  className={`aspect-square rounded-2xl relative overflow-hidden ${
                    isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  style={{
                    backgroundColor: slotColors[index],
                    boxShadow: isUnlocked ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {hasPhoto ? (
                    <Image
                      src={photo.url}
                      alt={photo.alt || `Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 300px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-400 text-4xl font-bold font-inconsolata">
                        {index + 1}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>이 앨범은 nine-pics에서 생성되었습니다</p>
          <p className="mt-1">
            <a href="https://www.ninepics.com" className="text-blue-600 hover:text-blue-800">
              ninepics.com
            </a>
          </p>
        </div>
      </div>

      {/* Views Modal */}
      {showViewsModal && (
        <ViewsModal
          totalViews={albumMeta.totalViews}
          daysSinceCreated={daysSinceCreated}
          onClose={() => setShowViewsModal(false)}
        />
      )}
    </div>
  )
} 