'use client'

import React, { useRef, useState } from 'react'
import { Upload, Share2, X, Eye } from 'lucide-react'
import Image from 'next/image'
import { getFirestore, collection, getDocs, query, where, doc, getDoc, onSnapshot } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { initializeApp, getApps } from 'firebase/app'

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
const slotGlow = [
  '0 0 0 6px #b6d6e6, 0 0 16px 6px #b6d6e6', // 1
  '0 0 0 6px #aee9c8, 0 0 16px 6px #aee9c8', // 2
  '0 0 0 6px #ffd1b3, 0 0 16px 6px #ffd1b3', // 3
  '0 0 0 6px #f7b6c7, 0 0 16px 6px #f7b6c7', // 4
  '0 0 0 6px #c7b6e6, 0 0 16px 6px #c7b6e6', // 5
  '0 0 0 6px #7D9EEB, 0 0 16px 6px #7D9EEB', // 6
  '0 0 0 6px #8151D5, 0 0 16px 6px #8151D5', // 7
  '0 0 0 6px #2D3A70, 0 0 16px 6px #2D3A70', // 8
  '0 0 0 6px #121212, 0 0 16px 6px #121212', // 9
]
// 슬롯 테두리(hover) 컬러와 미니프레임 컬러를 연동
const slotBorderColors = [
  '#7D9EEB', // 1
  '#AEE9C8', // 2
  '#FFD1B3', // 3
  '#F7B6C7', // 4
  '#C7B6E6', // 5
  '#7D9EEB', // 6
  '#8151D5', // 7
  '#2D3A70', // 8
  '#121212', // 9
]

// Firebase 설정 (SignUpModal.tsx와 동일)
const firebaseConfig = {
  apiKey: "AIzaSyD0464CV_q1OwDzte8XOwyOaP6BlO6lm9A",
  authDomain: "nine-pics-a761a.firebaseapp.com",
  projectId: "nine-pics-a761a",
  storageBucket: "nine-pics-a761a.appspot.com",
  messagingSenderId: "149224975487",
  appId: "1:149224975487:web:3e669ea918435f5319a34a",
  measurementId: "G-TNE9LHNHMN"
}
if (!getApps().length) {
  initializeApp(firebaseConfig)
}
const db = getFirestore()

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [viewCount, setViewCount] = useState(0)
  const [albumId, setAlbumId] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [showSlotsModal, setShowSlotsModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [usersAt1Slot, setUsersAt1Slot] = useState<number>(0)
  const [userPercentile, setUserPercentile] = useState<number>(0)

  // 예시 데이터
  // const totalUsers = 12345
  // const usersInFirstSlot = 6789
  // const userPercentile = 12

  // 조회수에 따른 슬롯 해제 로직
  const getUnlockedSlots = () => {
    if (viewCount >= 1000) return 9
    if (viewCount >= 500) return 6
    if (viewCount >= 200) return 4
    if (viewCount >= 50) return 2
    return 1
  }

  const unlockedSlots = getUnlockedSlots()

  // 현재 로그인한 유저의 slotLevel을 가져오는 함수
  React.useEffect(() => {
    // 실시간 구독
    const unsubscribe = onSnapshot(collection(db, 'users'), (usersSnapshot) => {
      const users = usersSnapshot.docs.map(doc => doc.data())
      setTotalUsers(users.length)
      const at1 = users.filter(u => u.slotLevel === 1).length
      setUsersAt1Slot(at1)
      // 내 percentile 계산
      const auth = getAuth()
      const currentUser = auth.currentUser
      if (currentUser) {
        const myData = users.find(u => u.uid === currentUser.uid)
        if (myData && myData.slotLevel != null) {
          const mySlot = Number(myData.slotLevel)
          const higher = users.filter(u => Number(u.slotLevel || 1) > mySlot).length
          let percentile = 100 - Math.round((higher / users.length) * 100)
          if (users.length === 1) percentile = 100
          if (percentile < 1) percentile = 1
          setUserPercentile(percentile)
        } else if (users.length === 1) {
          setUserPercentile(100)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {
      const newPhotos: Photo[] = []
      
      for (let i = 0; i < Math.min(files.length, unlockedSlots - photos.length); i++) {
        const file = files[i]
        const reader = new FileReader()
        
        await new Promise<void>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string
            newPhotos.push({
              id: `photo-${Date.now()}-${i}`,
              url: result,
              alt: file.name
            })
            resolve()
          }
          reader.readAsDataURL(file)
        })
      }

      setPhotos(prev => [...prev, ...newPhotos])
      
      // 첫 번째 사진 업로드 시 앨범 ID 생성
      if (photos.length === 0 && newPhotos.length > 0) {
        const newAlbumId = `album-${Date.now()}`
        setAlbumId(newAlbumId)
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId))
  }

  const shareAlbum = () => {
    if (albumId) {
      const shareUrl = `${window.location.origin}/album/${albumId}`
      navigator.clipboard.writeText(shareUrl)
      alert('앨범 링크가 클립보드에 복사되었습니다!')
    }
  }

  // 프레임 클릭 시 파일 업로드 input 트리거
  const handleFrameClick = (isUnlocked: boolean) => {
    if (isUnlocked && fileInputRef.current && !isUploading) {
      fileInputRef.current.click()
    }
  }

  // 영어 텍스트로 변환
  const getSlotLabel = (index: number) => {
    if (index === 1) return 'Unlock at 100 Views'
    if (index === 2) return 'Unlock at 1000 views'
    if (index > 2) return 'Locked'
    return 'Unlock at 50 views'
  }

  // Slots 메뉴 클릭 핸들러 (layout에서 prop으로 받아야 하지만 데모용으로 window 이벤트 사용)
  React.useEffect(() => {
    const handler = (e: any) => {
      if (e.detail === 'slots') setShowSlotsModal(true)
    }
    window.addEventListener('open-modal', handler)
    return () => window.removeEventListener('open-modal', handler)
  }, [])

  return (
    <div className="min-h-screen bg-black">
      {/* Slots 모달 */}
      {showSlotsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-[48px] bg-white shadow-2xl p-10 w-[420px] max-w-full relative flex flex-col items-center text-black" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
            <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600" onClick={()=>setShowSlotsModal(false)}><X size={28}/></button>
            <div className="w-full flex flex-col items-center mb-8">
              <div className="text-[38px] font-bold text-black mb-2 font-inconsolata">1 Slot Open</div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-black text-lg font-inconsolata">
                  <span>Total Users</span>
                  <span className="font-bold">{totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-black text-lg font-inconsolata">
                  <span>Users at 1 Slot</span>
                  <span className="font-bold">{usersAt1Slot.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-black text-lg font-inconsolata">
                  <span>Your Percentile</span>
                  <span className="font-bold">Top {userPercentile}%</span>
                </div>
              </div>
            </div>
            {/* 미니 9개 프레임 */}
            <div className="grid grid-cols-9 gap-2 mb-2">
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={i}
                  className="w-6 h-8 rounded-[999px] border-2"
                  style={
                    i < unlockedSlots
                      ? { background: slotBorderColors[i], borderColor: slotBorderColors[i] }
                      : { background: '#f3f4f6', borderColor: '#e5e7eb', opacity: 0.5 }
                  }
                ></div>
              ))}
            </div>
            <div className="text-xs text-black font-inconsolata">the 1st slot is open</div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* 사진 그리드 */}
        <div className="bg-black rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }, (_, index) => {
              const photo = photos[index]
              const isUnlocked = index < unlockedSlots
              const isEmpty = !photo
              const bgColor = slotColors[index]
              const glow = slotGlow[index]

              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: isUnlocked ? bgColor : '#fff',
                    transition: 'box-shadow 0.3s, border 0.3s',
                  }}
                  className={`aspect-[4/5] rounded-[999px] overflow-hidden flex items-center justify-center transition-all duration-300 cursor-pointer
                    ${isEmpty
                      ? isUnlocked
                        ? ''
                        : 'opacity-50 cursor-default'
                      : ''}
                  `}
                  onClick={() => handleFrameClick(isUnlocked)}
                  onMouseEnter={e => {
                    if (isUnlocked) {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = glow
                      ;(e.currentTarget as HTMLDivElement).style.border = `6px solid ${bgColor}`
                    }
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = ''
                    ;(e.currentTarget as HTMLDivElement).style.border = 'none'
                  }}
                >
                  {photo ? (
                    <div className="relative w-full h-full group rounded-[999px] overflow-hidden">
                      <Image
                        src={photo.url}
                        alt={photo.alt}
                        fill
                        className="object-cover"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(photo.id) }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ) : isUnlocked ? (
                    <div className="text-center pointer-events-none">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-inconsolata">Add Photo</p>
                    </div>
                  ) : (
                    <div className="text-center pointer-events-none">
                      <Eye className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-inconsolata">
                        {getSlotLabel(index)}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {/* 숨겨진 파일 업로드 input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* 공유 버튼 */}
        {albumId && photos.length > 0 && (
          <div className="text-center">
            <button
              onClick={shareAlbum}
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-inconsolata"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Album
            </button>
            <p className="text-sm text-gray-400 mt-2 font-inconsolata">
              Link: {`${typeof window !== 'undefined' ? window.location.origin : ''}/album/${albumId}`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 