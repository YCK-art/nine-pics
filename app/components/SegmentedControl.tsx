import React from 'react';

interface SegmentedControlProps {
  value: 'cards' | 'grid';
  onChange: (value: 'cards' | 'grid') => void;
  className?: string;
}

export default function SegmentedControl({ value, onChange, className = '' }: SegmentedControlProps) {
  return (
    <div
      className={`relative flex w-[200px] h-10 mx-auto rounded-full bg-black/70 shadow-md overflow-hidden ${className}`}
      style={{ backdropFilter: 'blur(8px)' }}
    >
      {/* 토글(흰색 원형) */}
      <div
        className="absolute top-0 left-0 w-24 h-10 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: value === 'cards' ? '0px' : '50%' }}
      />
      <button
        className={`flex-1 z-10 font-bold text-base transition-colors duration-200 rounded-full min-w-0 ${value === 'cards' ? 'text-black' : 'text-white'}`}
        onClick={() => onChange('cards')}
        type="button"
        style={{ fontWeight: 700, minWidth: 0 }}
      >
        Cards
      </button>
      <button
        className={`flex-1 z-10 font-bold text-base transition-colors duration-200 rounded-full min-w-0 ${value === 'grid' ? 'text-black' : 'text-white'}`}
        onClick={() => onChange('grid')}
        type="button"
        style={{ fontWeight: 700, minWidth: 0 }}
      >
        Grid
      </button>
    </div>
  );
} 