'use client'

import React, { useState } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { User, Link as LinkIcon } from 'lucide-react'

export default function MyAccountModal({ email, onClose, onLogout, albumUid }: { email: string, onClose: () => void, onLogout: () => void, albumUid?: string }) {
  const [copied, setCopied] = useState(false)
  let userLink = '';
  let displayLink = '';
  let isOwner = true;
  if (typeof window !== 'undefined') {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (albumUid && uid && albumUid !== uid) {
      isOwner = false;
    }
    if (uid) {
      userLink = `https://www.ninepics.com/album/${uid}`;
      displayLink = `ninepics.com/album/${uid}`;
      if (displayLink.length > 18) {
        displayLink = displayLink.substring(0, 18) + '...';
      }
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

  return (
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
          {isOwner && (
            <>
              <button
                className="flex-1 py-3 rounded-full bg-black text-white font-semibold font-inconsolata text-base hover:bg-gray-800 transition-colors"
                onClick={handleLogout}
              >
                Log out
              </button>
              <button
                className="flex-1 py-3 rounded-full bg-gray-200 text-black font-semibold font-inconsolata text-base hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                onClick={handleCopy}
              >
                <LinkIcon className="w-5 h-5 mr-1" />
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 