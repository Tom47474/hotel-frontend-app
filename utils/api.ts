/** 构建 API 基础地址 */
export function getApiBaseUrl(): string {
  const host = process.env.NEXT_PUBLIC_API_BASE_URL || "localhost";
  const port = process.env.NEXT_PUBLIC_API_BASE_URL_PORT || "4090";
  const protocol = host === "localhost" ? "http" : "https";
  return `${protocol}://${host}:${port}`;
}
