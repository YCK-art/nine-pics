'use client'

import React, { useRef, useState } from 'react'
import { Upload, Share2, X, Eye } from 'lucide-react'
import Image from 'next/image'
import { getFirestore, collection, getDocs, query, where, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { initializeApp, getApps } from 'firebase/app'
import ViewsModal from './components/ViewsModal'
import Navbar from './components/Navbar'
import SegmentedControl from './components/SegmentedControl';
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
  storageBucket: "nine-pics-a761a.firebasestorage.app",
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
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [progress, setProgress] = useState(0);
  const [showLoginToast, setShowLoginToast] = useState(false);
  const showLoginToastMessage = () => {
    setShowLoginToast(true);
    setTimeout(() => setShowLoginToast(false), 2000);
  };
  const [showViewsModal, setShowViewsModal] = useState(false);
  const [shakeIndex, setShakeIndex] = useState<number|null>(null);
  const [albumMeta, setAlbumMeta] = useState<{ totalViews: number, createdAt: string | null }>({ totalViews: 0, createdAt: null });
  const [userUid, setUserUid] = useState<string>('');
  const [isMobile, setIsMobile] = React.useState(false);
  const [mobileView, setMobileView] = React.useState<'cards' | 'grid'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 'cards';
    return 'grid';
  });
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
  // 모바일 진입 시 디폴트 cards로
  const [cardIndex, setCardIndex] = React.useState(0);

  // Firebase Auth 상태 감지
  React.useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
      setUserUid(user?.uid || '')
    })
    return () => unsubscribe()
  }, [])

  // fileInputRef 초기화 확인
  React.useEffect(() => {
    console.log('fileInputRef 상태:', fileInputRef.current)
  }, [fileInputRef.current])

  // 예시 데이터
  // const totalUsers = 12345
  // const usersInFirstSlot = 6789
  // const userPercentile = 12

  // 조회수에 따른 슬롯 해제 로직
  const getUnlockedSlots = () => {
    const v = typeof viewCount === 'number' ? viewCount : 0;
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

  // 사용자별 앨범 ID 관리
  React.useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      // 사용자별 고유 앨범 ID 생성
      const userAlbumId = `user-${currentUser.uid}`;
      setAlbumId(userAlbumId);
    } else {
      setAlbumId('');
      setPhotos([]);
    }
  }, [isLoggedIn]);

  // Firestore에서 사용자별 앨범 데이터 및 메타 정보 구독
  React.useEffect(() => {
    if (!isLoggedIn || !albumId) return;
    const albumRef = doc(db, 'albums', albumId);
    const unsubscribe = onSnapshot(albumRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPhotos((data.photos || []).slice(0, getUnlockedSlots()));
        const totalViews = data.totalViews || data.viewCount || 0;
        setAlbumMeta({
          totalViews: totalViews,
          createdAt: data.createdAt || null,
        });
        setViewCount(totalViews);
      } else {
        setPhotos([]);
        setAlbumMeta({ totalViews: 0, createdAt: null });
      }
    });
    return () => unsubscribe();
  }, [albumId, viewCount, isLoggedIn]);

  // daysSinceCreated 계산
  const daysSinceCreated = albumMeta.createdAt ? Math.max(1, Math.ceil((Date.now() - new Date(albumMeta.createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 1;

  // 사진 업로드 함수 리팩토링 (사용자별 앨범 관리 + 슬롯 교체)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    console.log('업로드 시작 - setIsUploading(true)');
    setIsUploading(true);

    try {
      const storage = getStorage();
      const userAlbumId = `user-${currentUser.uid}`;
      const albumRef = doc(db, 'albums', userAlbumId);
      const albumSnap = await getDoc(albumRef);
      let existingPhotos = albumSnap.exists() ? (albumSnap.data().photos || []) : [];
      
      // 클릭된 슬롯 인덱스 확인
      const clickedSlotIndex = (window as any).clickedSlotIndex;
      const isReplacingSlot = clickedSlotIndex !== undefined && clickedSlotIndex < getUnlockedSlots();
      
      let updatedPhotos;
      
      if (isReplacingSlot && files.length > 0) {
        // 특정 슬롯 교체 - 단일 파일만 처리
        const file = files[0];
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageRef = ref(storage, `albums/${userAlbumId}/${safeFileName}`);
        const metadata = { contentType: file.type };
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);
        
        const uploadedPhoto = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(storageRef);
              resolve({
                id: `photo-${Date.now()}`,
                url,
                alt: file.name,
              });
            }
          );
        });
        
        // 해당 슬롯에 사진 교체
        existingPhotos[clickedSlotIndex] = uploadedPhoto as any;
        updatedPhotos = existingPhotos.slice(0, getUnlockedSlots());
      } else {
        // 빈 슬롯에 추가 - 단일 파일만 처리
        if (files.length > 0) {
          const file = files[0];
          const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const storageRef = ref(storage, `albums/${userAlbumId}/${safeFileName}`);
          const metadata = { contentType: file.type };
          const uploadTask = uploadBytesResumable(storageRef, file, metadata);
          
          const uploadedPhoto = await new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              null,
              (error) => reject(error),
              async () => {
                const url = await getDownloadURL(storageRef);
                resolve({
                  id: `photo-${Date.now()}`,
                  url,
                  alt: file.name,
                });
              }
            );
          });
          
          // 빈 슬롯을 찾아서 추가
          let targetIndex = existingPhotos.length;
          for (let i = 0; i < getUnlockedSlots(); i++) {
            if (!existingPhotos[i]) {
              targetIndex = i;
              break;
            }
          }
          
          if (targetIndex < getUnlockedSlots()) {
            existingPhotos[targetIndex] = uploadedPhoto as any;
            updatedPhotos = existingPhotos.slice(0, getUnlockedSlots());
          } else {
            updatedPhotos = existingPhotos;
          }
        } else {
          updatedPhotos = existingPhotos;
        }
      }
      
      if (updatedPhotos.length > 0) {
        if (!albumSnap.exists()) {
          await setDoc(albumRef, {
            id: userAlbumId,
            photos: updatedPhotos,
            viewCount: 0,
            totalViews: 0,
            createdAt: new Date().toISOString(),
            userId: currentUser.uid,
            userEmail: currentUser.email,
          });
        } else {
          await updateDoc(albumRef, { photos: updatedPhotos });
        }
        setPhotos(updatedPhotos);
      }
    } catch (err: any) {
      console.error('업로드 실패:', err);
      alert('업로드 실패: ' + (err?.message || err));
    } finally {
      console.log('업로드 완료 - setIsUploading(false)');
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // 클릭된 슬롯 인덱스 초기화
      (window as any).clickedSlotIndex = undefined;
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId))
  }

  const shareAlbum = () => {
    if (albumId) {
      const shareUrl = `https://www.ninepics.com/album/${albumId}`;
      navigator.clipboard.writeText(shareUrl)
      alert('앨범 링크가 클립보드에 복사되었습니다!')
    }
  }

  // 프레임 클릭 시 파일 업로드 input 트리거
  const handleFrameClick = (isUnlocked: boolean, slotIndex: number) => {
    console.log('프레임 클릭됨, 해제됨:', isUnlocked, '슬롯 인덱스:', slotIndex)
    console.log('isUploading 상태:', isUploading)
    console.log('fileInputRef 상태:', fileInputRef.current)
    
    if (!isUnlocked) {
      setShakeIndex(slotIndex);
      setTimeout(() => setShakeIndex(null), 400);
      return
    }
    
    // 로그인 상태 확인
    const auth = getAuth()
    const currentUser = auth.currentUser
    console.log('클릭 시 사용자:', currentUser?.email)
    
    if (!currentUser) {
      showLoginToastMessage();
      return;
    }
    
    if (isUploading) {
      console.log('업로드 중이므로 클릭 무시')
      return;
    }
    
    // 클릭된 슬롯 인덱스를 전역 변수로 저장
    (window as any).clickedSlotIndex = slotIndex;
    
    if (fileInputRef.current) {
      console.log('파일 input 클릭 트리거')
      fileInputRef.current.click()
    } else {
      console.log('파일 input이 null입니다')
      // fileInputRef가 null인 경우 강제로 input을 찾아서 클릭
      const inputElement = document.querySelector('input[type="file"]') as HTMLInputElement
      if (inputElement) {
        console.log('DOM에서 파일 input을 찾아서 클릭')
        inputElement.click()
      } else {
        console.log('DOM에서도 파일 input을 찾을 수 없습니다')
      }
    }
  }

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

  // Slots/Views/Link 메뉴 클릭 핸들러
  React.useEffect(() => {
    const handler = (e: any) => {
      const auth = getAuth()
      const currentUser = auth.currentUser
      
      if (!currentUser && ['slots', 'views', 'link'].includes(e.detail)) {
        showLoginToastMessage();
        return;
      }
      if (e.detail === 'slots') setShowSlotsModal(true)
    }
    window.addEventListener('open-modal', handler)
    return () => window.removeEventListener('open-modal', handler)
  }, [])

  // ViewsModal 전역 트리거
  React.useEffect(() => {
    const handler = (e: any) => {
      const auth = getAuth()
      const currentUser = auth.currentUser
      
      if (e.detail === 'views') {
        if (!currentUser) {
          showLoginToastMessage();
          return;
        }
        setShowViewsModal(true);
      }
    };
    window.addEventListener('open-modal', handler);
    return () => window.removeEventListener('open-modal', handler);
  }, []);

  // 로그인 토스트 메시지 전역 트리거
  React.useEffect(() => {
    const handler = () => {
      showLoginToastMessage();
    };
    window.addEventListener('show-login-toast', handler);
    return () => window.removeEventListener('show-login-toast', handler);
  }, []);

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

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Toast 메시지 */}
      {showLoginToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white px-8 py-4 rounded-2xl text-lg font-inconsolata shadow-2xl animate-fadeinout transition-all duration-500">
            You need to log in to perform this action.
          </div>
        </div>
      )}
      {/* Slots 모달 */}
      {showSlotsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowSlotsModal(false)}>
          <div className="rounded-[48px] bg-white shadow-2xl p-10 w-[420px] max-w-full relative flex flex-col items-center text-black" onClick={(e) => e.stopPropagation()} style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
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
      {/* 로그인 필요 모달 */}
      {/* 기존 showLoginModal 모달 제거 */}
      {showViewsModal && (
        <ViewsModal
          totalViews={albumMeta.totalViews}
          daysSinceCreated={daysSinceCreated}
          onClose={() => setShowViewsModal(false)}
        />
      )}
      <Navbar albumUid={userUid} />
      {/* 모바일: 세그먼트 컨트롤 - 툴바 바로 아래 */}
      <div className="block md:hidden w-full pt-2 pb-1">
        <SegmentedControl value={mobileView} onChange={setMobileView} />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-4 flex-1 flex flex-col pb-16 sm:pb-0">
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
                      const glow = slotGlow[i];
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
                          onClick={() => {
                            if (!isLoggedIn) {
                              showLoginToastMessage();
                              return;
                            }
                            handleFrameClick(isUnlocked, i);
                          }}
                          style={{
                            backgroundColor: isUnlocked ? bgColor : '#fff',
                            transition: 'all 0.3s',
                            zIndex: z,
                            transform: `translateX(${translateX}px) scale(${scale})`,
                            opacity,
                          }}
                          className={`absolute top-0 left-0 aspect-[4/5] w-64 h-80 rounded-[999px] overflow-hidden flex items-center justify-center shadow-lg mx-auto cursor-pointer
                            ${isEmpty ? (isUnlocked ? '' : 'opacity-50') : ''}
                            ${offset === 0 ? 'ring-2 ring-black' : ''}
                          `}
                        >
                          {photo ? (
                            <div className="relative w-full h-full group rounded-[999px] overflow-hidden pointer-events-none">
                              <Image
                                src={photo.url}
                                alt={photo.alt}
                                fill
                                className="object-cover"
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); removePhoto(photo.id) }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity pointer-events-auto z-10"
                                style={{ pointerEvents: 'auto' }}
                              >
                                ×
                              </button>
                            </div>
                          ) : isUnlocked ? (
                            isUploading ? (
                              <div className="text-center pointer-events-none">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                <p className="text-sm text-white font-inconsolata">Loading...</p>
                              </div>
                            ) : (
                              <div className="text-center pointer-events-none">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 font-inconsolata">Add Photo</p>
                              </div>
                            )
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
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 9 }, (_, index) => {
                const photo = photos.slice(0, unlockedSlots)[index]
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
                      ${shakeIndex === index ? 'shake' : ''}
                    `}
                    onClick={() => handleFrameClick(isUnlocked, index)}
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
                        {/* PC: 삭제 버튼 (마우스 오버 시만 보임, 모바일은 숨김) */}
                        <button
                          onClick={e => { e.stopPropagation(); removePhoto(photo.id); }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity pointer-events-auto z-10 hidden md:flex"
                          style={{ pointerEvents: 'auto' }}
                        >
                          ×
                        </button>
                      </div>
                    ) : isUnlocked ? (
                      isUploading ? (
                        <div className="text-center pointer-events-none">
                          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <p className="text-xs md:text-sm text-white font-inconsolata">
                            Loading
                            <span className="loading-dot">.</span>
                            <span className="loading-dot">.</span>
                            <span className="loading-dot">.</span>
                          </p>
                          {/* 디버깅용 */}
                          <div className="text-xs text-white opacity-50">isUploading: {isUploading.toString()}</div>
                        </div>
                      ) : (
                        <div className="text-center pointer-events-none">
                          <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs md:text-sm text-gray-500 font-inconsolata">Add Photo</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center pointer-events-none">
                        <Eye className="w-6 h-6 md:w-8 md:h-8 text-gray-700 mx-auto mb-2" />
                        <p className="text-xs md:text-sm text-gray-700 font-inconsolata">
                          {getSlotLabel(index)}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          {/* 숨겨진 파일 업로드 input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
            style={{ display: 'none' }}
          />
        </div>

        {/* Privacy Policy, Terms of Service, Contact 링크들 */}
        <div className="text-center mt-2 pb-2 md:mt-16 md:pb-8">
          <div className="flex items-center justify-center space-x-4 text-xs md:text-sm text-white font-inconsolata">
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <span className="text-gray-500">|</span>
            <a href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <span className="text-gray-500">|</span>
            <a href="mailto:ninepics99@gmail.com" className="hover:text-gray-300 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </div>
  )
} 