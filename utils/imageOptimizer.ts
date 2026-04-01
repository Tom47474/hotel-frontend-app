/**
 * 图片加载质量检测接口
 */
interface NetworkConnection {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * 根据网络质量获取图片质量参数
 * @returns 图片质量值 (30-85)
 */
export function getImageQuality(): number {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 70; // 默认质量
  }

  const conn = (navigator as { connection?: NetworkConnection }).connection;
  if (!conn) {
    return 70;
  }

  // 检查省数据模式
  if (conn.saveData) {
    return 30;
  }

  // 根据 downlink 映射质量等级
  const downlink = conn.downlink ?? 4; // 默认 4g
  
  if (downlink <= 1.5) return 30;  // slow-2g / 2g
  if (downlink <= 3) return 50;    // 3g
  if (downlink <= 6) return 70;    // 4g
  return 85;                       // 5g
}

/**
 * 获取设备 DPR (Device Pixel Ratio)
 * @returns DPR 值
 */
export function getDPR(): number {
  if (typeof window === 'undefined') {
    return 1;
  }
  return window.devicePixelRatio || 1;
}

/**
 * 计算最佳图片宽度
 * @param baseWidth 基础宽度
 * @returns 考虑 DPR 后的实际请求宽度
 */
export function calculateImageWidth(baseWidth: number = 800): number {
  const dpr = getDPR();
  return Math.min(Math.round(baseWidth * dpr), 2000); // 最大限制 2000px
}

/**
 * 优化腾讯云 COS 图片 URL
 * 添加质量、宽度、格式等参数
 * @param url 原始图片 URL
 * @param options 配置选项
 * @returns 优化后的图片 URL
 */
export function optimizeImageUrl(
  url: string,
  options?: {
    quality?: number;
    width?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }
): string {
  if (!url) return url;

  // 如果不是腾讯云 COS URL，直接返回
  if (!url.includes('myqcloud.com') && !url.includes('tencent-cloud.net')) {
    return url;
  }

  const quality = options?.quality ?? getImageQuality();
  const width = options?.width ?? calculateImageWidth();
  const format = options?.format ?? 'webp';

  // 检查是否已有参数
  const hasParams = url.includes('?');
  const separator = hasParams ? '&' : '?';
  
  // 腾讯云数据万象参数格式
  return `${url}${separator}imageView2/q/${quality}/w/${width}/format/${format}`;
}

/**
 * 为酒店图片批量优化 URL
 * @param images 酒店图片数组
 * @param options 配置选项
 * @returns 优化后的图片数组
 */
export function optimizeHotelImages(
  images: Array<{ url: string }>,
  options?: {
    quality?: number;
    width?: number;
  }
): Array<{ url: string }> {
  if (!images || !Array.isArray(images)) {
    return images || [];
  }

  return images.map((img) => ({
    ...img,
    url: optimizeImageUrl(img.url, options)
  }));
}
