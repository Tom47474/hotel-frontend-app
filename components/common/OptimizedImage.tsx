"use client";

import { useEffect, useState, useRef } from "react";
import { optimizeImageUrl } from "@/utils/imageOptimizer";

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** 图片源 URL */
  src: string;
  /** 基础宽度，用于计算 DPR 后的实际请求宽度 */
  baseWidth?: number;
  /** 图片质量，不传则根据网络质量自动判断 */
  quality?: number;
  /** 是否启用缓存（默认 true） */
  useCache?: boolean;
}

/**
 * 优化的图片组件
 * - 自动根据网络质量和 DPR 优化图片
 * - 支持客户端缓存
 * - 懒加载和异步解码
 * - 加载失败降级处理
 */
export function OptimizedImage({
  src,
  alt = "",
  baseWidth = 800,
  quality,
  useCache = true,
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const cacheKey = useRef<string | null>(null);

  // 初始化图片 URL 和缓存
  useEffect(() => {
    if (!src || typeof window === 'undefined') {
      setCurrentSrc(src);
      return;
    }

    // 生成缓存 key
    const optimizedUrl = optimizeImageUrl(src, { 
      quality, 
      width: baseWidth 
    });
    cacheKey.current = optimizedUrl;

    // 检查缓存
    if (useCache) {
      getCachedImage(optimizedUrl).then(cached => {
        if (cached) {
          setCurrentSrc(cached);
          setIsLoaded(true);
        } else {
          setCurrentSrc(optimizedUrl);
        }
      });
    } else {
      setCurrentSrc(optimizedUrl);
    }
  }, [src, quality, baseWidth, useCache]);

  // 处理图片加载完成
  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    
    // 缓存图片
    if (useCache && cacheKey.current) {
      cacheImage(cacheKey.current, (e.target as HTMLImageElement).src);
    }
    
    onLoad?.(e);
  };

  // 处理图片加载失败
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    console.warn('图片加载失败:', src);
    onError?.(e);
  };

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      loading="eager"
      decoding="async"
      fetchPriority={isLoaded ? undefined : "high"}
      style={{
        opacity: hasError ? 0.5 : 1,
        transition: 'opacity 0.3s ease',
        ...props.style
      }}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  );
}

/**
 * 图片缓存 Map（内存缓存）
 */
const imageCache = new Map<string, string>();

/**
 * 缓存过期时间（24 小时）
 */
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

interface CachedImage {
  url: string;
  timestamp: number;
}

/**
 * 从 Cache Storage 获取缓存的图片
 */
async function getCachedImage(url: string): Promise<string | null> {
  // 先检查内存缓存
  if (imageCache.has(url)) {
    return imageCache.get(url) || null;
  }

  // 检查 Cache Storage
  if ('caches' in window) {
    try {
      const cache = await caches.open('hotel-images');
      const response = await cache.match(url);
      
      if (response) {
        const clonedResponse = response.clone();
        const blob = await clonedResponse.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        // 存入内存缓存
        imageCache.set(url, imageUrl);
        return imageUrl;
      }
    } catch (error) {
      console.warn('Cache Storage 读取失败:', error);
    }
  }

  return null;
}

/**
 * 缓存图片到 Cache Storage
 */
async function cacheImage(url: string, imageUrl: string): Promise<void> {
  // 更新内存缓存
  if (!imageCache.has(url)) {
    imageCache.set(url, imageUrl);
  }

  // 保存到 Cache Storage
  if ('caches' in window) {
    try {
      const cache = await caches.open('hotel-images');
      
      // 如果图片是 Blob URL，需要先转换为 Response
      if (imageUrl.startsWith('blob:')) {
        const response = await fetch(imageUrl);
        const clonedResponse = response.clone();
        await cache.put(url, clonedResponse);
      } else {
        // 如果是普通 URL，直接创建响应
        const headers = new Headers({
          'Content-Type': 'image/webp',
          'X-Image-Cache-Timestamp': Date.now().toString(),
        });
        
        const response = new Response('', { headers });
        await cache.put(url, response);
      }
    } catch (error) {
      console.warn('Cache Storage 写入失败:', error);
    }
  }
}

/**
 * 清理过期缓存
 */
export async function clearExpiredCache(): Promise<void> {
  if (!('caches' in window)) return;

  try {
    const cache = await caches.open('hotel-images');
    const keys = await cache.keys();
    const now = Date.now();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const timestamp = response.headers.get('X-Image-Cache-Timestamp');
        if (timestamp && (now - parseInt(timestamp) > CACHE_EXPIRY)) {
          await cache.delete(request);
        }
      }
    }
  } catch (error) {
    console.warn('清理缓存失败:', error);
  }
}

/**
 * 清空所有图片缓存
 */
export async function clearAllImageCache(): Promise<void> {
  imageCache.clear();
  
  if ('caches' in window) {
    try {
      await caches.delete('hotel-images');
    } catch (error) {
      console.warn('删除缓存失败:', error);
    }
  }
}
