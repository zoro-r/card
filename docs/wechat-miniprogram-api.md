# 微信小程序生态系统 API 文档

## 概述

本文档描述了微信小程序生态系统的完整 API 接口，包含用户管理、支付系统、订单管理等核心功能。

## 目录

- [认证机制](#认证机制)
- [微信用户 API](#微信用户-api)
- [微信支付 API](#微信支付-api)
- [订单管理 API](#订单管理-api)
- [管理后台 API](#管理后台-api)
- [错误码说明](#错误码说明)
- [数据模型](#数据模型)

## 认证机制

### JWT Token 认证

所有需要认证的接口都使用 JWT Token 进行认证，Token 需要在请求头中携带：

```http
Authorization: Bearer <token>
```

### Token 获取

通过微信小程序登录接口获取 Token：

```http
POST /api/wechat/{platformId}/login
```

## 微信用户 API

### 1. 小程序登录

**接口地址**: `POST /api/wechat/{platformId}/login`

**请求参数**:
```json
{
  "code": "string",      // 微信登录凭证
  "platformId": "string" // 平台ID
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "openid": "ox1234567890abcdef",
      "nickName": "微信用户",
      "avatarUrl": "https://...",
      "platformId": "platform001",
      "isActive": true,
      "loginCount": 5,
      "lastLoginTime": "2024-01-15T08:30:00.000Z",
      "registerTime": "2024-01-01T10:00:00.000Z"
    },
    "isNewUser": false
  },
  "message": "登录成功"
}
```

### 2. 解密用户信息

**接口地址**: `POST /api/wechat/{platformId}/decrypt-userinfo`

**认证**: 需要 Token

**请求参数**:
```json
{
  "encryptedData": "string", // 加密的用户数据
  "iv": "string",            // 初始向量
  "platformId": "string"     // 平台ID
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "openId": "ox1234567890abcdef",
    "nickName": "张三",
    "gender": 1,
    "city": "深圳",
    "province": "广东",
    "country": "中国",
    "avatarUrl": "https://wx.qlogo.cn/...",
    "unionId": "ux1234567890abcdef",
    "watermark": {
      "timestamp": 1642234567,
      "appid": "wx1234567890abcdef"
    }
  },
  "message": "解密成功"
}
```

### 3. 解密手机号

**接口地址**: `POST /api/wechat/{platformId}/decrypt-phone`

**认证**: 需要 Token

**请求参数**:
```json
{
  "encryptedData": "string", // 加密的手机号数据
  "iv": "string",            // 初始向量
  "platformId": "string"     // 平台ID
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "phoneNumber": "13800138000",
    "countryCode": "86"
  },
  "message": "获取手机号成功"
}
```

### 4. 获取用户信息

**接口地址**: `GET /api/wechat/{platformId}/userinfo`

**认证**: 需要 Token

**响应示例**:
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "openid": "ox1234567890abcdef",
    "nickName": "张三",
    "avatarUrl": "https://wx.qlogo.cn/...",
    "gender": 1,
    "city": "深圳",
    "province": "广东",
    "country": "中国",
    "phone": "13800138000",
    "phoneCountryCode": "86",
    "platformId": "platform001",
    "isActive": true,
    "loginCount": 5,
    "lastLoginTime": "2024-01-15T08:30:00.000Z",
    "registerTime": "2024-01-01T10:00:00.000Z"
  },
  "message": "获取用户信息成功"
}
```

## 微信支付 API

### 1. 支付回调通知

**接口地址**: `POST /api/wechat/{platformId}/payment/notify`

**说明**: 微信支付服务器回调接口，用于接收支付结果通知

**请求格式**: XML

**响应格式**: XML

### 2. 查询支付状态

**接口地址**: `GET /api/wechat/{platformId}/payment/{outTradeNo}/query`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "status": "PAID",
    "details": {
      "trade_state": "SUCCESS",
      "transaction_id": "4200001234567890123456789",
      "out_trade_no": "WXplatform0012024011512345678901234",
      "total_fee": "100",
      "cash_fee": "100"
    }
  },
  "message": "查询成功"
}
```

### 3. 申请退款

**接口地址**: `POST /api/wechat/{platformId}/payment/refund`

**请求参数**:
```json
{
  "outTradeNo": "WXplatform0012024011512345678901234",
  "refundFee": 50,
  "reason": "用户申请退款"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "refundId": "50000000000000000000000000000000"
  },
  "message": "退款申请成功"
}
```

## 订单管理 API

### 1. 创建订单

**接口地址**: `POST /api/orders/{platformId}`

**认证**: 需要 Token

**请求参数**:
```json
{
  "items": [
    {
      "productId": "prod001",
      "productName": "测试商品",
      "productImage": "https://example.com/image.jpg",
      "skuId": "sku001",
      "skuName": "红色/L码",
      "unitPrice": 9900,
      "quantity": 2,
      "attributes": {
        "color": "红色",
        "size": "L"
      }
    }
  ],
  "shippingAddress": {
    "receiverName": "张三",
    "receiverPhone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "address": "科技园南区XX大厦1001室",
    "postalCode": "518000"
  },
  "buyerMessage": "请尽快发货",
  "orderType": "PRODUCT"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "orderNo": "PLATFORM001202401151234567890",
    "status": "PENDING",
    "orderType": "PRODUCT",
    "items": [...],
    "itemCount": 2,
    "subtotal": 19800,
    "shippingFee": 0,
    "discountAmount": 0,
    "totalAmount": 19800,
    "totalAmountYuan": "198.00",
    "paymentStatus": "UNPAID",
    "shippingAddress": {...},
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "创建订单成功"
}
```

### 2. 发起支付

**接口地址**: `POST /api/orders/{orderNo}/payment`

**认证**: 需要 Token

**响应示例**:
```json
{
  "success": true,
  "data": {
    "prepayId": "wx15103012345678901234567890123456",
    "paySign": "C380BEC2BFD727A4B6845133519F3AD6",
    "timeStamp": "1642234567",
    "nonceStr": "5K8264ILTKCH16CQ2502SI8ZNMTM67VS",
    "signType": "MD5",
    "package": "prepay_id=wx15103012345678901234567890123456"
  },
  "message": "发起支付成功"
}
```

### 3. 查询订单详情

**接口地址**: `GET /api/orders/{orderNo}`

**认证**: 需要 Token

**响应示例**:
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "orderNo": "PLATFORM001202401151234567890",
    "status": "PAID",
    "statusText": "已支付",
    "orderType": "PRODUCT",
    "items": [...],
    "totalAmount": 19800,
    "totalAmountYuan": "198.00",
    "paymentMethod": "WECHAT",
    "paymentStatus": "PAID",
    "paymentTime": "2024-01-15T10:35:00.000Z",
    "shippingAddress": {...},
    "wechatPayment": {...}
  },
  "message": "获取订单详情成功"
}
```

### 4. 获取订单列表

**接口地址**: `GET /api/orders/{platformId}/list`

**认证**: 需要 Token

**查询参数**:
- `status`: 订单状态 (可选)
- `page`: 页码 (默认1)
- `limit`: 每页数量 (默认20)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "total": 50,
    "page": 1,
    "limit": 20
  },
  "message": "获取订单列表成功"
}
```

### 5. 取消订单

**接口地址**: `POST /api/orders/{orderNo}/cancel`

**认证**: 需要 Token

**请求参数**:
```json
{
  "reason": "不想要了"
}
```

### 6. 确认收货

**接口地址**: `POST /api/orders/{orderNo}/confirm-delivery`

**认证**: 需要 Token

### 7. 查询支付状态

**接口地址**: `GET /api/orders/{orderNo}/payment-status`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "status": "PAID",
    "paid": true
  },
  "message": "查询支付状态成功"
}
```

## 管理后台 API

### 1. 获取用户列表

**接口地址**: `GET /api/admin/wechat/{platformId}/users`

**查询参数**:
- `page`: 页码 (默认1)
- `limit`: 每页数量 (默认20)
- `keyword`: 搜索关键词 (可选)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  },
  "message": "获取用户列表成功"
}
```

### 2. 更新用户状态

**接口地址**: `PUT /api/admin/wechat/{platformId}/users/{userId}/status`

**请求参数**:
```json
{
  "isActive": true,
  "isBlocked": false,
  "remark": "正常用户"
}
```

### 3. 获取订单列表

**接口地址**: `GET /api/admin/orders/{platformId}`

**查询参数**:
- `status`: 订单状态 (可选)
- `page`: 页码 (默认1)
- `limit`: 每页数量 (默认20)
- `keyword`: 搜索关键词 (可选)
- `startDate`: 开始日期 (可选)
- `endDate`: 结束日期 (可选)

### 4. 订单发货

**接口地址**: `POST /api/admin/orders/{orderNo}/ship`

**请求参数**:
```json
{
  "company": "顺丰速运",
  "trackingNumber": "SF1234567890123",
  "description": "商品已发货"
}
```

### 5. 获取订单统计

**接口地址**: `GET /api/admin/orders/{platformId}/stats`

**查询参数**:
- `startDate`: 开始日期 (可选)
- `endDate`: 结束日期 (可选)

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total": 100,
    "totalAmount": 500000,
    "totalAmountYuan": "5000.00",
    "statusStats": {
      "PENDING": {
        "count": 10,
        "amount": 50000,
        "amountYuan": "500.00"
      },
      "PAID": {
        "count": 80,
        "amount": 400000,
        "amountYuan": "4000.00"
      },
      "COMPLETED": {
        "count": 10,
        "amount": 50000,
        "amountYuan": "500.00"
      }
    }
  },
  "message": "获取订单统计成功"
}
```

## 错误码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 数据模型

### 订单状态枚举

```typescript
enum OrderStatus {
  PENDING = 'PENDING',         // 待支付
  PAID = 'PAID',              // 已支付
  SHIPPED = 'SHIPPED',        // 已发货
  DELIVERED = 'DELIVERED',    // 已收货
  CANCELLED = 'CANCELLED',    // 已取消
  REFUNDED = 'REFUNDED',      // 已退款
  COMPLETED = 'COMPLETED'     // 已完成
}
```

### 支付状态枚举

```typescript
enum WechatPaymentStatus {
  PENDING = 'PENDING',       // 待支付
  PAID = 'PAID',            // 已支付
  FAILED = 'FAILED',        // 支付失败
  REFUNDING = 'REFUNDING',  // 退款中
  REFUNDED = 'REFUNDED',    // 已退款
  CANCELLED = 'CANCELLED'   // 已取消
}
```

### 支付方式枚举

```typescript
enum PaymentMethod {
  WECHAT = 'WECHAT',          // 微信支付
  ALIPAY = 'ALIPAY',          // 支付宝
  BALANCE = 'BALANCE',        // 余额支付
  OFFLINE = 'OFFLINE'         // 线下支付
}
```

## 环境变量配置

```env
# JWT配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=30d

# 加密配置
ENCRYPT_KEY=your-encrypt-key-32-characters

# API配置
API_BASE_URL=https://your-api-domain.com
```

## 注意事项

1. 所有金额字段均以**分**为单位
2. 时间格式均为 ISO 8601 格式
3. 微信支付回调需要进行签名验证
4. Token 过期时间为30天，需要定期刷新
5. 支付回调地址需要在微信商户平台配置
6. 生产环境需要配置SSL证书用于退款接口