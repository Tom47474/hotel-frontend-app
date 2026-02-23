"use client";

interface HotelDetailFooterProps {
  lowestPrice: number;
  roomCount?: number;
}

export function HotelDetailFooter({
  lowestPrice,
  roomCount = 1,
}: HotelDetailFooterProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-4 px-4 py-3 bg-white border-t border-zinc-200 shadow-[0_-2px 10px rgba(0,0,0,0.05)]">
      <button
        type="button"
        className="flex flex-col items-center text-zinc-600"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-xs mt-0.5">问酒店</span>
      </button>
      <div className="flex-1 flex items-center justify-end gap-3">
        <div className="text-right">
          <p className="text-xs text-zinc-500">¥{lowestPrice}起</p>
          <p className="text-xs text-zinc-400">{roomCount}间</p>
        </div>
        <button
          type="button"
          className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded"
        >
          查看房型
        </button>
      </div>
    </footer>
  );
}
