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
  last7DaysViews,
  mostActiveDay,
  mostActiveCount,
  onClose,
}: {
  totalViews: number;
  daysSinceCreated: number;
  last7DaysViews: number;
  mostActiveDay: string;
  mostActiveCount: number;
  onClose: () => void;
}) {
  const cards = [
    {
      bg: 'bg-[#3B82F6]', // 진한 파란색
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="12" stroke="white" strokeWidth="2"/>
          <circle cx="14" cy="14" r="5" fill="white"/>
          <circle cx="14" cy="14" r="2" fill="#3B82F6"/>
        </svg>
      ),
      label: 'Total Views',
      value: totalViews,
      className: 'col-span-2 row-span-2'
    },
    {
      bg: 'bg-[#10B981]', // 진한 초록색
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="6" width="16" height="10" rx="2" stroke="white" strokeWidth="2"/>
          <line x1="2" y1="9" x2="18" y2="9" stroke="white" strokeWidth="2"/>
          <circle cx="6" cy="7" r="1" fill="white"/>
          <circle cx="9" cy="7" r="1" fill="white"/>
        </svg>
      ),
      label: 'Days Since',
      value: `D+${daysSinceCreated}`,
      className: 'col-span-1 row-span-1'
    },
    {
      bg: 'bg-[#F59E0B]', // 진한 주황색
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="2"/>
          <path d="M10 5v5l3 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      label: 'Views in 7 Days',
      value: last7DaysViews,
      className: 'col-span-1 row-span-1'
    },
    {
      bg: 'bg-[#8B5CF6]', // 진한 보라색
      icon: (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M14 2l3.61 7.31L25 10.82l-5.84 5.68 1.37 8.02L14 20.73l-6.53 3.79L8.84 16.5 3 10.82l7.39-1.51L14 2z" fill="white"/>
        </svg>
      ),
      label: 'Most Active Day',
      value: mostActiveDay !== '-' ? `${mostActiveDay} (${mostActiveCount})` : '-',
      className: 'col-span-2 row-span-2'
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="rounded-[48px] bg-white shadow-2xl p-8 w-[600px] max-w-full relative flex flex-col items-center text-black font-inconsolata" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-3xl font-bold" onClick={onClose}>
          ×
        </button>
        <div className="grid grid-cols-3 grid-rows-4 gap-3 w-full mt-4 h-[400px]">
          {/* Total Views - 좌상단 2x2 (3D Globe SVG와 텍스트) */}
          <div className={`rounded-3xl ${cards[0].bg} flex col-span-2 row-span-2 shadow-lg p-0 overflow-hidden`}>
            <div className="flex-1 flex items-center justify-center bg-transparent">
              <Globe3D />
            </div>
            <div className="flex-1 flex flex-col justify-center items-start pl-2">
              <div className="text-base font-semibold text-white opacity-90 mb-1">{cards[0].label}</div>
              <div className="text-3xl font-bold text-white leading-tight">{cards[0].value}</div>
            </div>
          </div>
          {/* Days Since - 우상단 1x2 (가로 확장) */}
          <div className={`rounded-3xl ${cards[1].bg} flex flex-col items-center justify-center p-4 shadow-lg col-span-1 row-span-2`}>
            <div className="mb-2">{cards[1].icon}</div>
            <div className="text-xl font-bold text-white mb-1 text-center leading-tight">{cards[1].value}</div>
            <div className="text-sm font-semibold text-white opacity-90 text-center">{cards[1].label}</div>
          </div>
          {/* Views in 7 Days - 우하단 1x2 (Most Active Day와 동일한 세로 폭) */}
          <div className={`rounded-3xl ${cards[2].bg} flex flex-col items-center justify-center p-3 shadow-lg col-span-1 row-span-2`}>
            <div className="mb-2">{cards[2].icon}</div>
            <div className="text-lg font-bold text-white mb-1 text-center leading-tight">{cards[2].value}</div>
            <div className="text-sm font-semibold text-white opacity-90 text-center">{cards[2].label}</div>
          </div>
          {/* Most Active Day - 좌하단 2x2 */}
          <div className={`rounded-3xl ${cards[3].bg} flex flex-col items-center justify-center p-5 shadow-lg col-span-2 row-span-2`}>
            <div className="mb-2">{cards[3].icon}</div>
            <div className="text-2xl font-bold text-white mb-1 text-center leading-tight">{cards[3].value}</div>
            <div className="text-base font-semibold text-white opacity-90 text-center">{cards[3].label}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 