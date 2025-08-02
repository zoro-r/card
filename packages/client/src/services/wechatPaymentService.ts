import request from '@/utils/request';

export enum WechatPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDING = 'REFUNDING',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum WechatPaymentType {
  JSAPI = 'JSAPI',
  APP = 'APP',
  NATIVE = 'NATIVE',
  H5 = 'H5'
}

export interface WechatPayment {
  _id: string;
  orderNo: string;              // 关联的订单号
  outTradeNo: string;
  transactionId?: string;
  body: string;
  detail?: string;
  totalFee: number;
  totalFeeYuan: string;
  currency: string;
  openid: string;
  platformId: string;
  paymentType: WechatPaymentType;
  tradeType: string;
  status: WechatPaymentStatus;
  statusText: string;
  prepayId?: string;
  codeUrl?: string;
  notifyUrl: string;
  returnCode?: string;
  returnMsg?: string;
  resultCode?: string;
  errCode?: string;
  errCodeDes?: string;
  timeEnd?: string;
  cashFee?: number;
  cashFeeYuan?: string;
  feeType?: string;
  refundFee?: number;
  refundFeeYuan?: string;
  refundId?: string;
  refundStatus?: string;
  refundAccount?: string;
  refundRecvAccount?: string;
  refundSuccessTime?: string;
  refundReason?: string;
  attach?: string;
  goodsTag?: string;
  deviceInfo?: string;
  spbillCreateIp: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WechatPaymentListParams {
  accountId: string; // 直接使用accountId
  status?: WechatPaymentStatus;
  page?: number;
  limit?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface WechatPaymentListResponse {
  payments: WechatPayment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface RefundParams {
  outTradeNo: string;
  refundFee: number;
  reason?: string;
}

/**
 * 获取支付记录列表
 */
export async function getWechatPaymentList(params: WechatPaymentListParams) {
  return request<WechatPaymentListResponse>(`/api/admin/wechat/accounts/${params.accountId}/payments`, {
    method: 'GET',
    params: {
      status: params.status,
      page: params.page || 1,
      limit: params.limit || 20,
      keyword: params.keyword,
      startDate: params.startDate,
      endDate: params.endDate,
    },
  });
}

/**
 * 获取支付记录详情
 */
export async function getWechatPaymentDetail(accountId: string, paymentId: string) {
  return request<WechatPayment>(`/api/admin/wechat/accounts/${accountId}/payments/${paymentId}`, {
    method: 'GET',
  });
}

/**
 * 查询支付状态
 */
export async function queryWechatPaymentStatus(accountId: string, outTradeNo: string) {
  return request<{
    status: WechatPaymentStatus;
    details: any;
  }>(`/api/wechat/accounts/${accountId}/payment/${outTradeNo}/query`, {
    method: 'GET',
  });
}

/**
 * 申请退款
 */
export async function refundWechatPayment(accountId: string, data: RefundParams) {
  return request<{
    refundId?: string;
  }>(`/api/wechat/accounts/${accountId}/payment/refund`, {
    method: 'POST',
    data,
  });
}