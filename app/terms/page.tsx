"use client"

import React, { useState, useEffect } from 'react'
import { getFirestore, collection, onSnapshot, doc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { initializeApp, getApps } from 'firebase/app'
import Navbar from '../components/Navbar'
import ViewsModal from '../components/ViewsModal'
import SlotsModal from '../components/SlotsModal'

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

// 슬롯 테두리 컬러
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

export default function TermsOfService() {
  const [showSlotsModal, setShowSlotsModal] = useState(false)
  const [showViewsModal, setShowViewsModal] = useState(false)
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [usersAt1Slot, setUsersAt1Slot] = useState<number>(0)
  const [userPercentile, setUserPercentile] = useState<number>(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userUid, setUserUid] = useState<string>('')
  const [albumMeta, setAlbumMeta] = useState<{ totalViews: number, createdAt: string | null }>({ totalViews: 0, createdAt: null })

  // Firebase Auth 상태 감지
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
      setUserUid(user?.uid || '')
    })
    return () => unsubscribe()
  }, [])

  // 조회수에 따른 슬롯 해제 로직
  const getUnlockedSlots = () => {
    if (albumMeta.totalViews >= 32000) return 9
    if (albumMeta.totalViews >= 16000) return 8
    if (albumMeta.totalViews >= 8000) return 7
    if (albumMeta.totalViews >= 4000) return 6
    if (albumMeta.totalViews >= 2000) return 5
    if (albumMeta.totalViews >= 1000) return 4
    if (albumMeta.totalViews >= 500) return 3
    if (albumMeta.totalViews >= 100) return 2
    return 1
  }

  const unlockedSlots = getUnlockedSlots()

  // 현재 로그인한 유저의 slotLevel을 가져오는 함수
  useEffect(() => {
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

  // 사용자별 앨범 메타 정보 구독
  useEffect(() => {
    if (!isLoggedIn || !userUid) return;
    const albumId = `user-${userUid}`;
    const albumRef = doc(db, 'albums', albumId);
    const unsubscribe = onSnapshot(albumRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAlbumMeta({
          totalViews: data.totalViews || data.viewCount || 0,
          createdAt: data.createdAt || null,
        });
      } else {
        setAlbumMeta({ totalViews: 0, createdAt: null });
      }
    });
    return () => unsubscribe();
  }, [userUid, isLoggedIn]);

  // daysSinceCreated 계산
  const daysSinceCreated = albumMeta.createdAt ? Math.max(1, Math.ceil((Date.now() - new Date(albumMeta.createdAt).getTime()) / (1000 * 60 * 60 * 24))) : 1;

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar albumUid={userUid} />
      <div className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-8 max-w-4xl flex-1 flex flex-col">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 font-inconsolata">Terms of Service</h1>
            <p className="text-gray-400">Effective: July 10, 2025</p>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed flex-1">
            <div>
              <p className="mb-4">
                These Terms of Service ("Terms") govern your use of ninepics ("we," "our," or "us") and our digital album service ("Service"). By using our Service, you agree to these Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">1. Service Overview</h2>
              <p className="mb-4">
                ninepics is a digital album platform where you can sign up and log in using your Google account.
                Users can upload one photo at first, and additional slots (up to a total of nine) unlock as the album receives more views.
                You can share your album link on social media profiles, similar to Instagram bio links.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">2. Account</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You can sign up and log in through your Google account.</li>
                <li>You are responsible for keeping your account secure, and we are not responsible for unauthorized use of your account.</li>
                <li>You must provide accurate and truthful information. You are solely responsible for any issues caused by false or misleading information.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">3. User Responsibilities</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You must comply with applicable laws and these Terms when using the Service.</li>
                <li>You must not upload content that infringes the rights of others (such as copyright, portrait rights) or that is illegal or inappropriate.</li>
                <li>You are solely responsible for the content you upload, and we disclaim all liability for it.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">4. Service Availability and Changes</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>We may modify, suspend, or discontinue the Service at any time without prior notice.</li>
                <li>We are not responsible for any damages incurred by you as a result of changes, suspension, or termination of the Service.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">5. Intellectual Property</h2>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>All rights to the logo, design, system, and other elements of the Service belong to us. You may not use them without our prior consent.</li>
                <li>Copyright of uploaded content remains with you, but you grant us a license to use it for operating the Service.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">6. Disclaimer</h2>
              <p className="mb-4">
                We strive to provide the Service in a stable manner.
                However, we are not responsible for any damages caused by force majeure events, system failures, external attacks, or your own negligence or violation of these Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">7. Changes to the Terms</h2>
              <p className="mb-4">
                We may update these Terms to reflect changes in laws or improvements to the Service.
                The updated Terms will take effect once posted on this page.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">8. Governing Law and Jurisdiction</h2>
              <p className="mb-4">
                These Terms are governed by the laws of the Republic of Korea.
                Any disputes arising from or related to these Terms shall be subject to the exclusive jurisdiction of the Seoul Central District Court.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">9. Contact</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="mb-4">
                📧 ninepics99@gmail.com
              </p>
            </div>
          </div>

          <div className="mt-auto pt-8 text-center">
            <a href="/" className="text-blue-400 hover:text-blue-300 font-inconsolata flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Back to Home
            </a>
          </div>
        </div>
      </div>

      {/* Slots Modal */}
      {showSlotsModal && (
        <SlotsModal
          totalUsers={totalUsers}
          usersAt1Slot={usersAt1Slot}
          userPercentile={userPercentile}
          unlockedSlots={unlockedSlots}
          slotBorderColors={slotBorderColors}
          onClose={() => setShowSlotsModal(false)}
        />
      )}

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