import React from 'react';
import { X } from 'lucide-react';

interface SlotsModalProps {
  totalUsers: number;
  usersAt1Slot: number;
  userPercentile: number;
  unlockedSlots: number;
  slotBorderColors: string[];
  onClose: () => void;
}

export default function SlotsModal({
  totalUsers,
  usersAt1Slot,
  userPercentile,
  unlockedSlots,
  slotBorderColors,
  onClose,
}: SlotsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="rounded-[48px] bg-white shadow-2xl p-10 w-[420px] max-w-full relative flex flex-col items-center text-black" onClick={(e) => e.stopPropagation()} style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-600" onClick={onClose}>
          <X size={28}/>
        </button>
        <div className="w-full flex flex-col items-center mb-8">
          <div className="text-[38px] font-bold text-black mb-2 font-inconsolata">{unlockedSlots} Slot{unlockedSlots > 1 ? 's' : ''} Open</div>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between text-black text-lg font-inconsolata">
              <span>Total Users</span>
              <span className="font-bold">{totalUsers.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-black text-lg font-inconsolata">
              <span>Users at 1 Slot</span>
              <span className="font-bold">{usersAt1Slot.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-black text-lg font-inconsolata">
              <span>Your Percentile</span>
              <span className="font-bold">Top {userPercentile}%</span>
            </div>
          </div>
        </div>
        {/* 미니 9개 프레임 */}
        <div className="grid grid-cols-9 gap-2 mb-2">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className="w-6 h-8 rounded-[999px] border-2"
              style={
                i < unlockedSlots
                  ? { background: slotBorderColors[i], borderColor: slotBorderColors[i] }
                  : { background: '#f3f4f6', borderColor: '#e5e7eb', opacity: 0.5 }
              }
            ></div>
          ))}
        </div>
        <div className="text-xs text-black font-inconsolata">the {unlockedSlots}st slot is open</div>
      </div>
    </div>
  );
} 