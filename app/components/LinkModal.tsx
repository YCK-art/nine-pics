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
      userLink = `https://www.ninepics.com/${uid}`;
      displayLink = `ninepics.com/${uid}`;
      if (displayLink.length > 18) {
        displayLink = displayLink.substring(0, 18) + '...';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-[48px] bg-white shadow-2xl p-10 w-[500px] max-w-full relative flex flex-col items-center text-black font-inconsolata" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-3xl font-bold" onClick={onClose}>
          ×
        </button>
        <div className="flex items-center w-full justify-between border border-gray-200 rounded-xl px-4 py-4 bg-white mt-8 mb-4">
          {/* 초록색 ninepics 로고(asterisk) */}
          <span className="mr-3 flex items-center">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M14 3v22" stroke="#3FE86B" strokeWidth="3" strokeLinecap="round"/>
                <path d="M14 14l8.485-8.485" stroke="#3FE86B" strokeWidth="3" strokeLinecap="round"/>
                <path d="M14 14l8.485 8.485" stroke="#3FE86B" strokeWidth="3" strokeLinecap="round"/>
                <path d="M14 14l-8.485-8.485" stroke="#3FE86B" strokeWidth="3" strokeLinecap="round"/>
                <path d="M14 14l-8.485 8.485" stroke="#3FE86B" strokeWidth="3" strokeLinecap="round"/>
                <path d="M3 14h22" stroke="#3FE86B" strokeWidth="3" strokeLinecap="round"/>
              </g>
            </svg>
          </span>
          <span className="text-lg font-inconsolata text-black">{displayLink || '로그인 필요'}</span>
          <button
            className="ml-4 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-primary font-semibold text-base focus:outline-none"
            onClick={handleCopy}
            disabled={!userLink}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
} 