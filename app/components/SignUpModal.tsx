'use client'

import React from 'react'
import Image from 'next/image'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

// Firebase 설정 (하드코딩)
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
  if (typeof window !== 'undefined') {
    import('firebase/analytics').then(({ getAnalytics }) => {
      try { getAnalytics(); } catch {}
    })
  }
}
const db = getFirestore()

export default function SignUpModal({ onClose, onSuccess, type = 'signup' }: { onClose: () => void, onSuccess?: () => void, type?: 'signup' | 'login' }) {
  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const auth = getAuth()
      const result = await signInWithPopup(auth, provider)
      // Firestore에 유저 정보 및 slotLevel 저장
      const userRef = doc(db, 'users', result.user.uid)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          slotLevel: 1,
        })
      } else {
        // 이미 유저가 있으면 slotLevel이 없을 때만 1로 세팅
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
          <button
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-white shadow font-inconsolata text-lg font-semibold hover:bg-gray-100 transition-colors text-black border-2"
            style={{ borderColor: '#000' }}
            onClick={handleGoogleSignUp}
          >
            <Image src="/google-logo.png" alt="Google" width={28} height={28} />
            {type === 'login' ? 'Log in with Google' : 'Sign up with Google'}
          </button>
        </div>
        <div className="text-xs text-gray-500 font-inconsolata text-center">
          Powered by Google OAuth
        </div>
      </div>
    </div>
  )
} 