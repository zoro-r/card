import axios from 'axios';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';
import { WechatUser, IWechatUser } from '@/models/wechatUser';

/**
 * 微信账号配置接口
 */
interface WechatAccountConfig {
  appId: string;
  appSecret: string;
  mchId?: string;
  mchKey?: string;
  enablePayment: boolean;
  enableRefund: boolean;
  enableMessage: boolean;
}

/**
 * 微信API响应接口
 */
interface WechatApiResponse {
  openid: string;
  session_key: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

/**
 * 解密用户信息接口
 */
interface DecryptedUserInfo {
  openId: string;
  nickName: string;
  gender: number;
  city: string;
  province: string;
  country: string;
  avatarUrl: string;
  unionId?: string;
  watermark: {
    timestamp: number;
    appid: string;
  };
}

/**
 * 解密手机号信息接口
 */
interface DecryptedPhoneInfo {
  phoneNumber: string;
  purePhoneNumber: string;
  countryCode: string;
  watermark: {
    timestamp: number;
    appid: string;
  };
}

/**
 * 微信服务类
 */
export class WechatService {
  private config: WechatAccountConfig;
  private jwtSecret: string;

  constructor(config: WechatAccountConfig) {
    this.config = config;
    this.jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';
  }

  /**
   * 微信小程序登录
   * @param code 微信登录凭证
   * @returns 登录结果
   */
  async login(code: string): Promise<{
    token: string;
    user: IWechatUser;
    isNewUser: boolean;
  }> {
    try {
      // 1. 调用微信API获取session_key和openid
      const wxResponse = await this.getSessionKey(code);
      
      if (wxResponse.errcode) {
        throw new Error(`微信登录失败: ${wxResponse.errmsg}`);
      }

      // 2. 查找或创建用户（使用appId区分）
      let user = await WechatUser.findByOpenid(wxResponse.openid, this.config.appId);
      let isNewUser = false;

      if (!user) {
        // 创建新用户
        user = new WechatUser({
          openid: wxResponse.openid,
          unionid: wxResponse.unionid,
          sessionKey: this.encryptSessionKey(wxResponse.session_key),
          appId: this.config.appId, // 只使用appId
          registerTime: new Date(),
          lastLoginTime: new Date(),
          loginCount: 1
        });
        await user.save();
        isNewUser = true;
      } else {
        // 更新现有用户
        user.sessionKey = this.encryptSessionKey(wxResponse.session_key);
        if (wxResponse.unionid) {
          user.unionid = wxResponse.unionid;
        }
        await user.updateLoginInfo();
      }

      // 3. 生成JWT token
      const token = this.generateToken(user);

      return {
        token,
        user,
        isNewUser
      };
    } catch (error) {
      console.error('微信登录错误:', error);
      throw error;
    }
  }

  /**
   * 解密用户信息
   * @param encryptedData 加密数据
   * @param iv 初始向量
   * @param sessionKey 会话密钥
   * @returns 解密后的用户信息
   */
  decryptUserInfo(encryptedData: string, iv: string, sessionKey: string): DecryptedUserInfo {
    try {
      const decryptedSessionKey = this.decryptSessionKey(sessionKey);
      const key = CryptoJS.enc.Base64.parse(decryptedSessionKey);
      const ivParsed = CryptoJS.enc.Base64.parse(iv);
      const encrypted = CryptoJS.enc.Base64.parse(encryptedData);
      
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted } as any,
        key,
        {
          iv: ivParsed,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      const decryptedStr = CryptoJS.enc.Utf8.stringify(decrypted);
      const userInfo = JSON.parse(decryptedStr);
      
      // 验证水印
      if (userInfo.watermark.appid !== this.config.appId) {
        throw new Error('数据水印验证失败');
      }
      
      return userInfo;
    } catch (error) {
      console.error('解密用户信息失败:', error);
      throw new Error('解密用户信息失败');
    }
  }

  /**
   * 解密手机号
   * @param encryptedData 加密数据
   * @param iv 初始向量
   * @param sessionKey 会话密钥
   * @returns 解密后的手机号信息
   */
  decryptPhoneNumber(encryptedData: string, iv: string, sessionKey: string): DecryptedPhoneInfo {
    try {
      const decryptedSessionKey = this.decryptSessionKey(sessionKey);
      const key = CryptoJS.enc.Base64.parse(decryptedSessionKey);
      const ivParsed = CryptoJS.enc.Base64.parse(iv);
      const encrypted = CryptoJS.enc.Base64.parse(encryptedData);
      
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: encrypted } as any,
        key,
        {
          iv: ivParsed,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      const decryptedStr = CryptoJS.enc.Utf8.stringify(decrypted);
      const phoneInfo = JSON.parse(decryptedStr);
      
      // 验证水印
      if (phoneInfo.watermark.appid !== this.config.appId) {
        throw new Error('数据水印验证失败');
      }
      
      return phoneInfo;
    } catch (error) {
      console.error('解密手机号失败:', error);
      throw new Error('解密手机号失败');
    }
  }

  /**
   * 更新用户信息
   * @param openid 用户openid
   * @param appId 微信账号AppID
   * @param userInfo 用户信息
   * @returns 更新后的用户
   */
  async updateUserInfo(
    openid: string, 
    userInfo: Partial<IWechatUser>
  ): Promise<IWechatUser> {
    const user = await WechatUser.findByOpenid(openid, this.config.appId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 更新用户信息
    Object.assign(user, userInfo);
    await user.save();

    return user;
  }

  /**
   * 获取微信session_key
   * @param code 微信登录凭证
   * @returns 微信API响应
   */
  private async getSessionKey(code: string): Promise<WechatApiResponse> {
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const params = {
      appid: this.config.appId,
      secret: this.config.appSecret,
      js_code: code,
      grant_type: 'authorization_code'
    };

    const response = await axios.get(url, { params });
    return response.data;
  }

  /**
   * 加密session_key
   * @param sessionKey 原始session_key
   * @returns 加密后的session_key
   */
  private encryptSessionKey(sessionKey: string): string {
    const key = process.env.ENCRYPT_KEY || 'your-encrypt-key-32-characters';
    return CryptoJS.AES.encrypt(sessionKey, key).toString();
  }

  /**
   * 解密session_key
   * @param encryptedSessionKey 加密的session_key
   * @returns 解密后的session_key
   */
  private decryptSessionKey(encryptedSessionKey: string): string {
    const key = process.env.ENCRYPT_KEY || 'your-encrypt-key-32-characters';
    const bytes = CryptoJS.AES.decrypt(encryptedSessionKey, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * 生成JWT token
   * @param user 用户信息
   * @returns JWT token
   */
  private generateToken(user: IWechatUser): string {
    const payload = {
      type: 'wechat',
      openid: user.openid,
      appId: user.appId, // 只使用appId
      userId: user._id
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    } as jwt.SignOptions);
  }

  /**
   * 验证JWT token
   * @param token JWT token
   * @returns 解码后的payload
   */
  static verifyToken(token: string): any {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取微信配置（已废弃，使用WechatAccountService代替）
   * @param platformId 平台ID
   * @returns 微信配置
   */
  static async getWechatConfig(platformId: string): Promise<WechatAccountConfig> {
    throw new Error('该方法已废弃，请使用WechatAccountService获取配置');
  }
}