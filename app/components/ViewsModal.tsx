import React from 'react';
import Image from 'next/image';

// Iconify 3D Globe SVG (예시: https://icon-sets.iconify.design/emojione-v1/globe-showing-europe-africa/)
const Globe3D = () => (
  <svg width="90" height="90" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="36" r="28" fill="#61B2E4"/>
    <path d="M36 8C22.1929 8 11 19.1929 11 33C11 46.8071 22.1929 58 36 58C49.8071 58 61 46.8071 61 33C61 19.1929 49.8071 8 36 8Z" fill="#92D3F5"/>
    <ellipse cx="36" cy="33" rx="20" ry="25" fill="#B1CC33"/>
    <ellipse cx="36" cy="33" rx="12" ry="15" fill="#5C9E31"/>
    <ellipse cx="36" cy="33" rx="6" ry="7" fill="#61B2E4"/>
    <circle cx="36" cy="33" r="28" stroke="#3F3F3F" strokeWidth="2"/>
  </svg>
);

export default function ViewsModal({
  totalViews,
  daysSinceCreated,
  onClose,
}: {
  totalViews: number;
  daysSinceCreated: number;
  onClose: () => void;
}) {
  // 조회수를 K, M 단위로 요약하는 함수
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // 디버깅용 콘솔 로그
  console.log('ViewsModal props:', { totalViews, daysSinceCreated });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="rounded-[48px] bg-white shadow-2xl p-12 w-[420px] max-w-full relative flex flex-col items-center text-black font-inconsolata" onClick={(e) => e.stopPropagation()} style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-3xl font-bold" onClick={onClose}>
          ×
        </button>
        <div className="flex flex-col items-center justify-center w-full h-full gap-10 mt-6 mb-2">
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold mb-2">Total Views</div>
            <div className="text-5xl font-extrabold">{formatViews(totalViews)}</div>
            {/* 디버깅용 정보 */}
            <div className="text-xs text-gray-500 mt-2">Raw: {totalViews}</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-xl font-semibold mb-1">Joined</div>
            <div className="text-3xl font-bold">D+{daysSinceCreated}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 