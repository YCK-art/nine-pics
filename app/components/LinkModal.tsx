import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';

export default function LinkModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  let userLink = '';
  let displayLink = '';
  if (typeof window !== 'undefined') {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (uid) {
      userLink = `https://www.ninepics.com/album/${uid}`;
      displayLink = `ninepics.com/album/${uid}`;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const maxLen = isMobile ? 12 : 18;
      if (displayLink.length > maxLen) {
        displayLink = displayLink.substring(0, maxLen) + '...';
      }
    }
  }

  const handleCopy = () => {
    if (userLink) {
      navigator.clipboard.writeText(userLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="rounded-[48px] bg-white shadow-2xl p-10 w-[500px] max-w-full relative flex flex-col items-center text-black font-inconsolata" onClick={(e) => e.stopPropagation()} style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-3xl font-bold" onClick={onClose}>
          ×
        </button>
        <h2 className="text-4xl font-bold text-black mb-6">Add to bio</h2>
        <div className={`flex items-center w-full justify-between border border-gray-200 rounded-xl px-4 py-4 bg-white mt-8 mb-4 ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'gap-2' : ''}`}>
          {/* 검은색 링크 아이콘 */}
          <span className="mr-3 flex items-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className={`text-lg font-inconsolata text-black ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'truncate max-w-[110px] inline-block align-middle' : ''}`}>{displayLink || '로그인 필요'}</span>
          <button
            className={`ml-2 px-3 py-1 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold text-base focus:outline-none ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'whitespace-nowrap' : ''}`}
            onClick={handleCopy}
            disabled={!userLink}
            style={typeof window !== 'undefined' && window.innerWidth < 768 ? {fontSize:'15px', height:'32px', minWidth:'56px'} : {}}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        {/* 소셜미디어 아이콘들 */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          {/* Instagram */}
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="#000000"/>
            </svg>
          </a>
          
          <span className="text-gray-400">|</span>
          
          {/* Snapchat */}
          <a href="https://snapchat.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <img src="/snapchat.png" alt="Snapchat" width="24" height="24" />
          </a>
          
          <span className="text-gray-400">|</span>
          
          {/* TikTok */}
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.11V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="#000000"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
} 