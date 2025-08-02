# 系统管理接口文档

## 用户管理

### 1. 用户登录
**接口地址**: `POST /api/user/login`

**请求参数**:
```json
{
  "username": "string",  // 用户名
  "password": "string"   // 密码
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "string",     // JWT token
    "user": {
      "uuid": "string",
      "username": "string",
      "email": "string",
      "nickname": "string",
      "avatar": "string",
      "roles": ["string"],   // 角色列表
      "permissions": ["string"], // 权限列表
      "isFirstLogin": false,
      "createdAt": "string",
      "updatedAt": "string"
    }
  }
}
```

### 2. 获取用户信息
**接口地址**: `GET /api/user/info`

**请求头**: `Authorization: Bearer <token>`

**响应数据**:
```json
{
  "code": 0,
  "message": "获取用户信息成功",
  "data": {
    "uuid": "string",
    "username": "string",
    "email": "string",
    "nickname": "string",
    "avatar": "string",
    "roles": ["string"],
    "permissions": ["string"],
    "isFirstLogin": false,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 3. 获取用户列表
**接口地址**: `GET /api/users`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `user:read`

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 10）
- `keyword`: 搜索关键词（用户名、邮箱、昵称）
- `role`: 角色过滤

**响应数据**:
```json
{
  "code": 0,
  "message": "获取用户列表成功",
  "data": {
    "users": [
      {
        "uuid": "string",
        "username": "string",
        "email": "string",
        "nickname": "string",
        "avatar": "string",
        "roles": ["string"],
        "permissions": ["string"],
        "isFirstLogin": false,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### 4. 创建用户
**接口地址**: `POST /api/users`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `user:create`

**请求参数**:
```json
{
  "username": "string",    // 必填，用户名
  "password": "string",    // 必填，密码
  "email": "string",       // 必填，邮箱
  "nickname": "string",    // 可选，昵称
  "avatar": "string",      // 可选，头像URL
  "roles": ["string"]      // 可选，角色UUID列表
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "创建用户成功",
  "data": {
    "uuid": "string",
    "username": "string",
    "email": "string",
    "nickname": "string",
    "avatar": "string",
    "roles": ["string"],
    "permissions": ["string"],
    "isFirstLogin": true,
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 5. 更新用户
**接口地址**: `PUT /api/users/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `user:update`

**路径参数**:
- `uuid`: 用户UUID

**请求参数**:
```json
{
  "username": "string",    // 可选，用户名
  "email": "string",       // 可选，邮箱
  "nickname": "string",    // 可选，昵称
  "avatar": "string",      // 可选，头像URL
  "roles": ["string"]      // 可选，角色UUID列表
}
```

### 6. 删除用户
**接口地址**: `DELETE /api/users/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `user:delete`

**路径参数**:
- `uuid`: 用户UUID

**响应数据**:
```json
{
  "code": 0,
  "message": "删除用户成功",
  "data": null
}
```

### 7. 批量删除用户
**接口地址**: `POST /api/users/batch-delete`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `user:delete`

**请求参数**:
```json
{
  "uuids": ["string"]  // 用户UUID列表
}
```

### 8. 更新用户角色
**接口地址**: `PUT /api/users/:uuid/roles`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `user:update`

**请求参数**:
```json
{
  "roles": ["string"]  // 角色UUID列表
}
```

### 9. 重置用户密码
**接口地址**: `POST /api/users/:uuid/reset-password`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `user:update`

**请求参数**:
```json
{
  "newPassword": "string"  // 新密码
}
```

### 10. 修改密码
**接口地址**: `POST /api/user/change-password`

**请求头**: `Authorization: Bearer <token>`

**请求参数**:
```json
{
  "oldPassword": "string",  // 旧密码
  "newPassword": "string"   // 新密码
}
```

### 11. 首次修改密码
**接口地址**: `POST /api/user/first-time-change-password`

**请求头**: `Authorization: Bearer <token>`

**请求参数**:
```json
{
  "newPassword": "string"  // 新密码
}
```

### 12. 更新个人信息
**接口地址**: `PUT /api/user/profile`

**请求头**: `Authorization: Bearer <token>`

**请求参数**:
```json
{
  "nickname": "string",  // 可选，昵称
  "avatar": "string",    // 可选，头像URL
  "email": "string"      // 可选，邮箱
}
```

---

## 角色管理

### 1. 获取角色列表
**接口地址**: `GET /api/roles`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `role:read`

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 10）
- `keyword`: 搜索关键词（角色名称、描述）

**响应数据**:
```json
{
  "code": 0,
  "message": "获取角色列表成功",
  "data": {
    "roles": [
      {
        "uuid": "string",
        "name": "string",
        "description": "string",
        "permissions": ["string"],
        "userCount": 5,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 20,
      "pages": 2
    }
  }
}
```

### 2. 获取角色详情
**接口地址**: `GET /api/roles/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `role:read`

**路径参数**:
- `uuid`: 角色UUID

### 3. 创建角色
**接口地址**: `POST /api/roles`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `role:create`

**请求参数**:
```json
{
  "name": "string",         // 必填，角色名称
  "description": "string",  // 可选，角色描述
  "permissions": ["string"] // 可选，权限列表
}
```

### 4. 更新角色
**接口地址**: `PUT /api/roles/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `role:update`

**请求参数**:
```json
{
  "name": "string",         // 可选，角色名称
  "description": "string",  // 可选，角色描述
  "permissions": ["string"] // 可选，权限列表
}
```

### 5. 删除角色
**接口地址**: `DELETE /api/roles/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `role:delete`

### 6. 批量删除角色
**接口地址**: `POST /api/roles/batch-delete`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `role:delete`

**请求参数**:
```json
{
  "uuids": ["string"]  // 角色UUID列表
}
```

### 7. 获取角色菜单权限
**接口地址**: `GET /api/roles/:uuid/menus`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `role:read`

**响应数据**:
```json
{
  "code": 0,
  "message": "获取角色菜单权限成功",
  "data": {
    "menuIds": ["string"],  // 菜单UUID列表
    "menuTree": [
      {
        "uuid": "string",
        "name": "string",
        "path": "string",
        "children": []
      }
    ]
  }
}
```

### 8. 更新角色菜单权限
**接口地址**: `PUT /api/roles/:uuid/menus`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `role:update`

**请求参数**:
```json
{
  "menuIds": ["string"]  // 菜单UUID列表
}
```

---

## 菜单管理

### 1. 获取菜单列表
**接口地址**: `GET /api/menus`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `menu:read`

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 50）
- `keyword`: 搜索关键词
- `parentId`: 父级菜单UUID

**响应数据**:
```json
{
  "code": 0,
  "message": "获取菜单列表成功",
  "data": {
    "menus": [
      {
        "uuid": "string",
        "name": "string",
        "path": "string",
        "icon": "string",
        "component": "string",
        "parentId": "string",
        "sort": 0,
        "permissions": ["string"],
        "isVisible": true,
        "children": [],
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 30,
      "pages": 1
    }
  }
}
```

### 2. 获取菜单树
**接口地址**: `GET /api/menus/tree`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `menu:read`

**响应数据**:
```json
{
  "code": 0,
  "message": "获取菜单树成功",
  "data": [
    {
      "uuid": "string",
      "name": "string",
      "path": "string",
      "icon": "string",
      "component": "string",
      "parentId": null,
      "sort": 0,
      "permissions": ["string"],
      "isVisible": true,
      "children": [
        {
          "uuid": "string",
          "name": "string",
          "path": "string",
          "icon": "string",
          "component": "string",
          "parentId": "string",
          "sort": 1,
          "permissions": ["string"],
          "isVisible": true,
          "children": []
        }
      ]
    }
  ]
}
```

### 3. 获取菜单详情
**接口地址**: `GET /api/menus/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `menu:read`

### 4. 创建菜单
**接口地址**: `POST /api/menus`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `menu:create`

**请求参数**:
```json
{
  "name": "string",         // 必填，菜单名称
  "path": "string",         // 必填，路由路径
  "icon": "string",         // 可选，图标
  "component": "string",    // 可选，组件路径
  "parentId": "string",     // 可选，父级菜单UUID
  "sort": 0,                // 可选，排序
  "permissions": ["string"], // 可选，所需权限
  "isVisible": true         // 可选，是否可见
}
```

### 5. 更新菜单
**接口地址**: `PUT /api/menus/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `menu:update`

**请求参数**: 同创建菜单

### 6. 删除菜单
**接口地址**: `DELETE /api/menus/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `menu:delete`

### 7. 批量删除菜单
**接口地址**: `POST /api/menus/batch-delete`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `menu:delete`

**请求参数**:
```json
{
  "uuids": ["string"]  // 菜单UUID列表
}
```

## 权限说明

### 用户管理权限
- `user:create` - 创建用户
- `user:read` - 查看用户列表和详情
- `user:update` - 更新用户信息、角色、重置密码
- `user:delete` - 删除用户

### 角色管理权限
- `role:create` - 创建角色
- `role:read` - 查看角色列表和详情
- `role:update` - 更新角色信息和权限
- `role:delete` - 删除角色

### 菜单管理权限
- `menu:create` - 创建菜单
- `menu:read` - 查看菜单列表和树形结构
- `menu:update` - 更新菜单信息
- `menu:delete` - 删除菜单

### 超级权限
- `*` - 超级管理员权限，拥有所有权限