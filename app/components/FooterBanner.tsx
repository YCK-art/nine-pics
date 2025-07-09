'use client'

import React from 'react'

export default function FooterBanner() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-max">
      <div className="flex items-center px-5 py-2 rounded-full font-inconsolata font-semibold text-base shadow-lg"
        style={{
          background: 'linear-gradient(90deg, rgba(224,212,247,0.85) 70%, rgba(255,123,36,0.85) 100%)',
          color: '#222',
          backdropFilter: 'blur(4px)',
        }}
      >
        <span className="mr-2 text-lg">✶</span>
        Start <b className="mx-1">ninepics</b> together!
      </div>
    </div>
  )
} 