# 用户中台管理系统

一个基于 React + Koa + MongoDB 的用户中台管理系统，包含用户管理、角色管理、菜单管理等功能。

## 技术栈

### 前端
- React 18
- TypeScript
- Umi 4
- Ant Design 5
- Ant Design Pro Components

### 后端
- Node.js
- Koa 3
- TypeScript
- MongoDB
- Mongoose
- JWT 认证

### 工具链
- pnpm (包管理器)
- turbo (monorepo 构建工具)

## 功能特性

- 🔐 **用户认证**: JWT token 认证，安全登录
- 👥 **用户管理**: 用户 CRUD 操作，支持批量操作
- 🎭 **角色管理**: 角色权限管理，支持细粒度权限控制
- 📋 **菜单管理**: 动态菜单配置，支持树形结构
- 🔒 **权限控制**: 基于 RBAC 的权限验证
- 📊 **仪表盘**: 系统概览和数据统计
- 📱 **响应式设计**: 适配不同设备尺寸

## 快速开始

### 环境要求

- Node.js >= 16
- MongoDB >= 4.4
- pnpm >= 8

### 安装依赖

```bash
# 克隆项目
git clone <repository-url>
cd center

# 安装依赖
pnpm install
```

### 启动服务

1. **启动 MongoDB**
   ```bash
   # 确保 MongoDB 服务正在运行
   mongod
   ```

2. **初始化数据**
   ```bash
   cd packages/server
   pnpm run init-data
   ```

3. **启动后端服务**
   ```bash
   cd packages/server
   pnpm run dev
   ```

4. **启动前端应用**
   ```bash
   cd packages/client
   pnpm run dev
   ```

### 访问系统

- 前端地址: http://localhost:8000
- 后端地址: http://localhost:3000

## 默认账号

系统初始化后会创建以下默认账号：

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 超级管理员 | super | super123 | 所有权限 |
| 系统管理员 | admin | admin123 | 系统管理权限 |
| 普通用户 | test | test123 | 基本权限 |

## 项目结构

```
center/
├── packages/
│   ├── client/          # 前端应用
│   │   ├── src/
│   │   │   ├── components/  # 公共组件
│   │   │   ├── pages/      # 页面组件
│   │   │   ├── hooks/      # 自定义 hooks
│   │   │   ├── utils/      # 工具函数
│   │   │   └── layouts/    # 布局组件
│   │   └── package.json
│   └── server/          # 后端服务
│       ├── src/
│       │   ├── models/     # 数据模型
│       │   ├── routers/    # 路由
│       │   ├── controller/ # 控制器
│       │   ├── service/    # 业务逻辑
│       │   ├── middleware/ # 中间件
│       │   ├── config/     # 配置
│       │   └── scripts/    # 脚本
│       └── package.json
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 数据库设计

### 用户表 (AdminUser)
- 用户基本信息
- 登录凭据
- 状态管理
- 平台关联

### 角色表 (Role)
- 角色信息
- 权限列表
- 状态管理

### 菜单表 (Menu)
- 菜单结构
- 权限标识
- 树形关联

### 用户角色关联表 (UserRole)
- 用户与角色的多对多关系

## API 接口

### 认证接口
- `POST /api/user/login` - 用户登录
- `GET /api/user/info` - 获取用户信息

### 用户管理
- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建用户
- `PUT /api/users/:uuid` - 更新用户
- `DELETE /api/users/:uuid` - 删除用户
- `POST /api/users/batch-delete` - 批量删除用户

### 角色管理
- `GET /api/roles` - 获取角色列表
- `POST /api/roles` - 创建角色
- `PUT /api/roles/:uuid` - 更新角色
- `DELETE /api/roles/:uuid` - 删除角色
- `POST /api/roles/batch-delete` - 批量删除角色

### 菜单管理
- `GET /api/menus` - 获取菜单列表
- `GET /api/menus/tree` - 获取菜单树
- `POST /api/menus` - 创建菜单
- `PUT /api/menus/:uuid` - 更新菜单
- `DELETE /api/menus/:uuid` - 删除菜单
- `POST /api/menus/batch-delete` - 批量删除菜单

## 权限系统

系统采用 RBAC (Role-Based Access Control) 权限模型：

### 权限类型
- **菜单权限**: 控制页面访问
- **操作权限**: 控制按钮和操作
- **数据权限**: 控制数据访问范围

### 权限标识
- `user:read` - 用户查看
- `user:create` - 用户创建
- `user:update` - 用户更新
- `user:delete` - 用户删除
- `role:*` - 角色相关权限
- `menu:*` - 菜单相关权限
- `*` - 超级管理员权限

### 权限验证
- 后端: JWT 中间件 + 权限验证中间件
- 前端: 路由守卫 + 组件级权限控制

## 开发指南

### 添加新页面
1. 在 `packages/client/src/pages/` 下创建页面组件
2. 在菜单管理中添加对应菜单项
3. 配置相应的权限标识

### 添加新接口
1. 在 `packages/server/src/models/` 下定义数据模型
2. 在 `packages/server/src/service/` 下实现业务逻辑
3. 在 `packages/server/src/controller/` 下创建控制器
4. 在 `packages/server/src/routers/` 下配置路由

### 权限配置
1. 在角色管理中配置权限列表
2. 在前端使用 `usePermission` hook 进行权限判断
3. 在后端使用 `requirePermission` 中间件进行权限验证

## 部署

### 生产环境配置

1. **环境变量配置**
   ```bash
   # 在 packages/server 目录下创建 .env 文件
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=your-secret-key
   MONGODB_URI=mongodb://localhost:27017/center
   ```

2. **构建项目**
   ```bash
   # 构建前端
   cd packages/client
   pnpm run build
   
   # 构建后端
   cd packages/server
   pnpm run build
   ```

3. **启动服务**
   ```bash
   # 启动后端
   cd packages/server
   pnpm run serve
   ```

### Docker 部署

```dockerfile
# 示例 Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "serve"]
```

## 常用命令

```bash
# 安装依赖
pnpm install

# 启动开发服务
pnpm run dev

# 构建项目
pnpm run build

# 初始化数据
cd packages/server && pnpm run init-data

# 重置管理员密码
cd packages/server && pnpm run reset-admin [用户名] [新密码]

# 查看重置密码帮助
cd packages/server && pnpm run reset-admin --help
```

## 故障排除

### 常见问题

1. **MongoDB 连接失败**
   - 检查 MongoDB 服务是否启动
   - 确认连接字符串是否正确

2. **登录失败**
   - 检查用户名和密码是否正确
   - 确认用户状态是否为 active

3. **权限不足**
   - 检查用户角色配置
   - 确认角色权限设置

4. **页面访问受限**
   - 检查菜单权限配置
   - 确认路由守卫设置

### 日志查看

```bash
# 查看后端日志
cd packages/server
pnpm run dev

# 查看前端日志
cd packages/client
pnpm run dev
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

[MIT License](LICENSE)

## 支持

如果您在使用过程中遇到问题，请：

1. 查看本文档的故障排除部分
2. 提交 Issue 描述问题
3. 联系维护者获取帮助

---

**注意**: 在生产环境使用前，请务必修改默认密码和JWT密钥，并进行充分的安全测试。