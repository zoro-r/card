# API 接口文档

本文档详细描述了 WeChat Mini-Program User Management Platform（用户中台管理系统）的所有接口信息。

## 文档目录

### 1. [系统管理接口](./system-management.md)
- 用户管理：管理员账户的增删改查
- 角色管理：角色权限的配置和管理
- 菜单管理：系统菜单的层级管理

### 2. [微信管理接口](./wechat-management.md)
- 微信用户管理：小程序用户信息管理
- 微信账户配置：应用配置和支付配置
- 微信支付管理：支付记录和交易管理

### 3. [订单管理接口](./order-management.md)
- 订单操作：创建、查询、取消订单
- 支付处理：发起支付、查询支付状态
- 订单管理：发货、收货确认、备注更新

### 4. [文件管理接口](./file-management.md)
- 文件上传：支持多种文件类型上传
- 文件管理：文件信息查询和删除

## 接口认证

### JWT Token 认证
大部分接口需要在请求头中携带 JWT Token：

```
Authorization: Bearer <your-jwt-token>
```

### Token 类型
- **admin**: 管理员用户token，用于后台管理操作
- **wechat**: 微信用户token，用于小程序端操作

## 通用响应格式

### 成功响应
```json
{
  "code": 0,
  "message": "操作成功",
  "data": { /* 具体数据 */ }
}
```

### 错误响应
```json
{
  "code": 1,
  "message": "错误信息描述",
  "data": null
}
```

## 通用错误码

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 401 | 未授权访问 | Token无效或已过期 |
| 403 | 权限不足 | 缺少相应的操作权限 |
| 404 | 资源不存在 | 请求的资源未找到 |
| 422 | 参数验证失败 | 请求参数格式或内容错误 |
| 500 | 服务器内部错误 | 系统异常 |

## 权限系统

系统采用基于角色的权限控制（RBAC），权限格式为 `resource:action`：

- `user:create` - 创建用户权限
- `user:read` - 查看用户权限  
- `user:update` - 更新用户权限
- `user:delete` - 删除用户权限
- `role:*` - 角色管理全部权限
- `*` - 超级管理员权限（所有权限）

## 数据字段说明

### 金额字段
- 所有金额字段在数据库中以**分**为单位存储
- API 响应会同时返回分（如 `totalAmount`）和元（如 `totalAmountYuan`）格式
- 前端显示建议使用元格式（`totalAmountYuan`）

### 时间字段
- 所有时间字段使用 ISO 8601 格式：`YYYY-MM-DDTHH:mm:ss.sssZ`
- 创建时间：`createdAt`
- 更新时间：`updatedAt`

### 平台标识
- `platformId`: 用于多租户数据隔离，默认值为 `root`
- 可通过环境变量 `DEFAULT_PLATFORM_ID` 配置默认值

## 接口环境

### 开发环境
- 基础URL: `http://localhost:3000`
- 数据库: MongoDB 本地实例

### 生产环境
- 基础URL: 根据实际部署配置
- 数据库: MongoDB 生产实例

## 微信接口特殊说明

### 平台路由
微信相关接口支持平台级路由：
```
/api/wechat/{platformId}/users
/api/wechat/{platformId}/payments
```

### 签名验证
微信支付相关接口包含签名验证机制，确保数据安全性。

### 数据加密
敏感数据（如微信 session_key、支付密钥）在数据库中加密存储。