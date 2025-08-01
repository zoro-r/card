import axios from 'axios';
import crypto from 'crypto';
import xml2js from 'xml2js';
import { WechatPayment, IWechatPayment, WechatPaymentStatus, WechatPaymentType } from '@/models/wechatPayment';
import { WechatAccountService } from '@/service/wechatAccount';

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
  validatePaymentConfig(): boolean;
}

/**
 * 微信统一下单请求参数
 */
interface UnifiedOrderParams {
  body: string;                 // 商品描述
  outTradeNo: string;          // 商户订单号
  totalFee: number;            // 支付金额（分）
  spbillCreateIp: string;      // 终端IP
  notifyUrl: string;           // 通知地址
  tradeType: string;           // 交易类型
  openid?: string;             // 用户openid（JSAPI必填）
  detail?: string;             // 商品详情
  attach?: string;             // 附加数据
}

/**
 * 微信支付回调数据
 */
interface PaymentNotifyData {
  return_code: string;
  return_msg: string;
  appid?: string;
  mch_id?: string;
  nonce_str?: string;
  sign?: string;
  result_code?: string;
  openid?: string;
  is_subscribe?: string;
  trade_type?: string;
  bank_type?: string;
  total_fee?: string;
  fee_type?: string;
  transaction_id?: string;
  out_trade_no?: string;
  attach?: string;
  time_end?: string;
  err_code?: string;
  err_code_des?: string;
}

/**
 * 微信支付服务类
 */
export class WechatPaymentService {
  private config: WechatAccountConfig;

  constructor(config: WechatAccountConfig) {
    this.config = config;
  }

  /**
   * 创建统一下单
   * @param params 下单参数
   * @returns 下单结果
   */
  async createUnifiedOrder(params: UnifiedOrderParams): Promise<{
    prepayId?: string;
    codeUrl?: string;
    paySign?: string;
    timeStamp?: string;
    nonceStr?: string;
    signType?: string;
    package?: string;
  }> {
    try {
      // 1. 验证支付配置
      if (!this.config.validatePaymentConfig()) {
        throw new Error('微信支付配置不完整');
      }

      // 2. 生成随机字符串
      const nonceStr = this.generateNonceStr();
      
      // 3. 构建请求参数
      const requestData: any = {
        appid: this.config.appId,
        mch_id: this.config.mchId,
        nonce_str: nonceStr,
        body: params.body,
        out_trade_no: params.outTradeNo,
        total_fee: params.totalFee,
        spbill_create_ip: params.spbillCreateIp,
        notify_url: params.notifyUrl,
        trade_type: params.tradeType
      };

      // 4. 添加可选参数
      if (params.openid) requestData.openid = params.openid;
      if (params.detail) requestData.detail = params.detail;
      if (params.attach) requestData.attach = params.attach;

      // 5. 生成签名
      requestData.sign = this.generateSign(requestData);

      // 6. 转换为XML
      const xmlData = this.buildXml(requestData);

      // 7. 发送请求
      const response = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', xmlData, {
        headers: { 'Content-Type': 'application/xml' }
      });

      // 8. 解析响应
      const result = await this.parseXml(response.data);

      // 9. 验证响应
      if (result.return_code !== 'SUCCESS') {
        throw new Error(`微信支付接口错误: ${result.return_msg}`);
      }

      if (result.result_code !== 'SUCCESS') {
        throw new Error(`微信支付业务错误: ${result.err_code_des || result.err_code}`);
      }

      // 10. 验证签名
      if (!this.verifySign(result)) {
        throw new Error('微信支付响应签名验证失败');
      }

      // 11. 构建返回数据
      const responseData: any = {};

      if (params.tradeType === 'JSAPI') {
        // 小程序支付参数
        const timeStamp = Math.floor(Date.now() / 1000).toString();
        const pkg = `prepay_id=${result.prepay_id}`;
        
        const paySignData = {
          appId: this.config.appId,
          timeStamp,
          nonceStr,
          package: pkg,
          signType: 'MD5'
        };

        responseData.prepayId = result.prepay_id;
        responseData.paySign = this.generateSign(paySignData);
        responseData.timeStamp = timeStamp;
        responseData.nonceStr = nonceStr;
        responseData.signType = 'MD5';
        responseData.package = pkg;
      } else if (params.tradeType === 'NATIVE') {
        // 扫码支付
        responseData.codeUrl = result.code_url;
      }

      return responseData;
    } catch (error) {
      console.error('创建统一下单失败:', error);
      throw error;
    }
  }

  /**
   * 处理支付回调通知
   * @param xmlData 微信支付回调XML数据
   * @returns 处理结果
   */
  async handlePaymentNotify(xmlData: string): Promise<{
    success: boolean;
    message: string;
    payment?: IWechatPayment;
  }> {
    try {
      // 1. 解析XML数据
      const notifyData = await this.parseXml(xmlData) as PaymentNotifyData;

      // 2. 验证基本参数
      if (notifyData.return_code !== 'SUCCESS') {
        return {
          success: false,
          message: `通信失败: ${notifyData.return_msg}`
        };
      }

      // 3. 验证签名
      if (!this.verifySign(notifyData)) {
        return {
          success: false,
          message: '签名验证失败'
        };
      }

      // 4. 查找支付记录
      const payment = await WechatPayment.findByOutTradeNo(notifyData.out_trade_no!);
      if (!payment) {
        return {
          success: false,
          message: '支付记录不存在'
        };
      }

      // 5. 检查支付状态
      if (payment.status === WechatPaymentStatus.PAID) {
        return {
          success: true,
          message: '订单已处理',
          payment
        };
      }

      // 6. 处理支付结果
      if (notifyData.result_code === 'SUCCESS') {
        // 支付成功
        await payment.markAsPaid({
          transaction_id: notifyData.transaction_id,
          time_end: notifyData.time_end,
          cash_fee: parseInt(notifyData.total_fee!),
          fee_type: notifyData.fee_type || 'CNY'
        });

        return {
          success: true,
          message: '支付成功',
          payment
        };
      } else {
        // 支付失败
        await payment.markAsFailed({
          err_code: notifyData.err_code,
          err_code_des: notifyData.err_code_des
        });

        return {
          success: false,
          message: `支付失败: ${notifyData.err_code_des || notifyData.err_code}`,
          payment
        };
      }
    } catch (error) {
      console.error('处理支付回调失败:', error);
      return {
        success: false,
        message: '处理回调失败'
      };
    }
  }

  /**
   * 查询支付状态
   * @param outTradeNo 商户订单号
   * @returns 查询结果
   */
  async queryPaymentStatus(outTradeNo: string): Promise<{
    success: boolean;
    status: WechatPaymentStatus;
    data?: any;
  }> {
    try {
      // 1. 构建查询参数
      const nonceStr = this.generateNonceStr();
      const requestData = {
        appid: this.config.appId,
        mch_id: this.config.mchId,
        out_trade_no: outTradeNo,
        nonce_str: nonceStr
      };

      // 2. 生成签名
      (requestData as any).sign = this.generateSign(requestData);

      // 3. 转换为XML
      const xmlData = this.buildXml(requestData);

      // 4. 发送查询请求
      const response = await axios.post('https://api.mch.weixin.qq.com/pay/orderquery', xmlData, {
        headers: { 'Content-Type': 'application/xml' }
      });

      // 5. 解析响应
      const result = await this.parseXml(response.data);

      // 6. 处理查询结果
      if (result.return_code !== 'SUCCESS') {
        throw new Error(`查询接口错误: ${result.return_msg}`);
      }

      if (result.result_code !== 'SUCCESS') {
        return {
          success: false,
          status: WechatPaymentStatus.FAILED,
          data: result
        };
      }

      // 7. 根据交易状态返回结果
      let status: WechatPaymentStatus;
      switch (result.trade_state) {
        case 'SUCCESS':
          status = WechatPaymentStatus.PAID;
          break;
        case 'REFUND':
          status = WechatPaymentStatus.REFUNDED;
          break;
        case 'NOTPAY':
          status = WechatPaymentStatus.PENDING;
          break;
        case 'CLOSED':
          status = WechatPaymentStatus.CANCELLED;
          break;
        case 'PAYERROR':
          status = WechatPaymentStatus.FAILED;
          break;
        default:
          status = WechatPaymentStatus.PENDING;
      }

      return {
        success: true,
        status,
        data: result
      };
    } catch (error) {
      console.error('查询支付状态失败:', error);
      return {
        success: false,
        status: WechatPaymentStatus.FAILED
      };
    }
  }

  /**
   * 申请退款
   * @param outTradeNo 商户订单号
   * @param refundFee 退款金额（分）
   * @param reason 退款原因
   * @returns 退款结果
   */
  async refund(
    outTradeNo: string, 
    refundFee: number, 
    reason?: string
  ): Promise<{
    success: boolean;
    refundId?: string;
    message: string;
  }> {
    try {
      // 1. 查找支付记录
      const payment = await WechatPayment.findByOutTradeNo(outTradeNo);
      if (!payment) {
        throw new Error('支付记录不存在');
      }

      if (payment.status !== WechatPaymentStatus.PAID) {
        throw new Error('订单状态不支持退款');
      }

      // 2. 生成退款单号（符合微信32字节限制）
      const timestamp = Date.now().toString();
      const randomSuffix = Math.random().toString(36).substring(2, 6); // 4位随机字符
      const outRefundNo = `RF${timestamp.slice(-10)}${randomSuffix}`; // RF + 10位时间戳 + 4位随机 = 16位
      const nonceStr = this.generateNonceStr();

      // 3. 构建退款参数
      const requestData = {
        appid: this.config.appId,
        mch_id: this.config.mchId,
        nonce_str: nonceStr,
        out_trade_no: outTradeNo,
        out_refund_no: outRefundNo,
        total_fee: payment.totalFee,
        refund_fee: refundFee,
        refund_desc: reason || '用户申请退款'
      };

      // 4. 生成签名
      (requestData as any).sign = this.generateSign(requestData);

      // 5. 转换为XML
      const xmlData = this.buildXml(requestData);

      // 6. 发送退款请求（需要证书）
      const response = await axios.post('https://api.mch.weixin.qq.com/secapi/pay/refund', xmlData, {
        headers: { 'Content-Type': 'application/xml' }
        // 注意：生产环境需要配置SSL证书
      });

      // 7. 解析响应
      const result = await this.parseXml(response.data);

      // 8. 处理退款结果
      if (result.return_code !== 'SUCCESS') {
        throw new Error(`退款接口错误: ${result.return_msg}`);
      }

      if (result.result_code !== 'SUCCESS') {
        throw new Error(`退款业务错误: ${result.err_code_des || result.err_code}`);
      }

      // 9. 更新支付记录
      await payment.initiateRefund(refundFee, reason);

      return {
        success: true,
        refundId: result.refund_id,
        message: '退款申请成功'
      };
    } catch (error) {
      console.error('申请退款失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '退款申请失败'
      };
    }
  }

  /**
   * 生成随机字符串
   * @param length 长度
   * @returns 随机字符串
   */
  private generateNonceStr(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 生成签名
   * @param data 待签名数据
   * @returns 签名字符串
   */
  private generateSign(data: any): string {
    // 1. 过滤空值并排序
    const filteredData = Object.keys(data)
      .filter(key => data[key] !== undefined && data[key] !== '' && key !== 'sign')
      .sort()
      .reduce((result, key) => {
        result[key] = data[key];
        return result;
      }, {} as any);

    // 2. 构建签名字符串
    const stringA = Object.keys(filteredData)
      .map(key => `${key}=${filteredData[key]}`)
      .join('&');

    // 3. 添加商户密钥
    const stringSignTemp = `${stringA}&key=${this.config.mchKey}`;

    // 4. MD5加密并转为大写
    return crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
  }

  /**
   * 验证签名
   * @param data 待验证数据
   * @returns 验证结果
   */
  private verifySign(data: any): boolean {
    const sign = data.sign;
    const calculatedSign = this.generateSign(data);
    return sign === calculatedSign;
  }

  /**
   * 构建XML数据
   * @param data 数据对象
   * @returns XML字符串
   */
  private buildXml(data: any): string {
    const builder = new xml2js.Builder({ 
      rootName: 'xml', 
      headless: true,
      renderOpts: { pretty: false }
    });
    return builder.buildObject(data);
  }

  /**
   * 解析XML数据
   * @param xmlData XML字符串
   * @returns 解析后的对象
   */
  private async parseXml(xmlData: string): Promise<any> {
    const parser = new xml2js.Parser({ 
      explicitArray: false,
      ignoreAttrs: true
    });
    const result = await parser.parseStringPromise(xmlData);
    return result.xml;
  }

  /**
   * 生成支付回调成功响应
   * @returns XML响应
   */
  static generateSuccessResponse(): string {
    return `<xml>
      <return_code><![CDATA[SUCCESS]]></return_code>
      <return_msg><![CDATA[OK]]></return_msg>
    </xml>`;
  }

  /**
   * 生成支付回调失败响应
   * @param message 错误信息
   * @returns XML响应
   */
  static generateFailResponse(message: string): string {
    return `<xml>
      <return_code><![CDATA[FAIL]]></return_code>
      <return_msg><![CDATA[${message}]]></return_msg>
    </xml>`;
  }

  /**
   * 获取微信支付配置
   * @param platformId 平台ID (实际上是appId)
   * @returns 支付服务实例
   */
  static async create(platformId: string): Promise<WechatPaymentService> {
    const wechatAccountService = new WechatAccountService();
    
    // 直接通过appId查找账户配置
    const config = await wechatAccountService.getAccountConfigByAppId(platformId);
    if (!config || !config.enablePayment) {
      throw new Error('未找到可用的微信支付配置');
    }

    // 创建配置对象，包含验证方法
    const wechatConfig: WechatAccountConfig = {
      ...config,
      validatePaymentConfig: () => !!(config.appId && config.appSecret && config.mchId && config.mchKey)
    };

    return new WechatPaymentService(wechatConfig);
  }
}