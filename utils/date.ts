/** 格式化日期 yyyy-MM-dd */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 计算两个日期之间的间夜数 */
export function getNights(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000)));
}
