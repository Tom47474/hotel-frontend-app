"use client";

import { useRef, useState, useEffect } from "react";
import type { HotelImage } from "@/types/hotel";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

const TABS = [
  { key: "cover", label: "封面" },
  { key: "detail", label: "精选" },
  { key: "album", label: "相册" },
] as const;

const VIDEO_EXT = /\.(mp4|webm|ogg|mov)(\?|$)/i;

function isVideo(item: HotelImage): boolean {
  if (item.mediaType === "video") return true;
  if (item.mediaType === "image") return false;
  return VIDEO_EXT.test(item.url);
}

interface HotelImageBannerProps {
  images: HotelImage[];
  alt?: string;
  reviewCount?: number;
}

const MuteIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

const UnmuteIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

export function HotelImageBanner({
  images,
  alt = "酒店图片",
}: HotelImageBannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState<Record<number, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const items = images?.length ? images : [];

  // 预加载首屏图片（前 3 张）
  useEffect(() => {
    if (!items.length || typeof window === 'undefined') return;

    const preloadCount = Math.min(3, items.length);
    
    for (let i = 0; i < preloadCount; i++) {
      const item = items[i];
      if (!isVideo(item)) {
        // 优化图片 URL
        const optimizedUrl = optimizeImageUrl(item.url, { 
          quality: 85, 
          width: 1200 
        });
        
        // 创建 Image 对象预加载
        const img = document.createElement('img');
        img.src = optimizedUrl;
        img.fetchPriority = 'high';
        
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(i));
          
          // 缓存到内存
          if ('caches' in window) {
            caches.open('hotel-images').then(cache => {
              cache.put(optimizedUrl, new Response('', {
                headers: { 'Content-Type': 'image/webp' }
              }));
            });
          }
        };
      }
    }
  }, [items]);

  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, items.length);
  }, [items.length]);
  const hasItems = items.length > 0;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !items.length) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(idx, items.length - 1));
    setActiveTab(Math.min(idx, TABS.length - 1));
  };

  const scrollToTab = (i: number) => {
    setActiveTab(i);
    const el = scrollRef.current;
    if (el && items.length > 0 && i < items.length) {
      el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    }
  };

  const handlePlay = (idx: number) => {
    const video = videoRefs.current[idx];
    if (video) {
      if (video.paused) {
        video.play();
        setPlaying((p) => ({ ...p, [idx]: true }));
      } else {
        video.pause();
        setPlaying((p) => ({ ...p, [idx]: false }));
      }
    }
  };

  const activeItem = items[activeIndex];
  const isActiveVideo = activeItem && isVideo(activeItem);

  if (!hasItems) {
    return (
      <div className="relative">
        <div className="aspect-[4/3] bg-zinc-200 flex items-center justify-center">
          <span className="text-zinc-500 text-sm">暂无图片</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
          <div className="flex gap-1">
            {TABS.map((t, i) => (
              <button
                key={t.key}
                type="button"
                className={`px-3 py-1 text-sm rounded ${i === 0 ? "bg-white/90 text-zinc-900 font-medium" : "text-white"}`}
              >
                {t.label}
                {t.key === "album" && " >"}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 预加载关键资源 */}
      {items.slice(0, 3).map((item, i) => !isVideo(item) && (
        <link
          key={`preload-${i}`}
          rel="preload"
          as="image"
          href={optimizeImageUrl(item.url, { quality: 85, width: 1200 })}
          fetchPriority="high"
        />
      ))}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide"
      >
        {items.map((item, i) => {
          const isVideoItem = isVideo(item);
          const isPreloaded = loadedImages.has(i);
          
          return (
            <div
              key={i}
              className="flex-shrink-0 w-full snap-center aspect-[4/3] bg-zinc-100 relative"
            >
              {isVideoItem ? (
                <>
                  <video
                    ref={(el) => { videoRefs.current[i] = el; }}
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted={muted}
                    playsInline
                    loop
                    onPlay={() => setPlaying((p) => ({ ...p, [i]: true }))}
                    onPause={() => setPlaying((p) => ({ ...p, [i]: false }))}
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePlay(i); }}
                    className="absolute inset-0 flex items-center justify-center hover:bg-black/10"
                    aria-label={playing[i] ? "暂停" : "播放"}
                  >
                    <span className="w-14 h-14 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/50">
                      {playing[i] ? (
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <PlayIcon />
                      )}
                    </span>
                  </button>
                </>
              ) : (
                <img
                  src={optimizeImageUrl(item.url, { 
                    quality: i === 0 ? 85 : undefined, 
                    width: i === 0 ? 1200 : 800 
                  })}
                  alt={`${alt} ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                  style={{
                    opacity: isPreloaded || i !== 0 ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent px-4 py-3">
        <div className="flex gap-1">
          {TABS.map((t, i) => (
            <button
              key={t.key}
              type="button"
              onClick={() => scrollToTab(Math.min(i, items.length - 1))}
              className={`px-3 py-1 text-sm rounded ${i === activeTab ? "bg-white/90 text-zinc-900 font-medium" : "text-white"}`}
            >
              {t.label}
              {t.key === "album" && " >"}
            </button>
          ))}
        </div>
        {isActiveVideo && (
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="text-white p-1"
            aria-label={muted ? "取消静音" : "静音"}
          >
            {muted ? <MuteIcon /> : <UnmuteIcon />}
          </button>
        )}
      </div>
      {items.length > 1 && (
        <div className="absolute top-3 right-4 flex gap-1">
          {items.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i === activeIndex ? "bg-white" : "bg-white/50"}`}
              aria-hidden
            />
          ))}
        </div>
      )}
    </div>
  );
}
