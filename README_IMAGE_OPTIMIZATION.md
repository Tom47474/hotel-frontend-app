# 酒店详情页图片 LCP 优化指南

## 📋 概述

已成功为酒店详情页的 banner 图片实施 LCP（Largest Contentful Paint）优化，目标将 LCP 时间从 6s+ 降至 2s 以内。

## ✅ 已完成的优化

### 1. **图片优化工具** (`utils/imageOptimizer.ts`)

提供以下核心功能：
- `getImageQuality()`: 根据网络质量动态调整图片质量
  - slow-2g/2g: 30
  - 3g: 50
  - 4g: 70
  - 5g: 85
- `getDPR()`: 获取设备像素比
- `calculateImageWidth()`: 计算最佳图片宽度
- `optimizeImageUrl()`: 优化腾讯云 COS 图片 URL
- `optimizeHotelImages()`: 批量优化酒店图片

### 2. **优化的图片组件** (`components/common/OptimizedImage.tsx`)

封装的统一 Image 组件，自动应用：
- ✅ 网络质量检测
- ✅ 客户端双重缓存（内存 + Cache Storage）
- ✅ `loading="eager"` 立即加载
- ✅ `decoding="async"` 异步解码
- ✅ `fetchPriority="high"` 高优先级
- ✅ 加载失败降级处理

### 3. **HotelImageBanner 组件优化** (`components/hotel/HotelImageBanner.tsx`)

关键改进：
- ✅ **预加载前 3 张图片**：使用 `<link rel="preload">` 
- ✅ **首图优化**：
  - `fetchpriority="high"`
  - `loading="eager"`
  - 质量 85，宽度 1200px
- ✅ **后续图片懒加载**：`loading="lazy"`
- ✅ **客户端缓存**：Cache API + Map 双重缓存
- ✅ **渐进式显示**：加载完成后淡入效果

### 4. **Next.js 配置** (`next.config.ts`)

配置远程域名白名单：
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.myqcloud.com',
    },
    {
      protocol: 'https',
      hostname: '**.tencent-cloud.net',
    },
  ],
}
```

## 🚀 使用方法

### 在酒店详情页中使用（已完成）

酒店详情页已自动应用所有优化，无需额外配置：

```tsx
// app/hotels/[id]/page.tsx
<HotelImageBanner
  images={data.images ?? []}
  alt={data.name}
/>
```

### 在其他页面使用 OptimizedImage 组件

```tsx
import { OptimizedImage } from '@/components/common/OptimizedImage';

<OptimizedImage
  src="https://example.myqcloud.com/hotel.jpg"
  alt="酒店图片"
  baseWidth={800}
  quality={70}
  useCache={true}
  className="w-full h-full object-cover"
/>
```

## 📊 性能提升

预期效果：
- ⚡ **首次访问**: LCP 降低 40-60%
- ⚡ **重复访问**: 加载速度提升 75%+（缓存命中）
- ⚡ **网络自适应**: 慢速网络下图片质量自动降级
- ⚡ **设备适配**: 高分辨率屏幕自动请求大图

## 🔧 缓存管理

### 清理过期缓存
```tsx
import { clearExpiredCache, clearAllImageCache } from '@/components/common/OptimizedImage';

// 清理超过 24 小时的缓存
await clearExpiredCache();

// 清空所有缓存
await clearAllImageCache();
```

### 缓存策略
- **内存缓存**: Map 对象，页面生命周期内有效
- **持久化缓存**: Cache Storage，24 小时过期
- **自动清理**: 定期删除过期缓存

## 🎯 优化要点总结

1. **优先级控制**
   - 首图使用 `fetchpriority="high"`
   - 使用 `<link rel="preload">` 预加载关键资源

2. **加载行为**
   - 首图 `loading="eager"` 立即加载
   - 其他图片 `loading="lazy"` 懒加载
   - 所有图片 `decoding="async"` 异步解码

3. **图片优化**
   - 腾讯云数据万象参数：`?imageView2/q/{quality}/w/{width}/format/webp`
   - 根据网络质量动态调整质量（30-85）
   - 根据 DPR 动态调整宽度

4. **缓存机制**
   - 双重缓存：内存 + Cache Storage
   - 24 小时过期机制
   - 自动清理旧缓存

## 📝 注意事项

1. **重启开发服务器**：修改 `next.config.ts` 后需要重启
2. **TypeScript 类型**：Network Information API 使用类型断言，避免依赖全局 Connection 接口
3. **CDN 配置**：确保腾讯云 COS 已开启数据万象功能
4. **浏览器兼容性**：Cache API 在现代浏览器中可用，低版本浏览器会自动降级

## 🐛 调试建议

查看控制台日志：
- 图片加载失败会输出 warning
- 缓存操作失败会输出错误信息

检查缓存状态：
```javascript
// 在浏览器控制台执行
caches.keys().then(keys => console.log('缓存:', keys));
caches.open('hotel-images').then(cache => cache.keys().then(reqs => console.log('图片数量:', reqs.length)));
```

## 📈 监控建议

使用 Chrome DevTools Performance 面板：
1. 清除缓存并硬性重新加载
2. 录制性能分析
3. 查看 LCP 指标和瀑布流
4. 对比优化前后的数据

---

**实施日期**: 2026-04-01  
**优化目标**: LCP < 2s  
**当前状态**: ✅ 已完成
