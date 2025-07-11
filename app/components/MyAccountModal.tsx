'use client'

import React, { useState } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { User, Link as LinkIcon } from 'lucide-react'
import SignUpModal from './SignUpModal'

export default function MyAccountModal({ email, onClose, onLogout, albumUid }: { email: string, onClose: () => void, onLogout: () => void, albumUid?: string }) {
  const [copied, setCopied] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [modalType, setModalType] = useState<'signup' | 'login'>('signup')
  const [userLink, setUserLink] = useState('')
  const [displayLink, setDisplayLink] = useState('')
  const [isOwner, setIsOwner] = useState(true)

  React.useEffect(() => {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (albumUid && uid && albumUid !== uid) {
      setIsOwner(false);
    }
    if (uid) {
      // 사용자명으로 링크 생성 시도
      const getUserLink = async () => {
        try {
          const { getFirestore, doc, getDoc } = await import('firebase/firestore');
          const db = getFirestore();
          const userRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.username) {
              setUserLink(`https://www.ninepics.com/album/${userData.username}`);
              setDisplayLink(`ninepics.com/album/${userData.username}`);
            } else {
              setUserLink(`https://www.ninepics.com/album/${uid}`);
              setDisplayLink(`ninepics.com/album/${uid}`);
            }
          } else {
            setUserLink(`https://www.ninepics.com/album/${uid}`);
            setDisplayLink(`ninepics.com/album/${uid}`);
          }
        } catch (error) {
          console.error('Error getting user link:', error);
          setUserLink(`https://www.ninepics.com/album/${uid}`);
          setDisplayLink(`ninepics.com/album/${uid}`);
        }
      };
      getUserLink();
    }
  }, [albumUid])

  const handleCopy = () => {
    if (userLink) {
      navigator.clipboard.writeText(userLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(getAuth())
      onLogout()
      onClose()
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  const handleSignUpSuccess = () => {
    setShowSignUp(false)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
        <div className="rounded-[48px] bg-white shadow-2xl p-0 w-[420px] max-w-full relative flex flex-col items-center" onClick={(e) => e.stopPropagation()} style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
          <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600" onClick={onClose}>
            <span style={{fontSize: 28, fontWeight: 700}}>&times;</span>
          </button>
          <div className="w-full flex flex-col items-center pt-10 pb-6 px-8">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
              <User className="w-14 h-14 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-black font-inconsolata mb-1">@{email ? email.split('@')[0] : 'user'}</div>
            <div className="text-gray-500 text-sm font-inconsolata mb-6">/{email ? email.split('@')[0] : 'user'}</div>
          </div>
          <div className="w-full flex items-center justify-center gap-4 border-t border-gray-200 px-8 py-6 bg-gray-50 rounded-b-[48px]">
            {isOwner ? (
              // 내 계정일 때: Log out, Copy Link 버튼
              <>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-full font-inconsolata font-semibold hover:bg-red-600 transition-colors"
                >
                  Log out
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 bg-black text-white py-3 px-4 rounded-full font-inconsolata font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <LinkIcon size={16} />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </>
            ) : (
              // 다른 유저의 앨범일 때: Log in, Sign up 버튼
              <>
                <button
                  onClick={() => {
                    setModalType('login')
                    setShowSignUp(true)
                  }}
                  className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-full font-inconsolata font-semibold hover:bg-blue-600 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setModalType('signup')
                    setShowSignUp(true)
                  }}
                  className="flex-1 bg-black text-white py-3 px-4 rounded-full font-inconsolata font-semibold hover:bg-gray-800 transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onSuccess={handleSignUpSuccess}
          type={modalType}
        />
      )}
    </>
  )
} 