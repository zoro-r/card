# 微信管理后台API接口文档

## 概述

本文档为管理后台提供微信小程序用户和支付数据管理的API接口说明。所有接口都需要管理员权限认证。

## 基础信息

**API 基础URL：** `https://your-domain.com/api`

**认证方式：** JWT Token（管理员权限）

**数据格式：** JSON

## 通用响应格式

### 成功响应
```json
{
  "code": 200,
  "data": {}, 
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "code": 400,
  "data": null,
  "message": "错误描述"
}
```

## 用户管理接口

### 1. 获取用户列表

**接口地址：** `GET /admin/wechat/accounts/{accountId}/users`

**接口描述：** 获取指定微信账号下的用户列表

**请求头：**
```
Authorization: Bearer <admin_jwt_token>
```

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | string | 是 | 微信账号ID |

**查询参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |
| keyword | string | 否 | 搜索关键词（昵称或手机号） |

**请求示例：**
```
GET /admin/wechat/accounts/account123/users?page=1&limit=20&keyword=张三
```

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "users": [
      {
        "_id": "用户ID",
        "openid": "用户openid",
        "appId": "wx1234567890abcdef",
        "nickName": "微信昵称",
        "avatarUrl": "头像URL",
        "gender": 1,
        "city": "广州",
        "province": "广东",
        "country": "中国",
        "language": "zh_CN",
        "phone": "13800138000",
        "phoneCountryCode": "86",
        "isActive": true,
        "isBlocked": false,
        "lastLoginTime": "2024-01-01T00:00:00.000Z",
        "registerTime": "2024-01-01T00:00:00.000Z",
        "loginCount": 10,
        "tags": ["VIP", "活跃用户"],
        "remark": "备注信息",
        "source": "小程序",
        "genderText": "男",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
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

**接口地址：** `PUT /admin/wechat/accounts/{accountId}/users/{userId}/status`

**接口描述：** 更新用户的激活状态、封禁状态和备注信息

**请求头：**
```
Authorization: Bearer <admin_jwt_token>
```

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | string | 是 | 微信账号ID |
| userId | string | 是 | 用户ID |

**请求参数：**
```json
{
  "isActive": true,
  "isBlocked": false,
  "remark": "备注信息"
}
```

**参数说明：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| isActive | boolean | 否 | 是否激活 |
| isBlocked | boolean | 否 | 是否封禁 |
| remark | string | 否 | 备注信息 |

**响应数据：**
```json
{
  "code": 200,
  "data": {
    // 更新后的用户信息
  },
  "message": "更新用户状态成功"
}
```

### 3. 获取用户详情

**接口地址：** `GET /admin/wechat/accounts/{accountId}/users/{userId}`

**接口描述：** 获取用户的详细信息

**请求头：**
```
Authorization: Bearer <admin_jwt_token>
```

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | string | 是 | 微信账号ID |
| userId | string | 是 | 用户ID |

**响应数据：** 同用户列表中的单个用户对象

## 支付管理接口

### 1. 获取支付记录列表

**接口地址：** `GET /admin/wechat/accounts/{accountId}/payments`

**接口描述：** 获取指定微信账号下的支付记录列表

**请求头：**
```
Authorization: Bearer <admin_jwt_token>
```

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | string | 是 | 微信账号ID |

**查询参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| limit | number | 否 | 每页数量，默认20 |
| keyword | string | 否 | 搜索关键词（订单号或商品描述） |
| status | string | 否 | 支付状态筛选 |
| startDate | string | 否 | 开始日期 (YYYY-MM-DD) |
| endDate | string | 否 | 结束日期 (YYYY-MM-DD) |

**支付状态枚举：**
- `PENDING` - 待支付
- `PAID` - 已支付
- `FAILED` - 支付失败
- `REFUNDING` - 退款中
- `REFUNDED` - 已退款
- `CANCELLED` - 已取消

**请求示例：**
```
GET /admin/wechat/accounts/account123/payments?page=1&limit=20&status=PAID&startDate=2024-01-01&endDate=2024-01-31
```

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "payments": [
      {
        "_id": "支付记录ID",
        "outTradeNo": "商户订单号",
        "transactionId": "微信订单号",
        "body": "商品描述",
        "detail": "商品详情",
        "totalFee": 100,
        "totalFeeYuan": "1.00",
        "currency": "CNY",
        "openid": "用户openid",
        "appId": "wx1234567890abcdef",
        "paymentType": "JSAPI",
        "tradeType": "JSAPI",
        "status": "PAID",
        "statusText": "已支付",
        "prepayId": "预支付ID",
        "notifyUrl": "回调地址",
        "timeEnd": "2024-01-01T00:00:00.000Z",
        "cashFee": 100,
        "cashFeeYuan": "1.00",
        "refundFee": 0,
        "refundFeeYuan": "0.00",
        "spbillCreateIp": "127.0.0.1",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "pages": 25
    }
  },
  "message": "获取支付记录列表成功"
}
```

### 2. 获取支付统计

**接口地址：** `GET /admin/wechat/accounts/{accountId}/payments/stats`

**接口描述：** 获取指定微信账号的支付统计数据

**请求头：**
```
Authorization: Bearer <admin_jwt_token>
```

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | string | 是 | 微信账号ID |

**查询参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期 (YYYY-MM-DD) |
| endDate | string | 否 | 结束日期 (YYYY-MM-DD) |

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "total": 500,
    "totalAmount": 50000,
    "totalAmountYuan": 500.00,
    "statusStats": {
      "PAID": {
        "count": 450,
        "amount": 45000,
        "amountYuan": "450.00"
      },
      "PENDING": {
        "count": 30,
        "amount": 3000,
        "amountYuan": "30.00"
      },
      "REFUNDED": {
        "count": 20,
        "amount": 2000,
        "amountYuan": "20.00"
      }
    }
  },
  "message": "获取支付统计成功"
}
```

### 3. 获取支付详情

**接口地址：** `GET /admin/wechat/accounts/{accountId}/payments/{paymentId}`

**接口描述：** 获取支付记录的详细信息

**请求头：**
```
Authorization: Bearer <admin_jwt_token>
```

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| accountId | string | 是 | 微信账号ID |
| paymentId | string | 是 | 支付记录ID |

**响应数据：** 同支付记录列表中的单个支付对象

## 微信账号管理接口

### 1. 获取微信账号列表

**接口地址：** `GET /admin/wechat/platforms/{platformId}/accounts`

**接口描述：** 获取指定平台下的微信账号列表

**请求头：**
```
Authorization: Bearer <admin_jwt_token>
```

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| platformId | string | 是 | 平台ID |

**响应数据：**
```json
{
  "code": 200,
  "data": [
    {
      "accountId": "account123",
      "name": "测试小程序",
      "displayName": "测试小程序",
      "appId": "wx1234567890abcdef",
      "type": "MINIPROGRAM",
      "typeText": "小程序",
      "status": "ACTIVE",
      "statusText": "正常",
      "enablePayment": true,
      "enableRefund": true,
      "enableMessage": false,
      "description": "这是一个测试小程序",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "获取微信账号列表成功"
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（token无效或过期） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 数据字典

### 用户状态
| 字段 | 类型 | 说明 |
|------|------|------|
| isActive | boolean | true=激活，false=禁用 |
| isBlocked | boolean | true=封禁，false=正常 |

### 性别类型
| 值 | 说明 |
|----|------|
| 0 | 未知 |
| 1 | 男 |
| 2 | 女 |

### 支付类型
| 值 | 说明 |
|----|------|
| JSAPI | 小程序支付 |
| APP | APP支付 |
| NATIVE | 扫码支付 |
| H5 | H5支付 |

## 使用示例

### JavaScript/Node.js
```javascript
// 获取用户列表
async function getUserList(accountId, page = 1, limit = 20) {
  const response = await fetch(`/admin/wechat/accounts/${accountId}/users?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  return result.data;
}

// 更新用户状态
async function updateUserStatus(accountId, userId, statusData) {
  const response = await fetch(`/admin/wechat/accounts/${accountId}/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(statusData)
  });
  
  const result = await response.json();
  return result;
}
```

### curl 示例
```bash
# 获取用户列表
curl -X GET "https://your-domain.com/admin/wechat/accounts/account123/users?page=1&limit=20" \
  -H "Authorization: Bearer your_admin_token"

# 更新用户状态
curl -X PUT "https://your-domain.com/admin/wechat/accounts/account123/users/user456/status" \
  -H "Authorization: Bearer your_admin_token" \
  -H "Content-Type: application/json" \
  -d '{"isActive": true, "isBlocked": false, "remark": "正常用户"}'
```

## 权限说明

所有管理后台接口都需要管理员权限。权限验证通过JWT Token中的用户角色进行判断。

## 安全建议

1. **权限控制：** 严格控制管理员权限，避免权限滥用
2. **操作日志：** 建议记录所有管理操作的日志
3. **数据脱敏：** 在日志中避免记录敏感信息
4. **访问限制：** 建议对管理后台接口添加IP白名单限制

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持用户管理功能
- 支持支付记录管理
- 支持数据统计功能
- 基于微信账号的数据隔离

---

如有其他问题，请联系技术支持团队。