import request from '@/utils/request';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  COMPLETED = 'COMPLETED'
}

export enum PaymentMethod {
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY',
  BALANCE = 'BALANCE',
  OFFLINE = 'OFFLINE'
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  skuId?: string;
  skuName?: string;
  skuImage?: string;
  unitPrice: number;
  unitPriceYuan: string;
  quantity: number;
  totalPrice: number;
  totalPriceYuan: string;
  attributes?: { [key: string]: string };
}

export interface ShippingAddress {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string;
}

export interface LogisticsInfo {
  company: string;
  trackingNumber: string;
  status: string;
  lastUpdate: string;
  tracks?: Array<{
    time: string;
    status: string;
    description: string;
  }>;
}

export interface Order {
  _id: string;
  orderNo: string;
  orderType: string;
  status: OrderStatus;
  statusText: string;
  userId?: string;
  openid?: string;
  platformId: string;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  subtotalYuan: string;
  shippingFee: number;
  shippingFeeYuan: string;
  discountAmount: number;
  discountAmountYuan: string;
  totalAmount: number;
  totalAmountYuan: string;
  paidAmount: number;
  paidAmountYuan: string;
  paymentMethod?: PaymentMethod;
  paymentStatus: string;
  paymentTime?: string;
  paymentId?: string;
  shippingAddress?: ShippingAddress;
  logistics?: LogisticsInfo;
  shippingTime?: string;
  deliveryTime?: string;
  couponId?: string;
  couponAmount?: number;
  couponAmountYuan?: string;
  promotionId?: string;
  promotionAmount?: number;
  promotionAmountYuan?: string;
  buyerMessage?: string;
  sellerMessage?: string;
  isRated: boolean;
  ratingId?: string;
  refundStatus?: string;
  refundAmount?: number;
  refundAmountYuan?: string;
  refundReason?: string;
  refundTime?: string;
  source?: string;
  channel?: string;
  tags?: string[];
  metadata?: { [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export interface OrderListParams {
  platformId: string;
  status?: OrderStatus;
  page?: number;
  limit?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderStats {
  total: number;
  totalAmount: number;
  totalAmountYuan: string;
  statusStats: {
    [key: string]: {
      count: number;
      amount: number;
      amountYuan: string;
    };
  };
}

export interface ShipOrderParams {
  company: string;
  trackingNumber: string;
  description?: string;
}

/**
 * 获取订单列表
 */
export async function getOrderList(params: OrderListParams) {
  return request<{
    success: boolean;
    data: OrderListResponse;
    message: string;
  }>(`/api/admin/orders/${params.platformId}`, {
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
 * 获取订单详情
 */
export async function getOrderDetail(orderNo: string) {
  return request<{
    success: boolean;
    data: Order;
    message: string;
  }>(`/api/orders/${orderNo}`, {
    method: 'GET',
  });
}

/**
 * 订单发货
 */
export async function shipOrder(orderNo: string, data: ShipOrderParams) {
  return request<{
    success: boolean;
    data: Order;
    message: string;
  }>(`/api/admin/orders/${orderNo}/ship`, {
    method: 'POST',
    data,
  });
}

/**
 * 更新订单备注
 */
export async function updateOrderRemark(orderNo: string, sellerMessage: string) {
  return request<{
    success: boolean;
    data: Order;
    message: string;
  }>(`/api/admin/orders/${orderNo}/remark`, {
    method: 'PUT',
    data: { sellerMessage },
  });
}

/**
 * 获取订单统计
 */
export async function getOrderStats(platformId: string, startDate?: string, endDate?: string) {
  return request<{
    success: boolean;
    data: OrderStats;
    message: string;
  }>(`/api/admin/orders/${platformId}/stats`, {
    method: 'GET',
    params: {
      startDate,
      endDate,
    },
  });
}