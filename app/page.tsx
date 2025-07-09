'use client'

import React, { useRef, useState } from 'react'
import { Upload, Share2, X, Eye } from 'lucide-react'
import Image from 'next/image'
import { getFirestore, collection, getDocs, query, where, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
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

  // Firebase Auth 상태 감지
  React.useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
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

  // Firestore에서 앨범 데이터 불러오기 (실시간 반영)
  React.useEffect(() => {
    if (!albumId) return;
    const albumRef = doc(db, 'albums', albumId);
    const unsubscribe = onSnapshot(albumRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setPhotos((data.photos || []).slice(0, getUnlockedSlots()));
      }
    });
    return () => unsubscribe();
  }, [albumId, viewCount]);

  // 사진 업로드 함수 리팩토링 (uploadBytesResumable 사용)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const storage = getStorage();
      let currentAlbumId = albumId;
      if (!currentAlbumId) {
        currentAlbumId = `album-${Date.now()}`;
        setAlbumId(currentAlbumId);
      }
      const albumRef = doc(db, 'albums', currentAlbumId);
      const albumSnap = await getDoc(albumRef);
      let existingPhotos = albumSnap.exists() ? (albumSnap.data().photos || []) : [];
      const availableSlots = getUnlockedSlots() - existingPhotos.length;
      const filesArr = Array.from(files).slice(0, availableSlots);
      const uploadPromises = filesArr.map((file, idx) => {
        return new Promise((resolve, reject) => {
          const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const storageRef = ref(storage, `albums/${currentAlbumId}/${safeFileName}`);
          const metadata = { contentType: file.type };
          const uploadTask = uploadBytesResumable(storageRef, file, metadata);
          uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error),
            async () => {
              const url = await getDownloadURL(storageRef);
              resolve({
                id: `photo-${Date.now()}-${idx}`,
                url,
                alt: file.name,
              });
            }
          );
        });
      });
      const uploadedPhotos = await Promise.all(uploadPromises);
      if (uploadedPhotos.length > 0) {
        const updatedPhotos = [...existingPhotos, ...uploadedPhotos].slice(0, getUnlockedSlots());
        if (!albumSnap.exists()) {
          await setDoc(albumRef, {
            id: currentAlbumId,
            photos: updatedPhotos,
            viewCount: 0,
            createdAt: new Date().toISOString(),
            userId: getAuth().currentUser?.uid || '',
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
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
    console.log('프레임 클릭됨, 해제됨:', isUnlocked)
    console.log('isUploading 상태:', isUploading)
    console.log('fileInputRef 상태:', fileInputRef.current)
    
    if (!isUnlocked) {
      console.log('잠긴 슬롯이므로 클릭 무시')
      return
    }
    
    // 로그인 상태 확인
    const auth = getAuth()
    const currentUser = auth.currentUser
    console.log('클릭 시 사용자:', currentUser?.email)
    
    if (!currentUser) {
      alert('사진을 업로드하려면 로그인이 필요합니다.')
      return
    }
    
    // isUploading 상태 강제로 false로 설정 (디버깅용)
    if (isUploading) {
      console.log('업로드 중이므로 강제로 false로 설정')
      setIsUploading(false)
    }
    
    if (fileInputRef.current) {
      console.log('파일 input 클릭 트리거')
      // 파일 input을 직접 표시하여 사용자가 선택할 수 있도록 함
      fileInputRef.current.style.display = 'block'
      fileInputRef.current.style.position = 'absolute'
      fileInputRef.current.style.top = '50%'
      fileInputRef.current.style.left = '50%'
      fileInputRef.current.style.transform = 'translate(-50%, -50%)'
      fileInputRef.current.style.zIndex = '1000'
      fileInputRef.current.click()
      
      // 3초 후 다시 숨김
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.style.display = 'none'
        }
      }, 3000)
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