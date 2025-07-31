import { WechatAccount, IWechatAccount, WechatAccountType, WechatAccountStatus } from '@/models/wechatAccount';
import { WechatUser } from '@/models/wechatUser';
import { WechatPayment } from '@/models/wechatPayment';
import crypto from 'crypto';

/**
 * 创建微信账号参数
 */
export interface CreateWechatAccountParams {
  name: string;
  displayName: string;
  description?: string;
  avatar?: string;
  type: WechatAccountType;
  status?: WechatAccountStatus;
  platformId: string;
  appId: string;
  appSecret: string;
  originalId?: string;
  mchId?: string;
  mchKey?: string;
  payNotifyUrl?: string;
  refundNotifyUrl?: string;
  enablePayment?: boolean;
  enableRefund?: boolean;
  enableMessage?: boolean;
  dailyApiLimit?: number;
  monthlyTransactionLimit?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  validFrom?: Date;
  validTo?: Date;
  remark?: string;
  tags?: string[];
}

/**
 * 更新微信账号参数
 */
export interface UpdateWechatAccountParams {
  name?: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  status?: WechatAccountStatus;
  appSecret?: string;
  originalId?: string;
  mchId?: string;
  mchKey?: string;
  payNotifyUrl?: string;
  refundNotifyUrl?: string;
  enablePayment?: boolean;
  enableRefund?: boolean;
  enableMessage?: boolean;
  dailyApiLimit?: number;
  monthlyTransactionLimit?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  validFrom?: Date;
  validTo?: Date;
  remark?: string;
  tags?: string[];
}

/**
 * 微信账号统计信息
 */
export interface WechatAccountStats {
  totalAccounts: number;
  activeAccounts: number;
  suspendedAccounts: number;
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  accountsByType: {
    [key: string]: number;
  };
  recentActiveAccounts: IWechatAccount[];
}

/**
 * 微信账号服务类
 */
export class WechatAccountService {
  /**
   * 加密敏感数据
   */
  private encryptSensitiveData(data: string): string {
    const algorithm = 'aes-256-cbc';
    // 确保密钥长度为32字节（256位）
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars!';
    const keyBuffer = Buffer.from(key.padEnd(32, '0').substring(0, 32), 'utf8');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }
  
  /**
   * 解密敏感数据
   */
  private decryptSensitiveData(encryptedData: string): string {
    const algorithm = 'aes-256-cbc';
    // 确保密钥长度为32字节（256位）
    const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-32-chars!';
    const keyBuffer = Buffer.from(key.padEnd(32, '0').substring(0, 32), 'utf8');
    
    const textParts = encryptedData.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = textParts.join(':');
    
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * 将中文字符转换为拼音首字母
   */
  private chineseToPinyin(text: string): string {
    // 简单的中文到拼音首字母映射，可以扩展
    const pinyinMap: { [key: string]: string } = {
      '超': 'chao',
      '本': 'ben', 
      '学': 'xue',
      '院': 'yuan',
      '微': 'wei',
      '信': 'xin',
      '公': 'gong',
      '众': 'zhong',
      '号': 'hao',
      '小': 'xiao',
      '程': 'cheng',
      '序': 'xu',
      '企': 'qi',
      '业': 'ye',
      '开': 'kai',
      '放': 'fang',
      '平': 'ping',
      '台': 'tai'
    };
    
    return text.split('').map(char => {
      return pinyinMap[char] || '';
    }).join('');
  }

  /**
   * 生成账号ID
   */
  private generateAccountId(name: string, type: WechatAccountType): string {
    const typePrefix = {
      [WechatAccountType.MINIPROGRAM]: 'mp',
      [WechatAccountType.OFFICIAL_ACCOUNT]: 'oa',
      [WechatAccountType.ENTERPRISE]: 'ent',
      [WechatAccountType.OPEN_PLATFORM]: 'open'
    };
    
    // 先尝试将中文转换为拼音
    const pinyinName = this.chineseToPinyin(name);
    
    // 清理名称：优先使用拼音，否则保留英文数字
    const cleaned = (pinyinName || name).toLowerCase()
      .replace(/[^a-z0-9]/g, '') // 只保留英文字母和数字
      .substring(0, 8); // 限制长度
    
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 4);
    
    // 如果清理后的名称为空，使用默认名称
    const safeName = cleaned || 'account';
    
    return `${typePrefix[type]}_${safeName}_${timestamp}_${random}`;
  }
  
  /**
   * 创建微信账号
   */
  async createWechatAccount(params: CreateWechatAccountParams): Promise<IWechatAccount> {
    try {
      // 1. 检查AppId是否已存在
      const existingAccount = await WechatAccount.findByAppId(params.appId);
      if (existingAccount) {
        throw new Error('该AppId已被使用');
      }
      
      // 2. 生成账号ID
      const accountId = this.generateAccountId(params.name, params.type);
      
      // 3. 加密敏感数据
      const encryptedAppSecret = this.encryptSensitiveData(params.appSecret);
      const encryptedMchKey = params.mchKey ? this.encryptSensitiveData(params.mchKey) : undefined;
      
      // 4. 创建账号记录
      const account = new WechatAccount({
        accountId,
        name: params.name,
        displayName: params.displayName,
        description: params.description,
        avatar: params.avatar,
        type: params.type,
        status: params.status || WechatAccountStatus.ACTIVE, // 默认设置为 ACTIVE
        platformId: params.platformId,
        appId: params.appId,
        appSecret: encryptedAppSecret,
        originalId: params.originalId,
        mchId: params.mchId,
        mchKey: encryptedMchKey,
        payNotifyUrl: params.payNotifyUrl,
        refundNotifyUrl: params.refundNotifyUrl,
        enablePayment: params.enablePayment ?? false,
        enableRefund: params.enableRefund ?? false,
        enableMessage: params.enableMessage ?? false,
        dailyApiLimit: params.dailyApiLimit ?? 100000,
        monthlyTransactionLimit: params.monthlyTransactionLimit ?? 10000000,
        contactName: params.contactName,
        contactPhone: params.contactPhone,
        contactEmail: params.contactEmail,
        validFrom: params.validFrom,
        validTo: params.validTo,
        remark: params.remark,
        tags: params.tags || [],
        stats: {
          totalUsers: 0,
          totalTransactions: 0,
          totalRevenue: 0,
          apiCallsToday: 0
        }
      });
      
      await account.save();
      return account;
    } catch (error) {
      console.error('创建微信账号失败:', error);
      throw error;
    }
  }
  
  /**
   * 更新微信账号
   */
  async updateWechatAccount(accountId: string, params: UpdateWechatAccountParams): Promise<IWechatAccount> {
    try {
      const account = await WechatAccount.findByAccountId(accountId);
      if (!account) {
        throw new Error('微信账号不存在');
      }
      
      // 更新基本信息
      if (params.name) account.name = params.name;
      if (params.displayName) account.displayName = params.displayName;
      if (params.description !== undefined) account.description = params.description;
      if (params.avatar !== undefined) account.avatar = params.avatar;
      if (params.status !== undefined) account.status = params.status;
      if (params.originalId !== undefined) account.originalId = params.originalId;
      if (params.payNotifyUrl !== undefined) account.payNotifyUrl = params.payNotifyUrl;
      if (params.refundNotifyUrl !== undefined) account.refundNotifyUrl = params.refundNotifyUrl;
      if (params.enablePayment !== undefined) account.enablePayment = params.enablePayment;
      if (params.enableRefund !== undefined) account.enableRefund = params.enableRefund;
      if (params.enableMessage !== undefined) account.enableMessage = params.enableMessage;
      if (params.dailyApiLimit !== undefined) account.dailyApiLimit = params.dailyApiLimit;
      if (params.monthlyTransactionLimit !== undefined) account.monthlyTransactionLimit = params.monthlyTransactionLimit;
      if (params.contactName !== undefined) account.contactName = params.contactName;
      if (params.contactPhone !== undefined) account.contactPhone = params.contactPhone;
      if (params.contactEmail !== undefined) account.contactEmail = params.contactEmail;
      if (params.validFrom !== undefined) account.validFrom = params.validFrom;
      if (params.validTo !== undefined) account.validTo = params.validTo;
      if (params.remark !== undefined) account.remark = params.remark;
      if (params.tags !== undefined) account.tags = params.tags;
      
      // 更新敏感数据
      if (params.appSecret) {
        account.appSecret = this.encryptSensitiveData(params.appSecret);
      }
      if (params.mchId !== undefined) account.mchId = params.mchId;
      if (params.mchKey) {
        account.mchKey = this.encryptSensitiveData(params.mchKey);
      }
      
      await account.save();
      return account;
    } catch (error) {
      console.error('更新微信账号失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取微信账号详情
   */
  async getWechatAccountDetail(accountId: string): Promise<IWechatAccount | null> {
    try {
      const account = await WechatAccount.findByAccountId(accountId);
      if (account) {
        // 更新统计信息
        await account.updateStats();
      }
      return account;
    } catch (error) {
      console.error('获取微信账号详情失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取微信账号列表
   */
  async getWechatAccountList(
    keyword?: string,
    status?: WechatAccountStatus,
    type?: WechatAccountType,
    platformId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    accounts: IWechatAccount[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      // 构建查询条件
      const query: any = {};
      
      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: 'i' } },
          { displayName: { $regex: keyword, $options: 'i' } },
          { accountId: { $regex: keyword, $options: 'i' } },
          { appId: { $regex: keyword, $options: 'i' } }
        ];
      }
      
      if (status) {
        query.status = status;
      }
      
      if (type) {
        query.type = type;
      }
      
      if (platformId) {
        query.platformId = platformId;
      }
      
      // 查询账号列表
      const accounts = await WechatAccount.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      // 查询总数
      const total = await WechatAccount.countDocuments(query);
      
      return {
        accounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('获取微信账号列表失败:', error);
      throw error;
    }
  }
  
  /**
   * 激活微信账号
   */
  async activateWechatAccount(accountId: string): Promise<IWechatAccount> {
    try {
      const account = await WechatAccount.findByAccountId(accountId);
      if (!account) {
        throw new Error('微信账号不存在');
      }
      
      await account.activate();
      return account;
    } catch (error) {
      console.error('激活微信账号失败:', error);
      throw error;
    }
  }
  
  /**
   * 暂停微信账号
   */
  async suspendWechatAccount(accountId: string, reason?: string): Promise<IWechatAccount> {
    try {
      const account = await WechatAccount.findByAccountId(accountId);
      if (!account) {
        throw new Error('微信账号不存在');
      }
      
      await account.suspend(reason);
      return account;
    } catch (error) {
      console.error('暂停微信账号失败:', error);
      throw error;
    }
  }
  
  /**
   * 删除微信账号
   */
  async deleteWechatAccount(accountId: string): Promise<void> {
    try {
      const account = await WechatAccount.findByAccountId(accountId);
      if (!account) {
        throw new Error('微信账号不存在');
      }
      
      // 检查是否有关联数据
      const [userCount, paymentCount] = await Promise.all([
        WechatUser.countDocuments({ platformId: account.platformId }),
        WechatPayment.countDocuments({ platformId: account.platformId })
      ]);
      
      if (userCount > 0 || paymentCount > 0) {
        throw new Error('该微信账号存在关联数据，无法删除');
      }
      
      // 删除账号
      await WechatAccount.deleteOne({ accountId });
    } catch (error) {
      console.error('删除微信账号失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取微信账号统计信息
   */
  async getWechatAccountStats(platformId?: string): Promise<WechatAccountStats> {
    try {
      // 构建查询条件
      const query: any = {};
      if (platformId) {
        query.platformId = platformId;
      }
      
      // 基础统计
      const [
        totalAccounts,
        activeAccounts,
        suspendedAccounts,
        accountsByType,
        recentActiveAccounts
      ] = await Promise.all([
        WechatAccount.countDocuments(query),
        WechatAccount.countDocuments({ ...query, status: WechatAccountStatus.ACTIVE }),
        WechatAccount.countDocuments({ ...query, status: WechatAccountStatus.SUSPENDED }),
        WechatAccount.aggregate([
          { $match: query },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ]),
        WechatAccount.find({ ...query, status: WechatAccountStatus.ACTIVE })
          .sort({ 'stats.lastActiveTime': -1 })
          .limit(10)
      ]);
      
      // 聚合用户和交易统计
      const [userStats, transactionStats] = await Promise.all([
        WechatUser.aggregate([
          ...(platformId ? [{ $match: { platformId } }] : []),
          {
            $group: {
              _id: null,
              total: { $sum: 1 }
            }
          }
        ]),
        WechatPayment.aggregate([
          ...(platformId ? [{ $match: { platformId } }] : []),
          { $match: { status: 'PAID' } },
          {
            $group: {
              _id: null,
              totalTransactions: { $sum: 1 },
              totalRevenue: { $sum: '$totalFee' }
            }
          }
        ])
      ]);
      
      // 处理类型统计
      const typeStats: { [key: string]: number } = {};
      accountsByType.forEach(item => {
        typeStats[item._id] = item.count;
      });
      
      return {
        totalAccounts,
        activeAccounts,
        suspendedAccounts,
        totalUsers: userStats[0]?.total || 0,
        totalTransactions: transactionStats[0]?.totalTransactions || 0,
        totalRevenue: transactionStats[0]?.totalRevenue || 0,
        accountsByType: typeStats,
        recentActiveAccounts
      };
    } catch (error) {
      console.error('获取微信账号统计失败:', error);
      throw error;
    }
  }
  
  /**
   * 根据AppId获取账号配置（用于业务逻辑）
   */
  async getAccountConfigByAppId(appId: string): Promise<{
    appId: string;
    appSecret: string;
    mchId?: string;
    mchKey?: string;
    enablePayment: boolean;
    enableRefund: boolean;
    enableMessage: boolean;
  } | null> {
    try {
      const account = await WechatAccount.findByAppId(appId);
      if (!account || account.status !== WechatAccountStatus.ACTIVE) {
        return null;
      }
      
      return {
        appId: account.appId,
        appSecret: this.decryptSensitiveData(account.appSecret),
        mchId: account.mchId || undefined,
        mchKey: account.mchKey ? this.decryptSensitiveData(account.mchKey) : undefined,
        enablePayment: account.enablePayment,
        enableRefund: account.enableRefund,
        enableMessage: account.enableMessage
      };
    } catch (error) {
      console.error('获取账号配置失败:', error);
      return null;
    }
  }
  
  /**
   * 检查API调用限制
   */
  async checkApiLimit(accountId: string): Promise<boolean> {
    try {
      const account = await WechatAccount.findByAccountId(accountId);
      if (!account) {
        return false;
      }
      
      return await account.checkApiLimit();
    } catch (error) {
      console.error('检查API限制失败:', error);
      return false;
    }
  }
  
  /**
   * 记录API调用
   */
  async recordApiCall(accountId: string): Promise<void> {
    try {
      await WechatAccount.updateOne(
        { accountId },
        { 
          $inc: { 'stats.apiCallsToday': 1 },
          $set: { 'stats.lastActiveTime': new Date() }
        }
      );
    } catch (error) {
      console.error('记录API调用失败:', error);
    }
  }
}