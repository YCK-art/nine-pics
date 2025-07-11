"use client"

import React, { useState, useEffect } from 'react'
import { Eye, Upload } from 'lucide-react'
import Image from 'next/image'
import { getFirestore, doc, onSnapshot, getDoc, collection, getDocs, increment, updateDoc, setDoc, query, where } from 'firebase/firestore'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import ViewsModal from '../../components/ViewsModal'
import Navbar from '../../components/Navbar'
import MyAccountModal from '../../components/MyAccountModal'
import SegmentedControl from '../../components/SegmentedControl';
import { useSwipeable } from 'react-swipeable';

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
];

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
];

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

export default function UserAlbumPage({ params }: { params: { username: string } }) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [viewCount, setViewCount] = useState(0)
  const [albumMeta, setAlbumMeta] = useState<{ totalViews: number, createdAt: string | null }>({ totalViews: 0, createdAt: null })
  const [showViewsModal, setShowViewsModal] = useState(false)
  const [showSlotsModal, setShowSlotsModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAccount, setShowAccount] = useState(false)
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [usersAt1Slot, setUsersAt1Slot] = useState<number>(0)
  const [userPercentile, setUserPercentile] = useState<number>(0)
  const [isMobile, setIsMobile] = React.useState(false);
  const [mobileView, setMobileView] = React.useState<'cards' | 'grid'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 'cards';
    return 'grid';
  });
  const [cardIndex, setCardIndex] = React.useState(0);
  const [shakeIndex, setShakeIndex] = useState<number|null>(null);
  const [enlargedPhoto, setEnlargedPhoto] = useState<Photo | null>(null);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);

  // 모바일 여부 감지
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);
  React.useEffect(() => {
    if (isMobile && mobileView !== 'cards') setMobileView('cards');
    if (!isMobile && mobileView !== 'grid') setMobileView('grid');
  }, [isMobile]);

  // 슬롯 해제 로직
  const getUnlockedSlots = () => {
    const v = typeof viewCount === 'number' && !isNaN(viewCount) ? viewCount : 0;
    if (v >= 32000) return 9;
    if (v >= 16000) return 8;
    if (v >= 8000) return 7;
    if (v >= 4000) return 6;
    if (v >= 2000) return 5;
    if (v >= 1000) return 4;
    if (v >= 500) return 3;
    if (v >= 100) return 2;
    return 1;
  }
  const unlockedSlots = getUnlockedSlots()

  // 사용자명으로 UID 찾기
  useEffect(() => {
    const findUserByUsername = async () => {
      if (!params.username) {
        setError('사용자명이 없습니다')
        setIsLoading(false)
        return
      }

      try {
        const q = query(collection(db, 'users'), where('username', '==', params.username))
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          setError('사용자를 찾을 수 없습니다')
          setIsLoading(false)
          return
        }

        const userDoc = querySnapshot.docs[0]
        const userData = userDoc.data()
        setUserUid(userData.uid)
        
        // UID를 찾았으므로 기존 로직으로 앨범 데이터 가져오기
        await fetchAlbumData(userData.uid)
      } catch (error) {
        console.error('Error finding user:', error)
        setError('사용자를 찾는 중 오류가 발생했습니다')
        setIsLoading(false)
      }
    }

    findUserByUsername()
  }, [params.username])

  // 앨범 데이터 가져오기
  const fetchAlbumData = async (uid: string) => {
    console.log('Fetching album for UID:', uid)
    
    // 여러 가능한 문서 ID를 시도
    const possibleIds = [
      `user-${uid}`,
      uid,
      `album-${uid}`,
      `ninepics-${uid}`
    ]

    let unsubscribe: (() => void) | null = null
    let foundAlbumId: string | null = null

    const tryFetchAlbum = async () => {
      for (const albumId of possibleIds) {
        try {
          console.log('Trying album ID:', albumId)
          const albumRef = doc(db, 'albums', albumId)
          const albumSnap = await getDoc(albumRef)
          
          if (albumSnap.exists()) {
            foundAlbumId = albumId
            console.log('Found album with ID:', albumId)
            
            // 실시간 구독 설정
            unsubscribe = onSnapshot(albumRef, (doc) => {
              if (doc.exists()) {
                const data = doc.data()
                setPhotos(data.photos || [])
                setViewCount(data.viewCount || 0)
                setAlbumMeta({
                  totalViews: data.totalViews || data.viewCount || 0,
                  createdAt: data.createdAt || null
                })
                setIsLoading(false)
              }
            })
            break
          }
        } catch (error) {
          console.log('Error trying album ID:', albumId, error)
        }
      }
      
      if (!foundAlbumId) {
        console.log('No album found for any ID')
        setError('앨범을 찾을 수 없습니다')
        setIsLoading(false)
      }
    }

    await tryFetchAlbum()
  }

  // 전체 사용자 통계 가져오기
  useEffect(() => {
    if (!userUid) return

    const unsubscribe = onSnapshot(collection(db, 'users'), (usersSnapshot) => {
      const users = usersSnapshot.docs.map(doc => doc.data())
      setTotalUsers(users.length)
      
      const currentUnlockedSlots = unlockedSlots
      const usersAtCurrentSlot = users.filter(u => {
        const userSlotLevel = Number(u.slotLevel || 1)
        return userSlotLevel === currentUnlockedSlots
      }).length
      setUsersAt1Slot(usersAtCurrentSlot)
      
      // 조회수 기준으로 정렬 (높은 순서대로)
      const sortedUsers = users.sort((a, b) => {
        const aViews = Number(a.totalViews || a.viewCount || 0)
        const bViews = Number(b.totalViews || b.viewCount || 0)
        return bViews - aViews
      })
      
      // 현재 앨범 주인의 순위 찾기
      const currentAlbumOwnerRank = sortedUsers.findIndex(u => u.uid === userUid) + 1
      setUserPercentile(currentAlbumOwnerRank)
    })
    return () => unsubscribe()
  }, [unlockedSlots, userUid, albumMeta.totalViews])

  // 현재 로그인한 유저의 uid 가져오기
  useEffect(() => {
    try {
      const auth = getAuth();
      setCurrentUserUid(auth.currentUser?.uid || null);
    } catch (e) {
      setCurrentUserUid(null);
    }
  }, []);

  // 조회수 증가 로직
  const checkUniqueVisitor = async (albumId: string) => {
    try {
      const visitorRef = doc(db, 'visitors', `${albumId}_${Date.now()}`)
      const visitorSnap = await getDoc(visitorRef)
      
      if (!visitorSnap.exists()) {
        await setDoc(visitorRef, {
          albumId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
        
        // 조회수 증가
        const albumRef = doc(db, 'albums', albumId)
        await updateDoc(albumRef, {
          viewCount: increment(1),
          totalViews: increment(1)
        })
        
        return true
      }
      return false
    } catch (error) {
      console.error('Error checking unique visitor:', error)
      return false
    }
  }

  // 모달 열기 핸들러
  const handleModalOpen = (e: any) => {
    e.stopPropagation()
    setShowViewsModal(true)
  }

  // 슬롯 클릭 핸들러
  const handleSlotClick = (slotIndex: number) => {
    if (slotIndex < unlockedSlots) {
      // 잠금 해제된 슬롯 클릭 시
      setShakeIndex(slotIndex)
      setTimeout(() => setShakeIndex(null), 500)
    } else {
      // 잠긴 슬롯 클릭 시
      setShowSlotsModal(true)
    }
  }

  // 슬롯 라벨 가져오기
  const getSlotLabel = (index: number) => {
    const labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    return labels[index] || ''
  }

  // PC에서 사진 확대 모달
  const handlePhotoClick = (photo: Photo) => {
    if (!isMobile) {
      setEnlargedPhoto(photo)
    }
  }

  // 모바일 스와이프 핸들러
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (mobileView === 'cards' && cardIndex < photos.length - 1) {
        setCardIndex(prev => prev + 1)
      }
    },
    onSwipedRight: () => {
      if (mobileView === 'cards' && cardIndex > 0) {
        setCardIndex(prev => prev - 1)
      }
    },
    trackMouse: true
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-inconsolata">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-inconsolata mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()} 
            className="px-6 py-3 bg-black text-white rounded-full font-inconsolata hover:bg-gray-800"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar onUserChanged={() => {}} albumUid={userUid || undefined} />
      
      {/* PC 버전 */}
      {!isMobile && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 9 }, (_, index) => {
              const photo = photos[index]
              const isUnlocked = index < unlockedSlots
              
              return (
                <div
                  key={index}
                  className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    isUnlocked ? 'hover:scale-105' : 'opacity-50'
                  }`}
                  style={{
                    backgroundColor: slotColors[index],
                    boxShadow: isUnlocked ? slotGlow[index] : 'none',
                    border: `3px solid ${slotBorderColors[index]}`
                  }}
                  onClick={() => {
                    if (isUnlocked && photo) {
                      handlePhotoClick(photo)
                    } else {
                      handleSlotClick(index)
                    }
                  }}
                >
                  {photo && isUnlocked ? (
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-4xl font-bold text-gray-600 font-inconsolata">
                        {getSlotLabel(index)}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* 통계 정보 */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600 font-inconsolata">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{viewCount.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Rank #{userPercentile} of {totalUsers}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{usersAt1Slot} users at slot {unlockedSlots}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 모바일 버전 */}
      {isMobile && (
        <div className="px-4 py-6">
          <SegmentedControl
            value={mobileView}
            onChange={setMobileView}
          />
          
          {mobileView === 'cards' ? (
            <div className="mt-6" {...handlers}>
              {photos.length > 0 ? (
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden">
                    <Image
                      src={photos[cardIndex]?.url || ''}
                      alt={photos[cardIndex]?.alt || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-center bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-white font-inconsolata">
                        {cardIndex + 1} / {photos.length}
                      </span>
                      <div className="flex items-center gap-2 text-white">
                        <Eye className="w-4 h-4" />
                        <span className="font-inconsolata">{viewCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-inconsolata">사진이 없습니다</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }, (_, index) => {
                const photo = photos[index]
                const isUnlocked = index < unlockedSlots
                
                return (
                  <div
                    key={index}
                    className={`relative aspect-square rounded-xl overflow-hidden ${
                      isUnlocked ? 'cursor-pointer' : 'opacity-50'
                    }`}
                    style={{
                      backgroundColor: slotColors[index],
                      boxShadow: isUnlocked ? slotGlow[index] : 'none',
                      border: `2px solid ${slotBorderColors[index]}`
                    }}
                    onClick={() => {
                      if (isUnlocked && photo) {
                        setCardIndex(index)
                        setMobileView('cards')
                      } else {
                        handleSlotClick(index)
                      }
                    }}
                  >
                    {photo && isUnlocked ? (
                      <Image
                        src={photo.url}
                        alt={photo.alt}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-2xl font-bold text-gray-600 font-inconsolata">
                          {getSlotLabel(index)}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
      
      {/* 모달들 */}
      {showViewsModal && (
        <ViewsModal
          totalViews={viewCount}
          daysSinceCreated={albumMeta.createdAt ? Math.floor((Date.now() - new Date(albumMeta.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
          onClose={() => setShowViewsModal(false)}
        />
      )}
      
      {showAccount && (
        <MyAccountModal
          email={currentUserUid || ''}
          onClose={() => setShowAccount(false)}
          onLogout={() => {}}
          albumUid={userUid || undefined}
        />
      )}
      
      {/* PC 사진 확대 모달 */}
      {enlargedPhoto && !isMobile && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <Image
              src={enlargedPhoto.url}
              alt={enlargedPhoto.alt}
              width={800}
              height={800}
              className="object-contain max-w-full max-h-full"
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              onClick={() => setEnlargedPhoto(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 