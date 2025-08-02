# 订单管理接口文档

## 订单操作（小程序端）

### 1. 创建订单
**接口地址**: `POST /api/orders` 或 `POST /api/orders/:platformId`

**请求头**: `Authorization: Bearer <token>`

**说明**: 微信小程序用户创建订单

**路径参数**:
- `platformId`: 平台ID（可选，优先从token中获取）

**请求参数**:
```json
{
  "items": [                    // 必填，商品列表
    {
      "productId": "string",    // 商品ID（可选，会自动生成）
      "productName": "string",  // 商品名称（可选，支持name字段）
      "name": "string",         // 商品名称（兼容字段）
      "productImage": "string", // 商品图片（可选）
      "skuId": "string",        // SKU ID（可选）
      "skuName": "string",      // SKU名称（可选）
      "skuImage": "string",     // SKU图片（可选）
      "unitPrice": 100,         // 单价（分）
      "price": 100,             // 单价（兼容字段，分）
      "quantity": 2,            // 必填，数量
      "description": "string",  // 商品描述（可选）
      "attributes": {           // 商品属性（可选）
        "color": "红色",
        "size": "L"
      }
    }
  ],
  "shippingAddress": {          // 收货地址（可选）
    "receiverName": "string",   // 收货人姓名
    "receiverPhone": "string",  // 收货人电话
    "province": "string",       // 省份
    "city": "string",          // 城市
    "district": "string",      // 区县
    "address": "string",       // 详细地址
    "postalCode": "string"     // 邮政编码（可选）
  },
  "couponId": "string",         // 优惠券ID（可选）
  "buyerMessage": "string",     // 买家留言（可选）
  "orderType": "PRODUCT"        // 订单类型（可选）
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "创建订单成功",
  "data": {
    "orderNo": "string",
    "orderType": "PRODUCT",
    "status": "PENDING",
    "statusText": "待支付",
    "openid": "string",
    "platformId": "string",
    "items": [
      {
        "productId": "string",
        "productName": "string",
        "unitPrice": 100,
        "unitPriceYuan": "1.00",
        "quantity": 2,
        "totalPrice": 200,
        "totalPriceYuan": "2.00",
        "attributes": {}
      }
    ],
    "itemCount": 2,
    "subtotal": 200,
    "subtotalYuan": "2.00",
    "shippingFee": 0,
    "shippingFeeYuan": "0.00",
    "discountAmount": 0,
    "discountAmountYuan": "0.00",
    "totalAmount": 200,
    "totalAmountYuan": "2.00",
    "paidAmount": 0,
    "paidAmountYuan": "0.00",
    "paymentStatus": "UNPAID",
    "shippingAddress": {},
    "buyerMessage": "string",
    "isRated": false,
    "source": "miniprogram",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 2. 发起支付
**接口地址**: `POST /api/orders/:orderNo/payment`

**请求头**: `Authorization: Bearer <token>`

**路径参数**:
- `orderNo`: 订单号

**响应数据**:
```json
{
  "code": 0,
  "message": "发起支付成功",
  "data": {
    "prepayId": "string",    // 预支付交易会话标识
    "paySign": "string",     // 支付签名
    "timeStamp": "string",   // 时间戳
    "nonceStr": "string",    // 随机字符串
    "signType": "MD5",       // 签名类型
    "package": "string"      // 扩展字段
  }
}
```

### 3. 获取订单详情
**接口地址**: `GET /api/orders/:orderNo`

**请求头**: `Authorization: Bearer <token>`

**路径参数**:
- `orderNo`: 订单号

**响应数据**:
```json
{
  "code": 0,
  "message": "获取订单详情成功",
  "data": {
    "orderNo": "string",
    "orderType": "PRODUCT",
    "status": "PAID",
    "statusText": "已支付",
    "openid": "string",
    "platformId": "string",
    "items": [
      {
        "productId": "string",
        "productName": "string",
        "productImage": "string",
        "unitPrice": 100,
        "unitPriceYuan": "1.00",
        "quantity": 2,
        "totalPrice": 200,
        "totalPriceYuan": "2.00",
        "attributes": {
          "color": "红色",
          "size": "L"
        }
      }
    ],
    "itemCount": 2,
    "subtotal": 200,
    "subtotalYuan": "2.00",
    "shippingFee": 0,
    "shippingFeeYuan": "0.00",
    "discountAmount": 0,
    "discountAmountYuan": "0.00",
    "totalAmount": 200,
    "totalAmountYuan": "2.00",
    "paidAmount": 200,
    "paidAmountYuan": "2.00",
    "paymentMethod": "WECHAT",
    "paymentStatus": "PAID",
    "paymentTime": "string",
    "paymentId": "string",
    "shippingAddress": {
      "receiverName": "张三",
      "receiverPhone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "address": "科技园南区"
    },
    "logistics": {
      "company": "顺丰快递",
      "trackingNumber": "SF123456789",
      "status": "SHIPPED",
      "lastUpdate": "string",
      "tracks": [
        {
          "time": "string",
          "status": "SHIPPED",
          "description": "商品已发货"
        }
      ]
    },
    "shippingTime": "string",
    "deliveryTime": "string",
    "buyerMessage": "string",
    "sellerMessage": "string",
    "isRated": false,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 4. 获取用户订单列表
**接口地址**: `GET /api/orders/:platformId/list`

**请求头**: `Authorization: Bearer <token>`

**路径参数**:
- `platformId`: 平台ID

**查询参数**:
- `status`: 订单状态过滤（PENDING、PAID、SHIPPED、DELIVERED、CANCELLED、REFUNDED、COMPLETED）
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20）

**响应数据**:
```json
{
  "code": 0,
  "message": "获取订单列表成功",
  "data": {
    "orders": [
      {
        "orderNo": "string",
        "status": "PAID",
        "statusText": "已支付",
        "items": [],
        "totalAmount": 200,
        "totalAmountYuan": "2.00",
        "paymentMethod": "WECHAT",
        "createdAt": "string"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20
  }
}
```

### 5. 取消订单
**接口地址**: `POST /api/orders/:orderNo/cancel`

**请求头**: `Authorization: Bearer <token>`

**路径参数**:
- `orderNo`: 订单号

**请求参数**:
```json
{
  "reason": "string"  // 可选，取消原因
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "取消订单成功",
  "data": null
}
```

### 6. 确认收货
**接口地址**: `POST /api/orders/:orderNo/confirm-delivery`

**请求头**: `Authorization: Bearer <token>`

**路径参数**:
- `orderNo`: 订单号

**响应数据**:
```json
{
  "code": 0,
  "message": "确认收货成功",
  "data": null
}
```

### 7. 查询支付状态
**接口地址**: `GET /api/orders/:orderNo/payment-status`

**路径参数**:
- `orderNo`: 订单号

**说明**: 此接口不需要token，用于查询支付状态

**响应数据**:
```json
{
  "code": 0,
  "message": "查询支付状态成功",
  "data": {
    "status": "PAID",
    "paid": true
  }
}
```

---

## 订单管理（管理后台）

### 1. 获取订单列表
**接口地址**: `GET /api/admin/orders`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `order:read`

**查询参数**:
- `status`: 订单状态过滤
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20）
- `keyword`: 搜索关键词（订单号、商品名称）
- `startDate`: 开始时间（YYYY-MM-DD）
- `endDate`: 结束时间（YYYY-MM-DD）

**响应数据**:
```json
{
  "code": 0,
  "message": "获取订单列表成功",
  "data": {
    "orders": [
      {
        "orderNo": "string",
        "orderType": "PRODUCT",
        "status": "PAID",
        "statusText": "已支付",
        "openid": "string",
        "platformId": "string",
        "items": [
          {
            "productName": "商品名称",
            "quantity": 2,
            "unitPrice": 100,
            "unitPriceYuan": "1.00",
            "totalPrice": 200,
            "totalPriceYuan": "2.00"
          }
        ],
        "itemCount": 2,
        "totalAmount": 200,
        "totalAmountYuan": "2.00",
        "paidAmount": 200,
        "paidAmountYuan": "2.00",
        "paymentMethod": "WECHAT",
        "paymentStatus": "PAID",
        "paymentTime": "string",
        "shippingAddress": {
          "receiverName": "张三",
          "receiverPhone": "13800138000",
          "province": "广东省",
          "city": "深圳市",
          "district": "南山区",
          "address": "科技园南区"
        },
        "buyerMessage": "string",
        "sellerMessage": "string",
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

### 2. 获取订单详情（管理后台）
**接口地址**: `GET /api/admin/orders/:orderNo`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `order:read`

**路径参数**:
- `orderNo`: 订单号

**响应数据**: 同小程序端订单详情

### 3. 订单发货
**接口地址**: `POST /api/admin/orders/:orderNo/ship`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `order:update`

**路径参数**:
- `orderNo`: 订单号

**请求参数**:
```json
{
  "company": "string",        // 必填，物流公司
  "trackingNumber": "string", // 必填，运单号
  "description": "string"     // 可选，发货描述
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "发货成功",
  "data": {
    "orderNo": "string",
    "status": "SHIPPED",
    "statusText": "已发货",
    "logistics": {
      "company": "顺丰快递",
      "trackingNumber": "SF123456789",
      "status": "SHIPPED",
      "lastUpdate": "string",
      "tracks": [
        {
          "time": "string",
          "status": "SHIPPED",
          "description": "商品已发货"
        }
      ]
    },
    "shippingTime": "string"
  }
}
```

### 4. 更新订单备注
**接口地址**: `PUT /api/admin/orders/:orderNo/remark`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `order:update`

**路径参数**:
- `orderNo`: 订单号

**请求参数**:
```json
{
  "sellerMessage": "string"  // 必填，卖家备注
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "更新订单备注成功",
  "data": {
    "orderNo": "string",
    "sellerMessage": "string",
    "updatedAt": "string"
  }
}
```

## 数据字段说明

### 订单状态（OrderStatus）
- `PENDING`: 待支付
- `PAID`: 已支付
- `SHIPPED`: 已发货
- `DELIVERED`: 已收货
- `CANCELLED`: 已取消
- `REFUNDED`: 已退款
- `COMPLETED`: 已完成

### 订单类型（OrderType）
- `PRODUCT`: 商品订单
- `SERVICE`: 服务订单
- `VIRTUAL`: 虚拟商品
- `SUBSCRIPTION`: 订阅服务

### 支付方式（PaymentMethod）
- `WECHAT`: 微信支付
- `ALIPAY`: 支付宝
- `BALANCE`: 余额支付
- `OFFLINE`: 线下支付

### 支付状态
- `UNPAID`: 未支付
- `PAID`: 已支付
- `CANCELLED`: 已取消
- `REFUNDED`: 已退款
- `FAILED`: 支付失败

### 物流状态
- `PENDING`: 待发货
- `SHIPPED`: 已发货
- `IN_TRANSIT`: 运输中
- `DELIVERED`: 已送达
- `EXCEPTION`: 异常

## 业务流程说明

### 订单创建流程
1. 用户选择商品，填写收货地址
2. 调用创建订单接口，生成待支付订单
3. 调用发起支付接口，获取支付参数
4. 用户完成支付，订单状态变为已支付

### 订单发货流程
1. 管理员在后台查看已支付订单
2. 调用发货接口，填写物流信息
3. 订单状态变为已发货
4. 用户可查看物流信息

### 订单完成流程
1. 用户收到商品后，调用确认收货接口
2. 订单状态变为已收货
3. 系统可进行自动确认收货（超时）

## 权限说明

### 订单管理权限
- `order:read` - 查看订单列表和详情
- `order:update` - 订单发货、更新备注
- `order:delete` - 删除订单（如需要）

## 注意事项

1. **金额处理**: 所有金额字段在数据库中以分为单位存储，API响应同时返回分和元格式
2. **订单号生成**: 订单号格式为 `{platformId}{日期}{时间戳}{随机数}`
3. **库存管理**: 创建订单时应检查库存，支付成功后扣减库存
4. **支付回调**: 支付成功后会通过微信回调接口异步更新订单状态
5. **订单取消**: 只有待支付状态的订单可以取消
6. **确认收货**: 只有已发货状态的订单可以确认收货