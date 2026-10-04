/**
 * 站点全局常量。
 */
export const SITE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.SITE_URL) ||
  (typeof process !== "undefined" && (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL)) ||
  "https://adhytm.pages.dev";

export const SITE_NAME = "Adhytm";
