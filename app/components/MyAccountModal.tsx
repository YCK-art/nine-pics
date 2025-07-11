'use client'

import React, { useState } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { User, Link as LinkIcon, Edit } from 'lucide-react'
import SignUpModal from './SignUpModal'

export default function MyAccountModal({ email, onClose, onLogout, albumUid }: { email: string, onClose: () => void, onLogout: () => void, albumUid?: string }) {
  const [copied, setCopied] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [modalType, setModalType] = useState<'signup' | 'login'>('signup')
  const [userLink, setUserLink] = useState('')
  const [displayLink, setDisplayLink] = useState('')
  const [isOwner, setIsOwner] = useState(true)
  const [showUsernameInput, setShowUsernameInput] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [isSettingUsername, setIsSettingUsername] = useState(false)

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
          const { getFirestore, doc, getDoc, updateDoc } = await import('firebase/firestore');
          const db = getFirestore();
          const userRef = doc(db, 'users', uid);
          const userSnap = await getDoc(userRef);
          console.log('MyAccountModal - User exists:', userSnap.exists());
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('MyAccountModal - User data:', userData);
            console.log('MyAccountModal - Username:', userData.username);
            
            // 사용자명이 없으면 이메일에서 자동 생성
            if (!userData.username && userData.email) {
              const autoUsername = userData.email.split('@')[0];
              console.log('MyAccountModal - Auto-generating username:', autoUsername);
              
              // 자동으로 사용자명 설정
              await updateDoc(userRef, { username: autoUsername });
              
              const usernameUrl = `https://www.ninepics.com/album/${autoUsername}`;
              console.log('MyAccountModal - Using auto-generated username URL:', usernameUrl);
              setUserLink(usernameUrl);
              setDisplayLink(`ninepics.com/album/${autoUsername}`);
            } else if (userData.username) {
              const usernameUrl = `https://www.ninepics.com/album/${userData.username}`;
              console.log('MyAccountModal - Using existing username URL:', usernameUrl);
              setUserLink(usernameUrl);
              setDisplayLink(`ninepics.com/album/${userData.username}`);
            } else {
              const uidUrl = `https://www.ninepics.com/album/${uid}`;
              console.log('MyAccountModal - Using UID URL:', uidUrl);
              setUserLink(uidUrl);
              setDisplayLink(`ninepics.com/album/${uid}`);
            }
          } else {
            const uidUrl = `https://www.ninepics.com/album/${uid}`;
            console.log('MyAccountModal - User not found, using UID URL:', uidUrl);
            setUserLink(uidUrl);
            setDisplayLink(`ninepics.com/album/${uid}`);
          }
        } catch (error) {
          console.error('Error getting user link:', error);
          const uidUrl = `https://www.ninepics.com/album/${uid}`;
          console.log('MyAccountModal - Error, using UID URL:', uidUrl);
          setUserLink(uidUrl);
          setDisplayLink(`ninepics.com/album/${uid}`);
        }
      };
      getUserLink();
    }
  }, [albumUid])

  const checkUsernameAvailability = async (username: string) => {
    if (!username) return false
    
    const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
    const db = getFirestore();
    const q = query(collection(db, 'users'), where('username', '==', username))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
  }

  const handleSetUsername = async () => {
    if (!newUsername.trim()) {
      setUsernameError('사용자명을 입력해주세요')
      return
    }

    setIsSettingUsername(true)
    try {
      const auth = getAuth()
      const currentUser = auth.currentUser
      if (!currentUser) {
        setUsernameError('로그인이 필요합니다')
        return
      }

      // 사용자명 중복 확인
      const isAvailable = await checkUsernameAvailability(newUsername.trim())
      if (!isAvailable) {
        setUsernameError('이미 사용 중인 사용자명입니다')
        return
      }

      // 사용자명 설정
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const userRef = doc(db, 'users', currentUser.uid)
      await updateDoc(userRef, { username: newUsername.trim() })

      // 링크 업데이트
      const usernameUrl = `https://www.ninepics.com/album/${newUsername.trim()}`;
      setUserLink(usernameUrl);
      setDisplayLink(`ninepics.com/album/${newUsername.trim()}`);

      setShowUsernameInput(false)
      setNewUsername('')
      setUsernameError('')
      alert('사용자명이 설정되었습니다!')
    } catch (error) {
      console.error('Error setting username:', error)
      setUsernameError('사용자명 설정 중 오류가 발생했습니다')
    } finally {
      setIsSettingUsername(false)
    }
  }

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
          
          {showUsernameInput ? (
            <div className="w-full px-8 py-6 bg-gray-50 rounded-b-[48px]">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inconsolata">
                  사용자명 설정
                </label>
                <input
                  type="text"
                  placeholder="사용자명을 입력하세요"
                  value={newUsername}
                  onChange={(e) => {
                    setNewUsername(e.target.value)
                    setUsernameError('')
                  }}
                  className="w-full px-4 py-3 rounded-full border-2 border-gray-300 focus:border-black outline-none font-inconsolata"
                  maxLength={20}
                />
                {usernameError && (
                  <p className="text-red-500 text-sm mt-1 font-inconsolata">{usernameError}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowUsernameInput(false)
                    setNewUsername('')
                    setUsernameError('')
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-full font-inconsolata font-semibold hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSetUsername}
                  disabled={isSettingUsername}
                  className="flex-1 bg-black text-white py-3 px-4 rounded-full font-inconsolata font-semibold hover:bg-gray-800 transition-colors"
                >
                  {isSettingUsername ? '설정 중...' : '설정'}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center gap-4 border-t border-gray-200 px-8 py-6 bg-gray-50 rounded-b-[48px]">
              {isOwner ? (
                // 내 계정일 때: Log out, Copy Link, Set Username 버튼
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
                  <button
                    onClick={() => setShowUsernameInput(true)}
                    className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-full font-inconsolata font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Set Username
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
          )}
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