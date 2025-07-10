import React from 'react';

interface SegmentedControlProps {
  value: 'cards' | 'grid';
  onChange: (value: 'cards' | 'grid') => void;
  className?: string;
}

export default function SegmentedControl({ value, onChange, className = '' }: SegmentedControlProps) {
  return (
    <div
      className={`relative flex w-[120px] h-9 mx-auto rounded-full bg-white/20 shadow-md overflow-hidden ${className}`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* 토글(흰색 원형) */}
      <div
        className="absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: value === 'cards' ? '4px' : 'calc(50% + 4px)' }}
      />
      <button
        className={`flex-1 z-10 font-bold text-sm transition-colors duration-200 rounded-full min-w-0 ${value === 'cards' ? 'text-black' : 'text-gray-700'}`}
        onClick={() => onChange('cards')}
        type="button"
        style={{ fontWeight: 700 }}
      >
        Cards
      </button>
      <button
        className={`flex-1 z-10 font-bold text-sm transition-colors duration-200 rounded-full min-w-0 ${value === 'grid' ? 'text-black' : 'text-gray-700'}`}
        onClick={() => onChange('grid')}
        type="button"
        style={{ fontWeight: 700 }}
      >
        Grid
      </button>
    </div>
  );
} 