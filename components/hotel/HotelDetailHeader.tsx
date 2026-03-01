"use client";

import Link from "next/link";

interface HotelDetailHeaderProps {
  name: string;
  backHref?: string;
}

function IconButton({
  onClick,
  children,
  "aria-label": ariaLabel,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 text-zinc-600 hover:text-zinc-900"
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export function HotelDetailHeader({
  name,
  backHref = "/",
}: HotelDetailHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 bg-white px-4 py-3 border-b border-zinc-100">
      <Link
        href={backHref}
        className="flex-shrink-0 p-2 -ml-2 text-zinc-600 hover:text-zinc-900"
        aria-label="返回"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      <h1 className="flex-1 truncate text-base font-medium text-zinc-900 pr-2">
        {name}
      </h1>
      {/* <div className="flex items-center flex-shrink-0">
        <IconButton aria-label="收藏">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </IconButton>
        <IconButton aria-label="分享">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </IconButton>
        <IconButton aria-label="购物车">
          <span className="relative inline-block">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-medium">
              0
            </span>
          </span>
        </IconButton>
        <IconButton aria-label="更多">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="6" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="18" r="1.5" />
          </svg>
        </IconButton>
      </div> */}
    </header>
  );
}
