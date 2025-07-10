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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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

  useEffect(() => {
    if (albumUid && userUid) {
      const isCurrentUserOwner = albumUid === userUid;
      setIsOwner(isCurrentUserOwner);
      if (!isCurrentUserOwner) {
        const tempNickname = albumUid.substring(0, 8);
        setAlbumOwnerEmail(tempNickname);
      }
    } else {
      setIsOwner(true);
      setAlbumOwnerEmail('');
    }
  }, [albumUid, userUid]);

  const handleSignUpSuccess = () => {
    setShowSignUp(false)
    if (onUserChanged) onUserChanged()
  }

  const handleLogout = () => {
    // Firebase 로그아웃은 MyAccountModal에서 처리되므로
    // 여기서는 상태만 초기화
    setUserEmail('')
    setUserUid('')
    setIsLoggedIn(false)
  }

  const handleLinkClick = () => {
    if (!isLoggedIn) {
      window.dispatchEvent(new CustomEvent('show-login-toast'));
      return;
    }
    setShowLinkModal(true);
  };

  const getAccountButtonText = () => {
    if (isOwner) {
      return 'My Account';
    } else {
      return albumOwnerEmail || 'User';
    }
  };

  const handleMobileMenuClick = (action: string) => {
    setShowMobileMenu(false);
    switch (action) {
      case 'slots':
        window.dispatchEvent(new CustomEvent('open-modal', { detail: 'slots' }));
        break;
      case 'views':
        window.dispatchEvent(new CustomEvent('open-modal', { detail: 'views' }));
        break;
      case 'link':
        handleLinkClick();
        break;
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-center min-w-0" style={{pointerEvents: 'none'}}>
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-black rounded-full shadow-md mb-8 max-w-3xl w-full border border-gray-700 border-opacity-40 min-w-0" style={{borderRadius: '9999px', pointerEvents: 'auto'}}>
          {/* 로고 */}
          <a href="/" className="flex items-center font-bold text-3xl sm:text-5xl text-white font-arsenale whitespace-nowrap min-w-0 flex-shrink-0 cursor-pointer">ninepics</a>
          
          {/* 데스크탑 메뉴 (md 이상에서만 표시) */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="flex space-x-8 text-sm sm:text-base font-medium text-gray-200 font-inconsolata">
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
            </div>
          </div>

          {/* 오른쪽 계정 버튼 및 햄버거 메뉴 */}
          <div className="flex items-center ml-4 space-x-2">
            {isLoggedIn ? (
              <button
                className="px-7 py-2 rounded-full bg-white text-black font-semibold text-xs sm:text-base whitespace-nowrap min-w-0 shadow font-inconsolata"
                onClick={()=>setShowAccount(true)}
              >
                {getAccountButtonText()}
              </button>
            ) : (
              <>
                <button
                  className="px-5 py-2 rounded-full bg-[#f1f2ee] text-black font-bold text-sm whitespace-nowrap min-w-0 shadow font-inconsolata"
                  onClick={() => {
                    setModalType('login');
                    setShowSignUp(true);
                  }}
                >
                  Log in
                </button>
                <button
                  className="px-5 py-2 rounded-full bg-[#232733] text-white font-bold text-sm whitespace-nowrap min-w-0 shadow font-inconsolata"
                  onClick={() => {
                    setModalType('signup');
                    setShowSignUp(true);
                  }}
                >
                  Sign Up
                </button>
              </>
            )}

            {/* 햄버거 메뉴 버튼 (md 이하에서만 표시) */}
            <div className="md:hidden relative">
              <button
                className="p-2 text-white hover:text-primary transition-colors"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* 모바일 사이드 슬라이드 메뉴 */}
              {showMobileMenu && (
                <>
                  {/* 오버레이 */}
                  <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-40"
                    onClick={() => setShowMobileMenu(false)}
                  />
                  {/* 사이드 메뉴 */}
                  <div className="fixed top-0 right-0 h-full w-64 bg-black border-l border-gray-700 shadow-lg z-50 flex flex-col pt-20 animate-slidein">
                    <button
                      className="block w-full text-left px-6 py-4 text-lg text-gray-200 hover:text-primary hover:bg-gray-800 transition-colors border-b border-gray-800"
                      onClick={() => handleMobileMenuClick('slots')}
                    >
                      Slots
                    </button>
                    <button
                      className="block w-full text-left px-6 py-4 text-lg text-gray-200 hover:text-primary hover:bg-gray-800 transition-colors border-b border-gray-800"
                      onClick={() => handleMobileMenuClick('views')}
                    >
                      Views
                    </button>
                    <button
                      className="block w-full text-left px-6 py-4 text-lg text-gray-200 hover:text-primary hover:bg-gray-800 transition-colors"
                      onClick={() => handleMobileMenuClick('link')}
                    >
                      Link
                    </button>
                  </div>
                  <style jsx global>{`
                    @keyframes slidein {
                      from { transform: translateX(100%); }
                      to { transform: translateX(0); }
                    }
                    .animate-slidein {
                      animation: slidein 0.25s cubic-bezier(0.4,0,0.2,1);
                    }
                  `}</style>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 오버레이 (클릭 시 메뉴 닫기) */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

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