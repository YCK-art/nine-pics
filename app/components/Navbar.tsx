'use client'

import React, { useState, useEffect } from 'react'
import SignUpModal from './SignUpModal'
import MyAccountModal from './MyAccountModal'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import LinkModal from './LinkModal';

export default function Navbar({ onUserChanged, albumUid }: { onUserChanged?: () => void, albumUid?: string } = {}) {
  const [showSignUp, setShowSignUp] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userUid, setUserUid] = useState<string>('');
  const [modalType, setModalType] = useState<'signup' | 'login'>('signup')
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [albumOwnerEmail, setAlbumOwnerEmail] = useState<string>('');
  const [isOwner, setIsOwner] = useState(true);

  // Firebase Auth 상태 감지
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true)
        setUserEmail(user.email || '')
        setUserUid(user.uid || '')
        if (onUserChanged) onUserChanged()
      } else {
        setIsLoggedIn(false)
        setUserEmail('')
        setUserUid('')
      }
    })
    return () => unsubscribe()
  }, [onUserChanged])

  // 앨범 주인 확인 및 닉네임 설정
  useEffect(() => {
    if (albumUid && userUid) {
      const isCurrentUserOwner = albumUid === userUid;
      setIsOwner(isCurrentUserOwner);
      
      if (!isCurrentUserOwner) {
        // 다른 유저의 앨범일 때, 앨범 주인의 이메일을 가져와서 닉네임으로 사용
        // 실제로는 Firestore에서 해당 유저의 이메일을 가져와야 하지만,
        // 현재는 URL의 UID를 기반으로 임시 닉네임 생성
        const tempNickname = albumUid.substring(0, 8); // UID의 앞 8자리를 닉네임으로 사용
        setAlbumOwnerEmail(tempNickname);
      }
    } else {
      setIsOwner(true);
      setAlbumOwnerEmail('');
    }
  }, [albumUid, userUid]);

  // 로그인/회원가입 성공 시 콜백
  const handleSignUpSuccess = () => {
    setShowSignUp(false)
    if (onUserChanged) onUserChanged()
  }

  const handleLogout = () => {
    setUserEmail('')
  }

  // Link 메뉴 클릭 핸들러
  const handleLinkClick = () => {
    if (!isLoggedIn) {
      // 로그인 안내 메시지 표시
      window.dispatchEvent(new CustomEvent('show-login-toast'));
      return;
    }
    setShowLinkModal(true);
  };

  // 계정 버튼 텍스트 결정
  const getAccountButtonText = () => {
    if (isOwner) {
      return 'My Account';
    } else {
      return albumOwnerEmail || 'User';
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-center min-w-0" style={{pointerEvents: 'none'}}>
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-black rounded-full shadow-md mb-8 max-w-3xl w-full border border-gray-700 border-opacity-40 min-w-0" style={{borderRadius: '9999px', pointerEvents: 'auto'}}>
          {/* 로고 */}
          <a href="/" className="flex items-center font-bold text-3xl sm:text-5xl text-white font-arsenale whitespace-nowrap min-w-0 flex-shrink-0 cursor-pointer">ninepics</a>
          {/* 메뉴 */}
          <div className="flex space-x-4 sm:space-x-8 text-sm sm:text-base font-medium text-gray-200 font-inconsolata min-w-0 overflow-hidden">
            <button
              className="hover:text-primary transition-colors bg-transparent border-none outline-none p-0 m-0 cursor-pointer whitespace-nowrap min-w-0 flex-shrink"
              style={{background:'none'}}
              onClick={() => window.dispatchEvent(new CustomEvent('open-modal', { detail: 'slots' }))}
            >
              Slots
            </button>
            <a
              href="#"
              className="hover:text-primary transition-colors whitespace-nowrap min-w-0 flex-shrink"
              onClick={e => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent('open-modal', { detail: 'views' }));
              }}
            >
              Views
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors whitespace-nowrap min-w-0 flex-shrink"
              onClick={e => {
                e.preventDefault();
                handleLinkClick();
              }}
            >
              Link
            </a>
            <button
              className="hover:text-primary transition-colors bg-transparent border-none outline-none p-0 m-0 cursor-pointer whitespace-nowrap min-w-0 flex-shrink"
              style={{background:'none'}}
              onClick={() => setShowAccount(true)}
            >
              {getAccountButtonText()}
            </button>
          </div>
        </div>
      </nav>
      {showSignUp && <SignUpModal onClose={()=>setShowSignUp(false)} onSuccess={handleSignUpSuccess} type={modalType} />}
      {showAccount && (
        <MyAccountModal
          email={isOwner ? userEmail : albumOwnerEmail}
          onClose={() => setShowAccount(false)}
          onLogout={handleLogout}
          albumUid={albumUid}
        />
      )}
      {showLinkModal && <LinkModal onClose={() => setShowLinkModal(false)} />}
    </>
  )
} 