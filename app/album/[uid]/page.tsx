"use client"

import React, { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import Image from 'next/image'
import { getFirestore, doc, onSnapshot, getDoc } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'
import ViewsModal from '../../components/ViewsModal'
import Navbar from '../../components/Navbar'
import MyAccountModal from '../../components/MyAccountModal'

interface Photo {
  id: string
  url: string
  alt: string
}

const slotColors = [
  '#EAF4F8', '#D4F1E1', '#FFE3D2', '#F7CED7', '#E0D4F7', '#7D9EEB', '#8151D5', '#2D3A70', '#121212',
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
  const [error, setError] = useState<string | null>(null)
  const [showAccount, setShowAccount] = useState(false)

  // 슬롯 해제 로직
  const getUnlockedSlots = () => {
    if (viewCount >= 1000) return 9
    if (viewCount >= 500) return 6
    if (viewCount >= 200) return 4
    if (viewCount >= 50) return 2
    return 1
  }
  const unlockedSlots = getUnlockedSlots()

  // Firestore에서 앨범 데이터 구독
  useEffect(() => {
    if (!params.uid) {
      setError('UID가 없습니다')
      setIsLoading(false)
      return
    }

    console.log('Fetching album for UID:', params.uid)
    
    // 여러 가능한 문서 ID를 시도
    const possibleIds = [
      `user-${params.uid}`,
      params.uid,
      `album-${params.uid}`,
      `ninepics-${params.uid}`
    ]

    let unsubscribe: (() => void) | null = null

    const tryFetchAlbum = async () => {
      for (const albumId of possibleIds) {
        try {
          console.log('Trying album ID:', albumId)
          const albumRef = doc(db, 'albums', albumId)
          const albumSnap = await getDoc(albumRef)
          
          if (albumSnap.exists()) {
            console.log('Found album with ID:', albumId)
            const data = albumSnap.data()
            console.log('Album data:', data)
            
            // 실시간 구독 설정
            unsubscribe = onSnapshot(albumRef, (snap) => {
              if (snap.exists()) {
                const realtimeData = snap.data()
                console.log('Realtime album data:', realtimeData)
                
                const photosArray = realtimeData.photos || []
                console.log('Photos array:', photosArray)
                
                setPhotos(photosArray.slice(0, getUnlockedSlots()))
                setAlbumMeta({
                  totalViews: realtimeData.totalViews || realtimeData.viewCount || 0,
                  createdAt: realtimeData.createdAt || null,
                })
                setViewCount(realtimeData.totalViews || realtimeData.viewCount || 0)
                setError(null)
              } else {
                console.log('Album no longer exists')
                setPhotos([])
                setAlbumMeta({ totalViews: 0, createdAt: null })
                setViewCount(0)
                setError('앨범을 찾을 수 없습니다')
              }
            })
            
            setIsLoading(false)
            return // 성공하면 루프 종료
          }
        } catch (err) {
          console.error('Error fetching album with ID:', albumId, err)
        }
      }
      
      // 모든 ID를 시도했지만 찾지 못함
      console.log('No album found with any of the tried IDs')
      setPhotos([])
      setAlbumMeta({ totalViews: 0, createdAt: null })
      setViewCount(0)
      setError('앨범을 찾을 수 없습니다')
      setIsLoading(false)
    }

    tryFetchAlbum()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [params.uid])

  // 디버깅용 콘솔 로그
  useEffect(() => {
    console.log('Current state:', {
      photos: photos,
      unlockedSlots: unlockedSlots,
      albumMeta: albumMeta,
      viewCount: viewCount,
      error: error
    })
  }, [photos, unlockedSlots, albumMeta, viewCount, error])

  // daysSinceCreated 계산
  const daysSinceCreated = albumMeta.createdAt ? Math.max(1, Math.ceil((Date.now() - new Date(albumMeta.createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 1

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-300">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 앨범이 없을 때
  if (error || !photos || photos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-2">앨범을 찾을 수 없습니다</div>
          <div className="text-gray-400 mb-4">링크를 다시 확인해주세요</div>
          <div className="text-gray-500 text-sm mb-4">UID: {params.uid}</div>
          <a href="/" className="text-blue-400 hover:underline">홈으로 돌아가기</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* 사진 그리드 */}
        <div className="bg-black rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }, (_, index) => {
              const photo = photos[index]
              const isUnlocked = index < unlockedSlots
              const hasPhoto = photo && photo.url
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: isUnlocked ? slotColors[index] : '#fff',
                    transition: 'box-shadow 0.3s, border 0.3s',
                  }}
                  className={`aspect-[4/5] rounded-[999px] overflow-hidden flex items-center justify-center transition-all duration-300
                    ${!hasPhoto ? (isUnlocked ? '' : 'opacity-50') : ''}
                  `}
                >
                  {hasPhoto ? (
                    <div className="relative w-full h-full group rounded-[999px] overflow-hidden">
                      <Image
                        src={photo.url}
                        alt={photo.alt || `Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="text-center pointer-events-none">
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
            <a href="https://www.ninepics.com" className="text-blue-400 hover:text-blue-200">
              ninepics.com
            </a>
          </p>
        </div>
      </div>
      {/* Views Modal */}
      {showViewsModal && (
        <ViewsModal
          totalViews={viewCount}
          daysSinceCreated={daysSinceCreated}
          onClose={() => setShowViewsModal(false)}
        />
      )}
      {showAccount && (
        <MyAccountModal
          email={''}
          onClose={() => setShowAccount(false)}
          onLogout={() => {}}
          albumUid={params.uid}
        />
      )}
    </div>
  )
} 