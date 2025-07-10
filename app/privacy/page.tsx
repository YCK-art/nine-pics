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

export default function PrivacyPage() {
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
    if (albumMeta.totalViews >= 30000000) return 9
    if (albumMeta.totalViews >= 15000000) return 8
    if (albumMeta.totalViews >= 5000000) return 7
    if (albumMeta.totalViews >= 1000000) return 6
    if (albumMeta.totalViews >= 200000) return 5
    if (albumMeta.totalViews >= 20000) return 4
    if (albumMeta.totalViews >= 1000) return 3
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
            <h1 className="text-4xl font-bold mb-4 font-inconsolata">Privacy Policy</h1>
            <p className="text-gray-400">Effective: July 10, 2025</p>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed flex-1">
            <div>
              <p className="mb-4">
                ninepics ("we," "our," or "us") values your privacy and collects only the minimum personal information necessary to provide and improve our service. This Privacy Policy explains what information we collect, how we use and protect it, and your rights.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">1. Scope</h2>
              <p className="mb-4">
                This Privacy Policy applies to all users of the ninepics website and related services ("Service").
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">2. Information We Collect</h2>
              <p className="mb-4">
                We collect the following information to provide and improve our Service:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, and profile picture provided by Google when you log in</li>
                <li><strong>Usage Data:</strong> Access logs, IP address, browser information, and traffic data</li>
                <li><strong>Uploaded Content:</strong> Images you upload to the Service</li>
              </ul>
              <p className="mb-4">
                We do not collect passwords, financial information, or sensitive personal data.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">3. How We Use Personal Information</h2>
              <p className="mb-4">
                We use the collected information solely for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Providing and operating the Service</li>
                <li>Improving service quality and user experience</li>
                <li>Strengthening security and detecting errors</li>
                <li>Complying with legal obligations</li>
              </ul>
              <p className="mb-4">
                We do not sell or share your personal information with third parties, except where required by law.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">4. Third-Party Disclosure</h2>
              <p className="mb-4">
                We do not disclose your personal information to third parties except when required to do so by applicable laws or legal processes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">5. Data Retention</h2>
              <p className="mb-4">
                We retain personal information only for as long as necessary to fulfill the purposes stated above or to comply with legal obligations.
                When you request to delete your account, we will also delete your related data without undue delay.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">6. Security</h2>
              <p className="mb-4">
                We implement reasonable technical and administrative measures to protect your personal information.
                However, due to the nature of the Internet, we cannot guarantee complete security, and we are not responsible for breaches beyond our reasonable control as permitted by law.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">7. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Request access to your personal information</li>
                <li>Request correction or deletion of your personal information</li>
                <li>Request suspension of processing of your personal information</li>
              </ul>
              <p className="mb-4">
                To exercise your rights, please contact us by email:
              </p>
              <p className="mb-4">
                📧 ninepics99@gmail.com
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">8. Children's Privacy</h2>
              <p className="mb-4">
                Our Service is not intended for use by anyone under the age of 18.
                We do not knowingly collect personal information from children.
                If we become aware that we have collected personal information from a child, we will promptly delete it.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">9. Changes to This Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time to reflect changes in laws or our Service.
                Any significant changes will be announced on our website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4 font-inconsolata">10. Contact</h2>
              <p className="mb-4">
                If you have any questions or concerns about this Privacy Policy, please contact us at:
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