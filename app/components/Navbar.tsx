'use client'

import React, { useState, useEffect } from 'react'
import SignUpModal from './SignUpModal'
import MyAccountModal from './MyAccountModal'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import LinkModal from './LinkModal';
import { Menu } from 'lucide-react';

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

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-center min-w-0">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-black rounded-full shadow-md mb-8 max-w-3xl w-full border border-gray-700 border-opacity-40 min-w-0" style={{borderRadius: '9999px', pointerEvents: 'auto'}}>
          {/* 로고 */}
          <a href="/" className="flex items-center font-bold text-3xl sm:text-5xl text-white font-arsenale whitespace-nowrap min-w-0 flex-shrink-0 cursor-pointer">ninepics</a>

          {/* PC: 기존 메뉴, 모바일: 숨김 */}
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

          {/* PC: 기존 계정 버튼, 모바일: 숨김 */}
          <div className="hidden md:flex items-center ml-4 space-x-2">
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
          </div>

          {/* 모바일: 로고+로그인/회원가입+햄버거 */}
          <div className="flex md:hidden items-center space-x-2 ml-auto">
            {isLoggedIn ? (
              <button
                className="px-7 py-2 rounded-full bg-white text-black font-semibold text-sm whitespace-nowrap min-w-0 shadow font-inconsolata"
                onClick={()=>setShowAccount(true)}
              >
                {getAccountButtonText()}
              </button>
            ) : (
              <>
                <button
                  className="px-4 py-2 rounded-full bg-[#f1f2ee] text-black font-bold text-sm shadow font-inconsolata"
                  onClick={() => {
                    setModalType('login');
                    setShowSignUp(true);
                  }}
                >
                  Log in
                </button>
                <button
                  className="px-4 py-2 rounded-full bg-[#232733] text-white font-bold text-sm shadow font-inconsolata"
                  onClick={() => {
                    setModalType('signup');
                    setShowSignUp(true);
                  }}
                >
                  Sign Up
                </button>
              </>
            )}
            {/* 햄버거 버튼 */}
            <button
              className="ml-2 p-2 rounded-full bg-white text-black shadow border border-gray-300"
              onClick={() => setShowMobileMenu(true)}
              aria-label="메뉴 열기"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
      {/* 모바일 사이드 메뉴 */}
      {showMobileMenu && (
        <>
          {/* 오버레이 */}
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-40"
            onClick={() => setShowMobileMenu(false)}
          />
          {/* 사이드 메뉴 */}
          <div className="fixed top-0 right-0 h-full w-64 bg-black z-50 shadow-2xl flex flex-col pt-16 px-6 font-inconsolata animate-slidein">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-200" onClick={() => setShowMobileMenu(false)}>
              <span className="text-2xl">×</span>
            </button>
            <button
              className="text-white text-lg font-inconsolata py-3 text-left border-b border-gray-700"
              onClick={() => { setShowMobileMenu(false); window.dispatchEvent(new CustomEvent('open-modal', { detail: 'slots' })); }}
            >
              Slots
            </button>
            <button
              className="text-white text-lg font-inconsolata py-3 text-left border-b border-gray-700"
              onClick={() => { setShowMobileMenu(false); window.dispatchEvent(new CustomEvent('open-modal', { detail: 'views' })); }}
            >
              Views
            </button>
            <button
              className="text-white text-lg font-inconsolata py-3 text-left border-b border-gray-700"
              onClick={() => { setShowMobileMenu(false); handleLinkClick(); }}
            >
              Link
            </button>
          </div>
        </>
      )}
      {/* 모달들 */}
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