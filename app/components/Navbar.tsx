'use client'

import React, { useState } from 'react'
import SignUpModal from './SignUpModal'
import MyAccountModal from './MyAccountModal'
import { getAuth } from 'firebase/auth'

export default function Navbar({ onUserChanged }: { onUserChanged?: () => void } = {}) {
  const [showSignUp, setShowSignUp] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAccount, setShowAccount] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [modalType, setModalType] = useState<'signup' | 'login'>('signup')

  // 로그인/회원가입 성공 시 콜백
  const handleSignUpSuccess = () => {
    const user = getAuth().currentUser
    setShowSignUp(false)
    setIsLoggedIn(true)
    setUserEmail(user?.email || '')
    if (onUserChanged) onUserChanged()
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserEmail('')
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-center min-w-0" style={{pointerEvents: 'none'}}>
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 bg-black rounded-full shadow-md mb-8 max-w-3xl w-full border border-gray-700 border-opacity-40 min-w-0" style={{borderRadius: '9999px', pointerEvents: 'auto'}}>
          {/* 로고 */}
          <div className="flex items-center font-bold text-3xl sm:text-5xl text-white font-arsenale whitespace-nowrap min-w-0 flex-shrink-0">ninepics</div>
          {/* 메뉴 */}
          <div className="flex space-x-4 sm:space-x-8 text-sm sm:text-base font-medium text-gray-200 font-inconsolata min-w-0 overflow-hidden">
            <button
              className="hover:text-primary transition-colors bg-transparent border-none outline-none p-0 m-0 cursor-pointer whitespace-nowrap min-w-0 flex-shrink"
              style={{background:'none'}}
              onClick={() => window.dispatchEvent(new CustomEvent('open-modal', { detail: 'slots' }))}
            >
              Slots
            </button>
            <a href="#" className="hover:text-primary transition-colors whitespace-nowrap min-w-0 flex-shrink">Views</a>
            <a href="#" className="hover:text-primary transition-colors whitespace-nowrap min-w-0 flex-shrink">Link</a>
          </div>
          {/* 로그인/회원가입 or My Account */}
          <div className="flex items-center space-x-2 sm:space-x-4 font-inconsolata min-w-0">
            {isLoggedIn ? (
              <button className="px-7 py-2 rounded-full bg-white text-black font-semibold text-xs sm:text-base whitespace-nowrap min-w-0 shadow" onClick={()=>setShowAccount(true)}>My Account</button>
            ) : (
              <>
                <button className="px-4 sm:px-6 py-2 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-colors text-xs sm:text-base whitespace-nowrap min-w-0" onClick={()=>{setModalType('login'); setShowSignUp(true);}}>Log in</button>
                <button className="px-5 sm:px-7 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors text-xs sm:text-base whitespace-nowrap min-w-0" onClick={()=>{setModalType('signup'); setShowSignUp(true);}}>Sign up</button>
              </>
            )}
          </div>
        </div>
      </nav>
      {showSignUp && <SignUpModal onClose={()=>setShowSignUp(false)} onSuccess={handleSignUpSuccess} type={modalType} />}
      {showAccount && <MyAccountModal email={userEmail} onClose={()=>setShowAccount(false)} onLogout={handleLogout} />}
    </>
  )
} 