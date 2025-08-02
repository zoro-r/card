# 微信管理接口文档

## 微信小程序用户管理

### 1. 微信用户登录
**接口地址**: `POST /api/wechat/login`

**说明**: 微信小程序用户通过code登录，获取JWT token

**请求参数**:
```json
{
  "code": "string",     // 必填，微信小程序wx.login()获取的code
  "appId": "string"     // 必填，微信小程序AppID
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "string",        // JWT token
    "openid": "string",       // 微信用户openid
    "session_key": "string",  // 会话密钥（加密）
    "userInfo": {
      "id": "string",
      "openid": "string",
      "unionid": "string",
      "appId": "string",
      "platformId": "string",
      "nickname": "string",
      "avatar": "string",
      "gender": 0,
      "city": "string",
      "province": "string",
      "country": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

### 2. 解密用户信息
**接口地址**: `POST /api/wechat/decrypt-userinfo`

**请求头**: `Authorization: Bearer <token>`

**说明**: 解密微信小程序getUserProfile获取的加密用户信息

**请求参数**:
```json
{
  "encryptedData": "string",  // 必填，加密数据
  "iv": "string"              // 必填，初始向量
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "解密成功",
  "data": {
    "openId": "string",
    "nickName": "string",
    "gender": 1,
    "city": "string",
    "province": "string",
    "country": "string",
    "avatarUrl": "string",
    "unionId": "string"
  }
}
```

### 3. 解密手机号
**接口地址**: `POST /api/wechat/decrypt-phone`

**请求头**: `Authorization: Bearer <token>`

**说明**: 解密微信小程序getPhoneNumber获取的加密手机号

**请求参数**:
```json
{
  "encryptedData": "string",  // 必填，加密数据
  "iv": "string"              // 必填，初始向量
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "解密成功",
  "data": {
    "phoneNumber": "string",     // 用户手机号
    "purePhoneNumber": "string", // 不带区号的手机号
    "countryCode": "string"      // 区号
  }
}
```

### 4. 获取微信用户信息
**接口地址**: `GET /api/wechat/userinfo`

**请求头**: `Authorization: Bearer <token>`

**说明**: 获取当前登录微信用户的详细信息

**响应数据**:
```json
{
  "code": 0,
  "message": "获取用户信息成功",
  "data": {
    "id": "string",
    "openid": "string",
    "unionid": "string",
    "appId": "string",
    "platformId": "string",
    "nickname": "string",
    "avatar": "string",
    "gender": 0,
    "city": "string",
    "province": "string",
    "country": "string",
    "phone": "string",
    "isActive": true,
    "lastLoginAt": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

## 微信支付管理

### 1. 支付回调通知
**接口地址**: `POST /api/wechat/accounts/:appId/payment/notify`

**说明**: 微信支付回调通知接口，由微信服务器调用

**路径参数**:
- `appId`: 微信小程序AppID

**请求参数**: 微信支付回调通知的XML格式数据

**响应数据**: 返回给微信服务器的XML响应

### 2. 查询支付状态
**接口地址**: `GET /api/wechat/accounts/:accountId/payment/:outTradeNo/query`

**请求头**: `Authorization: Bearer <token>`

**路径参数**:
- `accountId`: 微信账户ID
- `outTradeNo`: 商户订单号

**响应数据**:
```json
{
  "code": 0,
  "message": "查询成功",
  "data": {
    "appid": "string",
    "mch_id": "string",
    "out_trade_no": "string",
    "transaction_id": "string",
    "trade_state": "SUCCESS",
    "trade_state_desc": "支付成功",
    "total_fee": 100,
    "cash_fee": 100,
    "time_end": "20231201120000"
  }
}
```

### 3. 申请退款
**接口地址**: `POST /api/wechat/accounts/:accountId/payment/refund`

**请求头**: `Authorization: Bearer <token>`

**路径参数**:
- `accountId`: 微信账户ID

**请求参数**:
```json
{
  "out_trade_no": "string",     // 必填，商户订单号
  "out_refund_no": "string",    // 必填，商户退款单号
  "total_fee": 100,             // 必填，订单总金额（分）
  "refund_fee": 100,            // 必填，退款金额（分）
  "refund_desc": "string"       // 可选，退款原因
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "退款申请成功",
  "data": {
    "appid": "string",
    "mch_id": "string",
    "out_trade_no": "string",
    "out_refund_no": "string",
    "refund_id": "string",
    "refund_fee": 100,
    "total_fee": 100
  }
}
```

---

## 微信用户管理（管理后台）

### 1. 获取微信用户列表
**接口地址**: `GET /api/admin/wechat/accounts/:accountId/users`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_user:read`

**路径参数**:
- `accountId`: 微信账户ID

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20）
- `keyword`: 搜索关键词（昵称、openid）
- `isActive`: 用户状态过滤

**响应数据**:
```json
{
  "code": 0,
  "message": "获取用户列表成功",
  "data": {
    "users": [
      {
        "id": "string",
        "openid": "string",
        "unionid": "string",
        "appId": "string",
        "platformId": "string",
        "nickname": "string",
        "avatar": "string",
        "gender": 0,
        "city": "string",
        "province": "string",
        "country": "string",
        "phone": "string",
        "isActive": true,
        "lastLoginAt": "string",
        "orderCount": 5,
        "totalAmount": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### 2. 更新用户状态
**接口地址**: `PUT /api/admin/wechat/accounts/:accountId/users/:userId/status`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_user:update`

**路径参数**:
- `accountId`: 微信账户ID
- `userId`: 用户ID

**请求参数**:
```json
{
  "isActive": true,        // 必填，用户状态
  "reason": "string"       // 可选，操作原因
}
```

---

## 微信支付记录管理（管理后台）

### 1. 获取支付记录列表
**接口地址**: `GET /api/admin/wechat/accounts/:accountId/payments`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_payment:read`

**路径参数**:
- `accountId`: 微信账户ID

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20）
- `status`: 支付状态过滤
- `startDate`: 开始时间
- `endDate`: 结束时间
- `keyword`: 搜索关键词（订单号、交易号）

**响应数据**:
```json
{
  "code": 0,
  "message": "获取支付记录成功",
  "data": {
    "payments": [
      {
        "id": "string",
        "orderId": "string",
        "orderNo": "string",
        "appId": "string",
        "outTradeNo": "string",
        "transactionId": "string",
        "body": "string",
        "totalFee": 100,
        "totalFeeYuan": "1.00",
        "openid": "string",
        "paymentType": "JSAPI",
        "tradeType": "JSAPI",
        "status": "PAID",
        "paymentTime": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### 2. 获取支付记录详情
**接口地址**: `GET /api/admin/wechat/accounts/:accountId/payments/:paymentId`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_payment:read`

**路径参数**:
- `accountId`: 微信账户ID
- `paymentId`: 支付记录ID

**响应数据**:
```json
{
  "code": 0,
  "message": "获取支付详情成功",
  "data": {
    "id": "string",
    "orderId": "string",
    "orderNo": "string",
    "appId": "string",
    "outTradeNo": "string",
    "transactionId": "string",
    "body": "string",
    "totalFee": 100,
    "totalFeeYuan": "1.00",
    "openid": "string",
    "paymentType": "JSAPI",
    "tradeType": "JSAPI",
    "status": "PAID",
    "prepayId": "string",
    "notifyUrl": "string",
    "spbillCreateIp": "string",
    "attach": "string",
    "paymentTime": "string",
    "refunds": [
      {
        "id": "string",
        "refundNo": "string",
        "refundAmount": 50,
        "refundAmountYuan": "0.50",
        "reason": "string",
        "status": "SUCCESS",
        "refundTime": "string"
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

## 微信账户配置管理

### 1. 获取微信账户列表
**接口地址**: `GET /api/admin/wechat-accounts`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:read`

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20）
- `keyword`: 搜索关键词
- `status`: 状态过滤
- `platformId`: 平台过滤

**响应数据**:
```json
{
  "code": 0,
  "message": "获取微信账户列表成功",
  "data": {
    "accounts": [
      {
        "accountId": "string",
        "name": "string",
        "appId": "string",
        "platformId": "string",
        "status": "ACTIVE",
        "paymentEnabled": true,
        "userCount": 100,
        "paymentCount": 50,
        "totalAmount": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```

### 2. 创建微信账户
**接口地址**: `POST /api/admin/wechat-accounts`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:create`

**请求参数**:
```json
{
  "name": "string",           // 必填，账户名称
  "appId": "string",          // 必填，微信小程序AppID
  "appSecret": "string",      // 必填，微信小程序AppSecret
  "platformId": "string",     // 必填，平台ID
  "mchId": "string",          // 可选，微信支付商户号
  "mchKey": "string",         // 可选，微信支付API密钥
  "certContent": "string",    // 可选，证书内容
  "keyContent": "string",     // 可选，私钥内容
  "paymentEnabled": false,    // 可选，是否启用支付
  "description": "string"     // 可选，描述
}
```

### 3. 获取微信账户详情
**接口地址**: `GET /api/admin/wechat-accounts/:accountId`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:read`

### 4. 更新微信账户
**接口地址**: `PUT /api/admin/wechat-accounts/:accountId`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:update`

**请求参数**: 同创建微信账户（除appId外都可选）

### 5. 删除微信账户
**接口地址**: `DELETE /api/admin/wechat-accounts/:accountId`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:delete`

### 6. 激活微信账户
**接口地址**: `POST /api/admin/wechat-accounts/:accountId/activate`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:update`

### 7. 暂停微信账户
**接口地址**: `POST /api/admin/wechat-accounts/:accountId/suspend`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:update`

### 8. 测试微信账户配置
**接口地址**: `POST /api/admin/wechat-accounts/:accountId/test`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:read`

**响应数据**:
```json
{
  "code": 0,
  "message": "配置测试成功",
  "data": {
    "appConfig": {
      "valid": true,
      "message": "AppID和AppSecret配置正确"
    },
    "paymentConfig": {
      "valid": true,
      "message": "支付配置正确"
    }
  }
}
```

### 9. 获取微信账户统计
**接口地址**: `GET /api/admin/wechat-accounts/stats`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:read`

**响应数据**:
```json
{
  "code": 0,
  "message": "获取统计数据成功",
  "data": {
    "totalAccounts": 10,
    "activeAccounts": 8,
    "suspendedAccounts": 2,
    "totalUsers": 1000,
    "totalPayments": 500,
    "totalAmount": "50000.00"
  }
}
```

### 10. 获取微信账户选项
**接口地址**: `GET /api/admin/wechat-accounts/options`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:read`

**说明**: 用于下拉选择框等场景

**响应数据**:
```json
{
  "code": 0,
  "message": "获取选项成功",
  "data": [
    {
      "accountId": "string",
      "name": "string",
      "appId": "string",
      "status": "ACTIVE"
    }
  ]
}
```

### 11. 批量操作微信账户
**接口地址**: `POST /api/admin/wechat-accounts/batch`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:update`

**请求参数**:
```json
{
  "action": "ACTIVATE|SUSPEND|DELETE",  // 必填，操作类型
  "accountIds": ["string"]              // 必填，账户ID列表
}
```

### 12. 获取平台微信账户列表
**接口地址**: `GET /api/admin/platforms/:platformId/wechat-accounts`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `wechat_account:read`

**路径参数**:
- `platformId`: 平台ID

## 权限说明

### 微信用户管理权限
- `wechat_user:read` - 查看微信用户列表和详情
- `wechat_user:update` - 更新微信用户状态

### 微信支付管理权限
- `wechat_payment:read` - 查看支付记录和详情
- `wechat_payment:refund` - 申请退款

### 微信账户配置权限
- `wechat_account:create` - 创建微信账户
- `wechat_account:read` - 查看微信账户列表和详情
- `wechat_account:update` - 更新微信账户配置
- `wechat_account:delete` - 删除微信账户

## 数据字段说明

### 微信用户性别
- `0`: 未知
- `1`: 男性
- `2`: 女性

### 支付状态
- `PENDING`: 待支付
- `PAID`: 已支付
- `CANCELLED`: 已取消
- `REFUNDED`: 已退款
- `FAILED`: 支付失败

### 账户状态
- `ACTIVE`: 激活
- `SUSPENDED`: 暂停
- `DELETED`: 已删除