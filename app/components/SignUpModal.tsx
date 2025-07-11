'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'

// Firebase 설정 (하드코딩)
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
  if (typeof window !== 'undefined') {
    import('firebase/analytics').then(({ getAnalytics }) => {
      try { getAnalytics(); } catch {}
    })
  }
}
const db = getFirestore()

export default function SignUpModal({ onClose, onSuccess, type = 'signup' }: { onClose: () => void, onSuccess?: () => void, type?: 'signup' | 'login' }) {
  const [username, setUsername] = useState('')
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  const checkUsernameAvailability = async (username: string) => {
    if (!username) return false
    
    const q = query(collection(db, 'users'), where('username', '==', username))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
  }

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const auth = getAuth()
      const result = await signInWithPopup(auth, provider)
      
      // 새 사용자인 경우에만 사용자명 입력 받기
      const userRef = doc(db, 'users', result.user.uid)
      const userSnap = await getDoc(userRef)
      
      if (!userSnap.exists()) {
        // 새 사용자 - 사용자명 입력 받기
        if (!username.trim()) {
          setUsernameError('사용자명을 입력해주세요')
          return
        }
        
        // 사용자명 중복 확인
        setIsCheckingUsername(true)
        const isAvailable = await checkUsernameAvailability(username.trim())
        setIsCheckingUsername(false)
        
        if (!isAvailable) {
          setUsernameError('이미 사용 중인 사용자명입니다')
          return
        }
        
        // 사용자 정보 저장
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          username: username.trim(),
          slotLevel: 1,
          createdAt: new Date().toISOString()
        })
      } else {
        // 기존 사용자 - slotLevel이 없을 때만 1로 세팅
        const data = userSnap.data()
        if (data.slotLevel === undefined) {
          await updateDoc(userRef, { slotLevel: 1 })
        }
      }
      
      onClose()
      if (onSuccess) onSuccess()
    } catch (error: any) {
      alert('구글 회원가입 실패: ' + (error?.message || error))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-[48px] bg-white shadow-2xl p-10 w-[420px] max-w-full relative flex flex-col items-center text-black" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <span style={{fontSize: 28, fontWeight: 700}}>&times;</span>
        </button>
        <div className="w-full flex flex-col items-center mb-8">
          <div className="text-[32px] font-bold text-black mb-4 font-inconsolata">{type === 'login' ? 'Log in' : 'Sign up'}</div>
          
          {type === 'signup' && (
            <div className="w-full mb-4">
              <input
                type="text"
                placeholder="사용자명을 입력하세요"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setUsernameError('')
                }}
                className="w-full px-4 py-3 rounded-full border-2 border-gray-300 focus:border-black outline-none font-inconsolata"
                maxLength={20}
              />
              {usernameError && (
                <p className="text-red-500 text-sm mt-1 font-inconsolata">{usernameError}</p>
              )}
            </div>
          )}
          
          <button
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-white shadow font-inconsolata text-lg font-semibold hover:bg-gray-100 transition-colors text-black border-2"
            style={{ borderColor: '#000' }}
            onClick={handleGoogleSignUp}
            disabled={isCheckingUsername}
          >
            <Image src="/google-logo.png" alt="Google" width={28} height={28} />
            {isCheckingUsername ? '확인 중...' : (type === 'login' ? 'Log in with Google' : 'Sign up with Google')}
          </button>
        </div>
        <div className="text-xs text-gray-500 font-inconsolata text-center">
          Powered by Google OAuth
        </div>
      </div>
    </div>
  )
} 