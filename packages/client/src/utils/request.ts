import axios, { AxiosRequestConfig } from "axios";
import { message } from "antd";

// 根据环境变量判断使用哪个 API 地址
export const path = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000'
  : window.location.origin;

interface OptionType extends AxiosRequestConfig {
  alert?: boolean;
}

/**
 * 接口请求 不带缓存
 * @param url 请求地址
 * @param options 请求配置
 */
export default function request(url: string, options: OptionType = {}) {
  const {
    method = 'GET',
    alert = true,
    ...otherOptions
  } = options;

  // 获取token
  const token = localStorage.getItem('token');

  // get 请求将data 转化至params
  if (method.toLocaleUpperCase() === 'GET') {
    if (otherOptions.data && !otherOptions.params) {
      otherOptions.params = otherOptions.data;
    }
  }

  // 添加认证头
  if (token) {
    otherOptions.headers = {
      ...otherOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return axios(`${path}${url}`, {
    withCredentials: true,
    method,
    ...otherOptions,
  }).then(res => {
    const { data } = res;
    
    // 处理认证错误
    if (data.code === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      // 使用window.location.href确保跳转到正确的登录页面
      window.location.href = '/admin/login';
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }

    if (data.code === 403) {
      message.error('权限不足');
      return Promise.reject(new Error('权限不足'));
    }

    const { message: msg, code } = data;
    if (msg && code !== 200) {
      alert && message.error(msg);
      return Promise.reject(msg);
    }

    return data.data || data;
  }).catch(error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      // 使用window.location.href确保跳转到正确的登录页面
      window.location.href = '/admin/login';
    }
    throw error;
  });
}
