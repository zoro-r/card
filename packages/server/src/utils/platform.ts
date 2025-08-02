/**
 * 平台相关工具函数
 */

/**
 * 获取默认的平台ID
 * @returns 默认平台ID
 */
export function getDefaultPlatformId(): string {
  return process.env.DEFAULT_PLATFORM_ID || 'root';
}

/**
 * 验证平台ID是否有效
 * @param platformId 平台ID
 * @returns 是否有效
 */
export function isValidPlatformId(platformId: string): boolean {
  return typeof platformId === 'string' && platformId.length > 0;
}