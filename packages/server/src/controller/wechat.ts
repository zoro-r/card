import { Context } from 'koa';
import { success, fail } from '@/utils/tool';
import { WechatService } from '@/service/wechat';
import { WechatPaymentService } from '@/service/wechatPayment';
import { WechatUser } from '@/models/wechatUser';
import { WechatPayment } from '@/models/wechatPayment';
import { WechatAccountService } from '@/service/wechatAccount';
import { WechatAccountType } from '@/models/wechatAccount';

/**
 * 微信控制器
 */
export class WechatController {
  /**
   * 微信小程序登录
   */
  static async login(ctx: Context) {
    try {
      const { code, appId } = ctx.request.body as {
        code: string;
        appId: string; // 直接传入appId
      };

      if (!code || !appId) {
        ctx.body = fail('缺少必要参数');
        return;
      }

      // 获取微信账号配置
      const wechatAccountService = new WechatAccountService();
      const config = await wechatAccountService.getAccountConfigByAppId(appId);
      if (!config) {
        ctx.body = fail('微信账号配置无效');
        return;
      }

      // 执行登录
      const wechatService = new WechatService(config);
      const result = await wechatService.login(code);

      ctx.body = success(result, result.isNewUser ? '注册成功' : '登录成功');
    } catch (error) {
      console.error('微信登录失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '登录失败');
    }
  }

  /**
   * 解密用户信息
   */
  static async decryptUserInfo(ctx: Context) {
    try {
      const { encryptedData, iv } = ctx.request.body as {
        encryptedData: string;
        iv: string;
      };

      // 从token中获取用户信息
      const tokenData = ctx.state.user;
      if (!tokenData || tokenData.type !== 'wechat') {
        ctx.body = fail('用户认证失败');
        return;
      }

      // 查找用户
      const user = await WechatUser.findByOpenid(tokenData.openid, tokenData.appId);
      if (!user) {
        ctx.body = fail('用户不存在');
        return;
      }

      // 获取微信账号配置
      const wechatAccountService = new WechatAccountService();
      const config = await wechatAccountService.getAccountConfigByAppId(tokenData.appId);
      if (!config) {
        ctx.body = fail('微信账号配置无效');
        return;
      }

      // 解密用户信息
      const wechatService = new WechatService(config);
      const userInfo = wechatService.decryptUserInfo(encryptedData, iv, user.sessionKey);

      // 更新用户信息
      await wechatService.updateUserInfo(user.openid, {
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
        city: userInfo.city,
        province: userInfo.province,
        country: userInfo.country
      });

      ctx.body = success(userInfo, '解密成功');
    } catch (error) {
      console.error('解密用户信息失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '解密失败');
    }
  }

  /**
   * 解密手机号
   */
  static async decryptPhoneNumber(ctx: Context) {
    try {
      const { encryptedData, iv } = ctx.request.body as {
        encryptedData: string;
        iv: string;
      };

      // 从token中获取用户信息
      const tokenData = ctx.state.user;
      if (!tokenData || tokenData.type !== 'wechat') {
        ctx.body = fail('用户认证失败');
        return;
      }

      // 查找用户
      const user = await WechatUser.findByOpenid(tokenData.openid, tokenData.appId);
      if (!user) {
        ctx.body = fail('用户不存在');
        return;
      }

      // 获取微信账号配置
      const wechatAccountService = new WechatAccountService();
      const config = await wechatAccountService.getAccountConfigByAppId(tokenData.appId);
      if (!config) {
        ctx.body = fail('微信账号配置无效');
        return;
      }

      // 解密手机号
      const wechatService = new WechatService(config);
      const phoneInfo = wechatService.decryptPhoneNumber(encryptedData, iv, user.sessionKey);

      // 更新用户手机号
      await wechatService.updateUserInfo(user.openid, {
        phone: phoneInfo.phoneNumber,
        phoneCountryCode: phoneInfo.countryCode
      });

      ctx.body = success({
        phoneNumber: phoneInfo.phoneNumber,
        countryCode: phoneInfo.countryCode
      }, '获取手机号成功');
    } catch (error) {
      console.error('解密手机号失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '获取手机号失败');
    }
  }

  /**
   * 获取用户信息
   */
  static async getUserInfo(ctx: Context) {
    try {
      // 从token中获取用户信息
      const tokenData = ctx.state.user;
      if (!tokenData || tokenData.type !== 'wechat') {
        ctx.body = fail('用户认证失败');
        return;
      }

      // 查找用户
      const user = await WechatUser.findByOpenid(tokenData.openid, tokenData.appId);
      if (!user) {
        ctx.body = fail('用户不存在');
        return;
      }

      ctx.body = success(user, '获取用户信息成功');
    } catch (error) {
      console.error('获取用户信息失败:', error);
      ctx.body = fail('获取用户信息失败');
    }
  }

  /**
   * 处理微信支付回调
   */
  static async paymentNotify(ctx: Context) {
    try {
      const { platformId } = ctx.params;
      const xmlData = ctx.request.body as string;

      // 获取支付服务
      const paymentService = await WechatPaymentService.create(platformId);
      
      // 处理支付回调
      const result = await paymentService.handlePaymentNotify(xmlData);

      // 设置响应内容类型
      ctx.type = 'application/xml';

      if (result.success) {
        // 如果支付成功，执行后续业务逻辑
        if (result.payment) {
          // TODO: 处理支付成功的业务逻辑
          // 例如：更新订单状态、发送通知等
        }
        
        ctx.body = WechatPaymentService.generateSuccessResponse();
      } else {
        ctx.body = WechatPaymentService.generateFailResponse(result.message);
      }
    } catch (error) {
      console.error('处理微信支付回调失败:', error);
      ctx.type = 'application/xml';
      ctx.body = WechatPaymentService.generateFailResponse('处理失败');
    }
  }

  /**
   * 查询支付状态
   */
  static async queryPayment(ctx: Context) {
    try {
      const { platformId, outTradeNo } = ctx.params;

      // 获取支付服务
      const paymentService = await WechatPaymentService.create(platformId);
      
      // 查询支付状态
      const result = await paymentService.queryPaymentStatus(outTradeNo);

      if (result.success) {
        ctx.body = success({
          status: result.status,
          details: result.data
        }, '查询成功');
      } else {
        ctx.body = fail('查询失败');
      }
    } catch (error) {
      console.error('查询支付状态失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '查询支付状态失败');
    }
  }

  /**
   * 申请退款
   */
  static async refund(ctx: Context) {
    try {
      const { platformId } = ctx.params;
      const { outTradeNo, refundFee, reason } = ctx.request.body as {
        outTradeNo: string;
        refundFee: number;
        reason?: string;
      };

      if (!outTradeNo || !refundFee) {
        ctx.body = fail('缺少必要参数');
        return;
      }

      // 获取支付服务
      const paymentService = await WechatPaymentService.create(platformId);
      
      // 申请退款
      const result = await paymentService.refund(outTradeNo, refundFee, reason);

      if (result.success) {
        ctx.body = success(result.refundId ? { refundId: result.refundId } : null, result.message);
      } else {
        ctx.body = fail(result.message);
      }
    } catch (error) {
      console.error('申请退款失败:', error);
      ctx.body = fail(error instanceof Error ? error.message : '申请退款失败');
    }
  }

  /**
   * 获取用户列表（管理后台）
   */
  static async getUserList(ctx: Context) {
    try {
      const { accountId } = ctx.params; // 直接使用accountId
      const { page = 1, limit = 20, keyword } = ctx.query as {
        page?: string;
        limit?: string;
        keyword?: string;
      };

      const pageNum = parseInt((page || '1') as string);
      const limitNum = parseInt((limit || '20') as string);

      // 获取对应的appId
      const wechatAccountService = new WechatAccountService();
      const account = await wechatAccountService.getWechatAccountDetail(accountId);
      if (!account) {
        ctx.body = success({
          users: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 0
          }
        }, '获取用户列表成功');
        return;
      }

      // 构建查询条件
      const query: any = { appId: account.appId };
      
      if (keyword) {
        query.$or = [
          { nickName: { $regex: keyword, $options: 'i' } },
          { phone: { $regex: keyword, $options: 'i' } }
        ];
      }

      // 查询用户列表
      const users = await WechatUser.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      // 查询总数
      const total = await WechatUser.countDocuments(query);

      ctx.body = success({
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }, '获取用户列表成功');
    } catch (error) {
      console.error('获取用户列表失败:', error);
      ctx.body = fail('获取用户列表失败');
    }
  }

  /**
   * 更新用户状态（管理后台）
   */
  static async updateUserStatus(ctx: Context) {
    try {
      const { platformId, userId } = ctx.params;
      const { isActive, isBlocked, remark } = ctx.request.body as {
        isActive?: boolean;
        isBlocked?: boolean;
        remark?: string;
      };

      // 查找用户
      const user = await WechatUser.findOne({ _id: userId, platformId });
      if (!user) {
        ctx.body = fail('用户不存在');
        return;
      }

      // 更新用户状态
      if (isActive !== undefined) user.isActive = isActive;
      if (isBlocked !== undefined) user.isBlocked = isBlocked;
      if (remark !== undefined) user.remark = remark;

      await user.save();

      ctx.body = success(user, '更新用户状态成功');
    } catch (error) {
      console.error('更新用户状态失败:', error);
      ctx.body = fail('更新用户状态失败');
    }
  }

  /**
   * 获取支付记录列表（管理后台）
   */
  static async getPaymentList(ctx: Context) {
    try {
      const { accountId } = ctx.params; // 直接使用accountId
      const { 
        page = 1, 
        limit = 20, 
        keyword,
        status,
        startDate,
        endDate
      } = ctx.query as {
        page?: string;
        limit?: string;
        keyword?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
      };

      const pageNum = parseInt((page || '1') as string);
      const limitNum = parseInt((limit || '20') as string);

      // 获取对应的appId
      const wechatAccountService = new WechatAccountService();
      const account = await wechatAccountService.getWechatAccountDetail(accountId);
      if (!account) {
        ctx.body = success({
          payments: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            pages: 0
          }
        }, '获取支付记录列表成功');
        return;
      }

      // 构建查询条件
      const query: any = { appId: account.appId };
      
      if (status) {
        query.status = status;
      }
      
      if (keyword) {
        query.$or = [
          { outTradeNo: { $regex: keyword, $options: 'i' } },
          { orderNo: { $regex: keyword, $options: 'i' } }, // 添加对订单号的支持
          { body: { $regex: keyword, $options: 'i' } }
        ];
      }
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      // 查询支付记录列表
      const payments = await WechatPayment.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      // 查询总数
      const total = await WechatPayment.countDocuments(query);

      ctx.body = success({
        payments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }, '获取支付记录列表成功');
    } catch (error) {
      console.error('获取支付记录列表失败:', error);
      ctx.body = fail('获取支付记录列表失败');
    }
  }

  /**
   * 获取支付详情（管理后台）
   */
  static async getPaymentDetail(ctx: Context) {
    try {
      const { platformId, paymentId } = ctx.params;

      // 查找支付记录
      const payment = await WechatPayment.findOne({ _id: paymentId, platformId });
      
      if (!payment) {
        ctx.body = fail('支付记录不存在');
        return;
      }

      ctx.body = success(payment, '获取支付详情成功');
    } catch (error) {
      console.error('获取支付详情失败:', error);
      ctx.body = fail('获取支付详情失败');
    }
  }
}