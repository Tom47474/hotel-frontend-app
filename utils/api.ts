/** 后端 API 基础地址。默认用远程；本地起后端时可在 .env.local 设 NEXT_PUBLIC_API_BASE_URL=http://localhost:4090 覆盖 */
const DEFAULT_HOST = "140.143.171.145";
const DEFAULT_PORT = "4090";

export function getApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  // 已是完整 URL（含 http/https）则直接返回
  if (env?.startsWith("http://") || env?.startsWith("https://")) {
    return env.replace(/\/$/, "");
  }
  // 否则视为 host（或 host:port），拼成完整 URL
  if (env) {
    const [host, port] = env.includes(":") ? env.split(":") : [env, process.env.NEXT_PUBLIC_API_BASE_URL_PORT || DEFAULT_PORT];
    return `http://${host}:${port}`;
  }
  return `http://${DEFAULT_HOST}:${DEFAULT_PORT}`;
}
