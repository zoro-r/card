# 项目部署说明

本项目支持完整的前后端一体化部署，server端可以直接服务前端静态文件。

## 项目结构

```
card/
├── packages/
│   ├── client/          # 前端项目 (React + UmiJS)
│   │   ├── dist/        # 前端构建产物
│   │   └── package.json
│   └── server/          # 后端项目 (Koa + TypeScript)
│       ├── dist/        # 后端构建产物
│       └── package.json
├── package.json         # 根目录配置
└── turbo.json          # Turbo配置
```

## 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发环境 (前后端同时启动)
npm run dev
```

## 生产环境部署

### 方式一：使用根目录脚本 (推荐)

```bash
# 构建前后端项目
npm run build

# 启动生产服务器
npm run start

# 或者一键部署
npm run deploy
```

### 方式二：分步执行

```bash
# 1. 构建前端
npm run build:client

# 2. 构建后端
npm run build:server

# 3. 启动服务器
npm run start
```

## 可用的脚本命令

在根目录下：

- `npm run dev` - 启动开发环境
- `npm run build` - 构建前后端项目
- `npm run build:client` - 仅构建前端
- `npm run build:server` - 仅构建后端
- `npm run start` - 启动生产服务器
- `npm run deploy` - 一键构建并部署

## 部署架构

生产环境下，server端会：

1. **API服务**: 在 `/api/*` 路径下提供后端API服务
2. **静态文件服务**: 服务前端构建后的静态文件
3. **SPA路由支持**: 对于非API请求，返回`index.html`让前端路由处理

### 路由规则

- `/api/*` - 后端API接口
- `/*` - 前端静态文件或SPA路由

### 端口配置

默认端口：3000 (可通过环境变量 `PORT` 配置)

## 环境变量

确保设置以下环境变量：

```bash
# 数据库连接
MONGODB_URI=mongodb://localhost:27017/your-database

# JWT密钥
JWT_SECRET=your-jwt-secret-key

# 加密密钥
ENCRYPT_KEY=your-encrypt-key-32-characters

# 端口
PORT=3000
```

## 注意事项

1. **构建顺序**: 必须先构建前端，再启动服务器
2. **静态文件路径**: server会自动查找 `../client/dist` 目录
3. **错误处理**: 如果前端构建文件不存在，会显示友好的错误信息
4. **生产优化**: 静态文件会被缓存，适合生产环境使用

## 故障排除

### 前端页面无法访问

检查以下项目：

1. 确认前端已构建：`ls packages/client/dist`
2. 确认index.html存在：`ls packages/client/dist/index.html`
3. 重新构建前端：`npm run build:client`

### API接口无法访问

检查以下项目：

1. 确认后端已构建：`ls packages/server/dist`
2. 确认数据库连接正常
3. 检查环境变量配置
4. 查看服务器日志

### 开发与生产不一致

开发环境前后端分离运行，生产环境由server统一服务，确保：

1. 前端API请求路径为相对路径（如`/api/users`）
2. 避免硬编码localhost地址
3. 正确配置跨域设置