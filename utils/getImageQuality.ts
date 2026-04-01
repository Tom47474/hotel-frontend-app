'use client';

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'; // 只有这4个
}

function getImageQuality(): number {
  const nav = navigator as typeof navigator & {
    connection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
    mozConnection?: NetworkInformation;
  };

  const conn = nav.connection || nav.webkitConnection || nav.mozConnection;

  if (!conn) return 70;
  if (conn.saveData) return 40;

  // 正确的 map
  const qualityMap = {
    'slow-2g': 30,
    '2g': 30,
    '3g': 50,
    '4g': 85,  // Wi‑Fi / 5G / 千兆网络 都走这里
  };

  const type = conn.effectiveType;
  return type ? qualityMap[type] || 70 : 70;
}

export function getQualityParams(): string {
  const q = getImageQuality();
  return `?imageView2/q/${q}/format/webp`;
}

export default getImageQuality;