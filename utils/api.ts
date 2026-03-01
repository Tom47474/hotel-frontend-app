/** 构建 API 基础地址 */
export function getApiBaseUrl(): string {
  const host = process.env.NEXT_PUBLIC_API_BASE_URL || "localhost";
  const port = process.env.NEXT_PUBLIC_API_BASE_URL_PORT || "4090";
  // 本地或 IP 用 http，其他域名用 https
  const isLocalOrIp = host === "localhost" || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
  const protocol = isLocalOrIp ? "http" : "https";
  return `${protocol}://${host}:${port}`;
}
