"use client"

import React, { useState, useEffect } from 'react'
import { Eye, Upload } from 'lucide-react'
import Image from 'next/image'
import { getFirestore, doc, onSnapshot, getDoc, collection, getDocs, increment, updateDoc, setDoc } from 'firebase/firestore'
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

export default function UserAlbumPage({ params }: { params: { uid: string } }) {
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
  // PC: 사진 확대 모달 상태
  const [enlargedPhoto, setEnlargedPhoto] = useState<Photo | null>(null);
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);

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

  // 전체 사용자 통계 가져오기
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (usersSnapshot) => {
      const users = usersSnapshot.docs.map(doc => doc.data())
      setTotalUsers(users.length)
      
      // 디버깅: 현재 unlocked 슬롯 수와 사용자 데이터 확인
      console.log('Debug - Current unlocked slots:', unlockedSlots)
      console.log('Debug - Users data:', users)
      
      // 현재 앨범 주인의 unlocked 슬롯 수에 맞춰서 계산
      const currentUnlockedSlots = unlockedSlots
      const usersAtCurrentSlot = users.filter(u => {
        const userSlotLevel = Number(u.slotLevel || 1)
        return userSlotLevel === currentUnlockedSlots
      }).length
      setUsersAt1Slot(usersAtCurrentSlot)
      
      // 조회수 기반 순위 계산 (현재 앨범 주인 기준)
      const currentAlbumOwnerSlotLevel = unlockedSlots
      
      // 조회수 기준으로 정렬 (높은 순서대로)
      const sortedUsers = users.sort((a, b) => {
        const aViews = Number(a.totalViews || a.viewCount || 0)
        const bViews = Number(b.totalViews || b.viewCount || 0)
        return bViews - aViews
      })
      
      // 현재 앨범 주인의 순위 찾기 (params.uid로 찾기)
      const currentAlbumOwnerRank = sortedUsers.findIndex(u => u.uid === params.uid) + 1
      console.log('Debug - Rank calculation:', { 
        totalUsers: users.length, 
        albumOwnerViews: albumMeta.totalViews,
        rank: currentAlbumOwnerRank 
      })
      
      setUserPercentile(currentAlbumOwnerRank)
    })
    return () => unsubscribe()
  }, [unlockedSlots, params.uid, albumMeta.totalViews])

  // 현재 로그인한 유저의 uid 가져오기
  useEffect(() => {
    try {
      const auth = getAuth();
      setCurrentUserUid(auth.currentUser?.uid || null);
    } catch (e) {
      setCurrentUserUid(null);
    }
  }, []);

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
    let foundAlbumId: string | null = null

    const tryFetchAlbum = async () => {
      for (const albumId of possibleIds) {
        try {
          console.log('Trying album ID:', albumId)
          const albumRef = doc(db, 'albums', albumId)
          const albumSnap = await getDoc(albumRef)
          
          if (albumSnap.exists()) {
            console.log('Found album with ID:', albumId)
            foundAlbumId = albumId
            const data = albumSnap.data()
            console.log('Album data:', data)
            
            // 실시간 구독 설정
            unsubscribe = onSnapshot(albumRef, (snap) => {
              if (snap.exists()) {
                const realtimeData = snap.data()
                console.log('Realtime album data:', realtimeData)
                
                const photosArray = realtimeData.photos || []
                console.log('Photos array:', photosArray)
                
                setPhotos(photosArray)
                setAlbumMeta({
                  totalViews: typeof realtimeData.totalViews === 'number' ? realtimeData.totalViews : 0,
                  createdAt: realtimeData.createdAt || null,
                })
                setViewCount(typeof realtimeData.totalViews === 'number' ? realtimeData.totalViews : 0)
                setError(null)
              } else {
                console.log('Album no longer exists')
                setPhotos([])
                setAlbumMeta({ totalViews: 0, createdAt: null })
                setViewCount(0)
                setError('앨범을 찾을 수 없습니다')
              }
            })
            
            // IP 기반 unique visitor 체크
            await checkUniqueVisitor(albumId)
            
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

    // IP 기반 unique visitor 체크 함수
    const checkUniqueVisitor = async (albumId: string) => {
      try {
        // IP 주소 가져오기
        const response = await fetch('https://api.ipify.org?format=json');
        const { ip } = await response.json();
        console.log('Visitor IP:', ip);
        
        // Firebase에서 이 IP가 이미 방문했는지 체크
        const visitorRef = doc(db, 'visitors', `${albumId}_${ip}`);
        const visitorSnap = await getDoc(visitorRef);
        
        if (!visitorSnap.exists()) {
          // 새로운 방문자
          console.log('New unique visitor detected');
          await setDoc(visitorRef, { 
            visitedAt: new Date().toISOString(),
            albumId: albumId,
            ip: ip
          });
          
          // 조회수 증가
          const albumRef = doc(db, 'albums', albumId);
          await updateDoc(albumRef, { 
            totalViews: increment(1) 
          });
          console.log('View count incremented for new visitor');
        } else {
          console.log('Returning visitor, no view count increment');
        }
      } catch (error) {
        console.error('IP 체크 실패:', error);
        // IP 체크 실패 시 기존 sessionStorage 방식으로 fallback
        if (!window.sessionStorage.getItem(`viewed-${albumId}`)) {
          const albumRef = doc(db, 'albums', albumId);
          await updateDoc(albumRef, { 
            totalViews: increment(1) 
          });
          window.sessionStorage.setItem(`viewed-${albumId}`, 'true');
          console.log('View count incremented (fallback)');
        }
      }
    };

    tryFetchAlbum()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [params.uid])

  // 전역 이벤트 리스너 추가 (Slots, Views 모달용)
  useEffect(() => {
    const handleModalOpen = (e: any) => {
      if (e.detail === 'slots') {
        setShowSlotsModal(true)
      } else if (e.detail === 'views') {
        setShowViewsModal(true)
      }
    }

    window.addEventListener('open-modal', handleModalOpen)
    return () => window.removeEventListener('open-modal', handleModalOpen)
  }, [])

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

  // 카드 뷰 스와이프 핸들러
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      console.log('Swiped Left');
      setCardIndex(i => Math.min(unlockedSlots - 1, i + 1));
    },
    onSwipedRight: () => {
      console.log('Swiped Right');
      setCardIndex(i => Math.max(0, i - 1));
    },
    trackMouse: true,
    delta: 10,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackTouch: true,
  });

  // 영어 텍스트로 변환
  const getSlotLabel = (index: number) => {
    if (index === 0) return '0 Views'
    if (index === 1) return '100 Views'
    if (index === 2) return '500 Views'
    if (index === 3) return '1K Views'
    if (index === 4) return '2K Views'
    if (index === 5) return '4K Views'
    if (index === 6) return '8K Views'
    if (index === 7) return '16K Views'
    if (index === 8) return '32K Views'
    return 'Locked'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // 앨범이 없을 때
  if (error || !photos || photos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-2">Album not found</div>
          <div className="text-gray-400 mb-4">Please check the link again</div>
          <div className="text-gray-500 text-sm mb-4">UID: {params.uid}</div>
          <a href="/" className="text-blue-400 hover:underline">Back to Home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar albumUid={params.uid} />
      {/* 모바일: 세그먼트 컨트롤 - 툴바 바로 아래 */}
      <div className="block md:hidden w-full pt-2 pb-1">
        <SegmentedControl value={mobileView} onChange={setMobileView} />
      </div>
      <div className={`container mx-auto px-4 py-8 ${isMobile ? 'pb-16' : ''}`}>
        {/* Cards 뷰 (모바일, cards 탭) */}
        {isMobile && mobileView === 'cards' ? (
          <div className="flex flex-col items-center justify-center min-h-[320px]">
            <div className="w-full max-w-xs mx-auto flex flex-col items-center">
              <div className="relative w-full h-80 flex items-center justify-center select-none">
                {/* 겹치는 카드들 */}
                <div className="w-64 h-80 flex items-center justify-center mx-8 relative">
                  {Array.from({ length: unlockedSlots }).map((_, i) => {
                    const photo = photos[i];
                    const isUnlocked = i < unlockedSlots;
                    const isEmpty = !photo;
                    const bgColor = slotColors[i];
                    // 카드 위치/스케일/투명도 계산
                    const offset = i - cardIndex;
                    const z = 10 - Math.abs(offset);
                    const scale = offset === 0 ? 1 : 0.92 - Math.abs(offset) * 0.04;
                    const translateX = offset * 24;
                    const opacity = Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.25;
                    return (
                      <div
                        key={i}
                        {...(offset === 0 ? swipeHandlers : {})}
                        style={{
                          backgroundColor: isUnlocked ? bgColor : '#fff',
                          transition: 'all 0.3s',
                          zIndex: z,
                          transform: `translateX(${translateX}px) scale(${scale})`,
                          opacity,
                        }}
                        className={`absolute top-0 left-0 aspect-[4/5] w-64 h-80 rounded-[999px] overflow-hidden flex items-center justify-center shadow-lg mx-auto
                          ${isEmpty ? (isUnlocked ? '' : 'opacity-50') : ''}
                          ${offset === 0 ? 'ring-2 ring-black' : ''}
                        `}
                      >
                        {photo ? (
                          <div className="relative w-full h-full group rounded-[999px] overflow-hidden pointer-events-none">
                            <Image
                              src={photo.url}
                              alt={photo.alt || `Photo ${i + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="text-center pointer-events-none">
                            <Eye className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                            <p className="text-sm text-gray-700 font-inconsolata">{getSlotLabel(i)}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* 인디케이터 */}
              <div className="flex justify-center mt-4 gap-2">
                {Array.from({ length: unlockedSlots }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === cardIndex ? 'bg-black' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // 기존 그리드 뷰 (PC+모바일 grid 탭)
          <div className="bg-black rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }, (_, index) => {
                const photo = photos[index];
                const isUnlocked = index < unlockedSlots;
                const hasPhoto = photo && photo.url;
                const bgColor = slotColors[index];
                const glow = slotGlow ? slotGlow[index] : '';
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: isUnlocked ? bgColor : '#fff',
                      transition: 'box-shadow 0.3s, border 0.3s',
                    }}
                    className={`aspect-[4/5] rounded-[999px] overflow-hidden flex items-center justify-center transition-all duration-300 cursor-pointer
                      ${!hasPhoto ? (isUnlocked ? '' : 'opacity-50 cursor-default') : ''}
                      ${shakeIndex === index ? 'shake' : ''}
                    `}
                    onClick={() => {
                      if (!isUnlocked) {
                        setShakeIndex(index);
                        setTimeout(() => setShakeIndex(null), 400);
                        return;
                      }
                      // 업로드: 열린 슬롯 & 비어있을 때
                      if (isUnlocked && !hasPhoto) {
                        // 업로드 input 트리거 (홈화면과 동일)
                        (window as any).clickedSlotIndex = index;
                        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (input) input.click();
                        return;
                      }
                      // PC에서만 사진 클릭 시 확대
                      if (!isMobile && hasPhoto) {
                        setEnlargedPhoto(photo);
                        return;
                      }
                    }}
                    onMouseEnter={e => {
                      if (isUnlocked) {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = glow;
                        (e.currentTarget as HTMLDivElement).style.border = `6px solid ${bgColor}`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (isUnlocked) {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                        (e.currentTarget as HTMLDivElement).style.border = 'none';
                      }
                    }}
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
                    ) : isUnlocked ? (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-inconsolata">Upload Photo</p>
                      </div>
                    ) : (
                      <div className="text-center pointer-events-none">
                        <div className="text-gray-400 text-4xl font-bold font-inconsolata">
                          {index + 1}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* 하단 안내는 모바일에선 container 바깥에서 렌더링 */}
      </div>
      
      {/* Slots Modal */}
      {showSlotsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowSlotsModal(false)}>
          <div className="rounded-[48px] bg-white shadow-2xl p-10 w-[420px] max-w-full relative flex flex-col items-center text-black" onClick={(e) => e.stopPropagation()} style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
            <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600" onClick={()=>setShowSlotsModal(false)}>
              <span style={{fontSize: 28, fontWeight: 700}}>&times;</span>
            </button>
            <div className="w-full flex flex-col items-center mb-8">
              <div className="text-[38px] font-bold text-black mb-2 font-inconsolata">{unlockedSlots} Slot{unlockedSlots > 1 ? 's' : ''} Open</div>
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
                  <span>{currentUserUid === params.uid ? 'Your Rank' : "This User's Rank"}</span>
                  <span className="font-bold">#{userPercentile}</span>
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
            <div className="text-xs text-black font-inconsolata">this user has {unlockedSlots} slot{unlockedSlots > 1 ? 's' : ''} open</div>
          </div>
        </div>
      )}
      
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
      {/* PC: 하단 안내에만 여백 추가 */}
      {!isMobile && (
        <div className="text-center mt-10">
          <div className="flex items-center justify-center space-x-4 text-sm text-white font-inconsolata">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <span className="text-gray-500">|</span>
            <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <span className="text-gray-500">|</span>
            <a href="mailto:ninepics99@gmail.com" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      )}
      {/* PC: 사진 확대 모달 */}
      {!isMobile && enlargedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fadein" onClick={() => setEnlargedPhoto(null)}>
          <div className="relative max-w-2xl w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img src={enlargedPhoto.url} alt={enlargedPhoto.alt || ''} className="max-h-[80vh] max-w-full rounded-3xl shadow-2xl border-4 border-white" />
          </div>
        </div>
      )}
    </div>
  )
} 