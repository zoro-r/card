# 微信小程序生态系统开发指南

## 项目简介

本项目是一个完整的微信小程序商城生态系统，包含用户管理、支付系统、订单管理等核心功能。基于 Koa + TypeScript + MongoDB 构建后端服务，提供 React + Ant Design 管理后台。

## 技术栈

### 后端技术栈
- **框架**: Koa.js
- **语言**: TypeScript
- **数据库**: MongoDB + Mongoose
- **认证**: JWT
- **支付**: 微信支付 API
- **加密**: crypto-js
- **文档解析**: xml2js

### 前端技术栈
- **框架**: React
- **UI组件**: Ant Design
- **路由**: React Router
- **状态管理**: Context API
- **HTTP客户端**: Axios
- **构建工具**: UmiJS

## 项目结构

```
card/
├── packages/
│   ├── server/                 # 后端服务
│   │   ├── src/
│   │   │   ├── controller/     # 控制器层
│   │   │   │   ├── wechat.ts   # 微信相关控制器
│   │   │   │   └── order.ts    # 订单相关控制器
│   │   │   ├── service/        # 业务逻辑层
│   │   │   │   ├── wechat.ts   # 微信服务
│   │   │   │   ├── wechatPayment.ts # 微信支付服务
│   │   │   │   └── order.ts    # 订单服务
│   │   │   ├── models/         # 数据模型层
│   │   │   │   ├── wechatUser.ts     # 微信用户模型
│   │   │   │   ├── wechatConfig.ts   # 微信配置模型
│   │   │   │   ├── wechatPayment.ts  # 微信支付模型
│   │   │   │   └── order.ts          # 订单模型
│   │   │   ├── routers/        # 路由层
│   │   │   ├── middleware/     # 中间件
│   │   │   └── utils/          # 工具函数
│   │   └── package.json
│   └── client/                 # 前端管理后台
│       ├── src/
│       │   ├── pages/          # 页面组件
│       │   │   ├── system/     # 系统管理
│       │   │   │   ├── wechat-users/    # 微信用户管理
│       │   │   │   ├── orders/          # 订单管理
│       │   │   │   └── wechat-payments/ # 支付管理
│       │   │   └── auth/       # 认证相关
│       │   ├── services/       # API服务
│       │   └── config/         # 配置文件
│       └── package.json
└── docs/                       # 项目文档
    ├── wechat-miniprogram-api.md    # API文档
    └── development-guide.md         # 开发指南
```

## 核心功能模块

### 1. 微信用户管理
- 小程序用户登录认证
- 用户信息解密存储
- 手机号获取和绑定
- 用户状态管理
- 登录统计分析

### 2. 微信支付系统
- 统一下单接口
- 小程序支付参数生成
- 支付回调处理
- 签名验证机制
- 支付状态查询
- 退款申请处理

### 3. 订单管理系统  
- 订单创建和管理
- 商品信息管理
- 收货地址管理
- 物流信息追踪
- 订单状态流转
- 支付集成

### 4. 管理后台
- 用户列表查看
- 用户状态控制
- 订单列表管理
- 订单发货处理
- 数据统计报表
- 支付记录查询

## 快速开始

### 环境要求
- Node.js >= 16.0.0
- MongoDB >= 4.4
- pnpm >= 8.0.0

### 安装依赖

```bash
# 安装根目录依赖
pnpm install

# 安装后端依赖
cd packages/server
pnpm install

# 安装前端依赖
cd packages/client
pnpm install
```

### 环境配置

#### 后端环境变量 (.env)

```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/card_wechat

# JWT配置
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRES_IN=30d

# 加密配置
ENCRYPT_KEY=your-32-character-encrypt-key-here

# API配置
API_BASE_URL=https://your-domain.com
PORT=3001

# 微信配置（可选，也可在管理后台配置）
WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret
WECHAT_MCH_ID=your-wechat-mch-id
WECHAT_MCH_KEY=your-wechat-mch-key
```

#### 前端环境变量 (.env)

```env
# API接口地址
REACT_APP_API_BASE_URL=http://localhost:3001
```

### 启动项目

```bash
# 启动后端服务
cd packages/server
pnpm dev

# 启动前端管理后台
cd packages/client
pnpm dev
```

## 开发指南

### 数据库初始化

项目启动时会自动创建必要的索引。如需初始化测试数据：

```bash
cd packages/server
pnpm run init-data
```

### 微信支付配置

1. 在微信商户平台配置支付回调地址：
   ```
   https://your-domain.com/api/wechat/{platformId}/payment/notify
   ```

2. 在管理后台添加微信配置：
   - 登录管理后台
   - 进入"系统管理" > "微信配置"
   - 添加小程序配置信息

### API接口测试

使用 Postman 或其他 API 测试工具测试接口：

1. 导入 API 文档中的接口定义
2. 配置环境变量
3. 先调用登录接口获取 Token
4. 在其他接口中添加 Authorization 头

### 前端页面开发

前端页面基于 Ant Design 组件库开发：

```typescript
// 示例：用户列表页面
import React from 'react';
import { Table, Button, Space } from 'antd';

const WechatUserList: React.FC = () => {
  // 组件逻辑
  return (
    <div>
      <Table
        columns={columns}
        dataSource={users}
        pagination={{
          current: page,
          pageSize: limit,
          total: total
        }}
      />
    </div>
  );
};
```

## 部署指南

### 后端部署

1. **构建项目**:
   ```bash
   cd packages/server
   pnpm build
   ```

2. **PM2 部署**:
   ```bash
   pm2 start dist/app.js --name card-server
   ```

3. **Docker 部署**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY . .
   RUN pnpm install --production
   RUN pnpm build
   CMD ["node", "dist/app.js"]
   ```

### 前端部署

1. **构建项目**:
   ```bash
   cd packages/client
   pnpm build
   ```

2. **Nginx 配置**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:3001;
       }
   }
   ```

## 安全考虑

### 1. 数据安全
- 微信 sessionKey 加密存储
- 敏感配置信息环境变量管理
- 数据库访问权限控制

### 2. 接口安全
- JWT Token 认证
- 微信支付签名验证
- HTTPS 传输加密
- 请求频率限制

### 3. 业务安全
- 订单金额验证
- 支付状态同步
- 重复支付防护
- 异常订单监控

## 监控和日志

### 日志管理
```typescript
// 统一日志格式
console.log(`[${new Date().toISOString()}] ${level}: ${message}`);
```

### 错误监控
- 支付异常监控
- 订单状态异常
- 用户登录异常
- 接口调用异常

## 常见问题

### Q1: 微信支付回调签名验证失败
**A**: 检查商户密钥配置是否正确，确保签名算法实现无误。

### Q2: 用户登录后 Token 无效
**A**: 检查 JWT_SECRET 配置，确保前后端环境一致。

### Q3: 订单创建后支付失败
**A**: 检查微信支付配置，确保 appId、mchId 等参数正确。

### Q4: 前端页面路由跳转异常
**A**: 检查路由配置和权限验证逻辑。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码变更
4. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。