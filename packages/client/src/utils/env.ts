/**
 * 环境配置工具
 */

// 开发环境配置
const DEV_CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  FILE_DOMAIN: 'http://localhost:3000',
};

// 生产环境配置
const PROD_CONFIG = {
  API_BASE_URL: window.location.origin,
  FILE_DOMAIN: window.location.origin,
};

// 获取当前环境
const isDev = process.env.NODE_ENV === 'development' || 
             window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1';

// 当前环境配置
const CONFIG = isDev ? DEV_CONFIG : PROD_CONFIG;

export const ENV_CONFIG = {
  isDev,
  ...CONFIG,
};

/**
 * 获取文件域名
 */
export const getFileDomain = (): string => {
  return ENV_CONFIG.FILE_DOMAIN;
};

/**
 * 获取API基础URL
 */
export const getApiBaseUrl = (): string => {
  return ENV_CONFIG.API_BASE_URL;
};