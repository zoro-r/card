# 文件管理系统 API 文档

## 概述

这是一个完整的文件管理系统，支持文件上传、下载、删除、预览等功能，具有以下特性：

- 支持多文件上传和批量操作
- 按日期目录结构存储文件（yyyy/mm/dd）
- 完整的用户权限控制和多租户支持
- 文件元信息存储在 MongoDB 中
- 支持文件预览和缩略图
- 支持批量下载（ZIP 打包）
- 提供文件统计和搜索功能

## 技术架构

- **后端框架**: Koa.js + TypeScript
- **数据库**: MongoDB + Mongoose
- **文件上传**: Multer
- **文件压缩**: Archiver (ZIP)
- **认证**: JWT Token

## 安装和配置

### 1. 安装依赖

```bash
cd packages/server
pnpm install
```

### 2. 环境配置

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

配置内容：
```env
# MongoDB数据库配置
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
MONGODB_DATABASE=card_system

# JWT密钥配置
JWT_SECRET=your_super_secret_jwt_key_here

# 文件上传配置
UPLOAD_ROOT_DIR=./uploads
MAX_FILE_SIZE=104857600  # 100MB

# 服务器端口配置
PORT=3000
```

### 3. 启动服务

```bash
pnpm dev
```

## API 接口文档

### 认证说明

除了公开接口外，所有接口都需要在请求头中携带 JWT Token：

```
Authorization: Bearer <your_jwt_token>
```

### 1. 文件上传

#### 上传单个文件
- **接口**: `POST /api/files/upload`
- **Content-Type**: `multipart/form-data`
- **参数**:
  - `file` (文件): 要上传的文件
  - `tags` (可选): 文件标签，多个标签用逗号分隔
  - `description` (可选): 文件描述
  - `isPublic` (可选): 是否公开，true/false

**请求示例**:
```bash
curl -X POST \\
  -H "Authorization: Bearer <token>" \\
  -F "file=@/path/to/file.jpg" \\
  -F "tags=图片,头像" \\
  -F "description=用户头像" \\
  -F "isPublic=false" \\
  http://localhost:3000/api/files/upload
```

**响应示例**:
```json
{
  "success": true,
  "message": "文件上传成功",
  "data": {
    "uuid": "file-uuid-here",
    "originalName": "avatar.jpg",
    "fileSize": 1024000,
    "fileType": "image/jpeg",
    "uploadDate": "2024-01-01T00:00:00.000Z",
    "fileUrl": "/api/files/download/file-uuid-here",
    "thumbnailUrl": "/api/files/thumbnail/file-uuid-here"
  }
}
```

#### 批量上传文件
- **接口**: `POST /api/files/upload-multiple`
- **Content-Type**: `multipart/form-data`
- **参数**:
  - `files` (文件数组): 要上传的文件列表
  - 其他参数同单文件上传

### 2. 文件查询

#### 获取文件列表
- **接口**: `GET /api/files/list`
- **参数**:
  - `page` (可选): 页码，默认1
  - `pageSize` (可选): 每页数量，默认20
  - `fileType` (可选): 文件类型过滤
  - `tags` (可选): 标签过滤，多个标签用逗号分隔
  - `keyword` (可选): 关键词搜索
  - `startDate` (可选): 开始日期
  - `endDate` (可选): 结束日期
  - `showAll` (可选): 是否显示所有用户文件，默认false

**请求示例**:
```bash
curl -H "Authorization: Bearer <token>" \\
  "http://localhost:3000/api/files/list?page=1&pageSize=10&fileType=image&keyword=头像"
```

#### 获取文件详情
- **接口**: `GET /api/files/:uuid`

#### 获取文件统计
- **接口**: `GET /api/files/statistics`
- **返回**: 文件总数、总大小、类型分布、上传趋势等

### 3. 文件下载

#### 下载文件
- **接口**: `GET /api/files/download/:uuid`
- **说明**: 下载指定文件，自动设置正确的文件名和MIME类型

#### 预览文件
- **接口**: `GET /api/files/preview/:uuid`
- **说明**: 在线预览文件，适用于图片、PDF等

#### 批量下载（ZIP）
- **接口**: `POST /api/files/download-multiple`
- **参数**:
  - `uuids` (数组): 要下载的文件UUID列表

**请求示例**:
```bash
curl -X POST \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"uuids":["uuid1","uuid2","uuid3"]}' \\
  http://localhost:3000/api/files/download-multiple
```

### 4. 文件删除

#### 删除单个文件
- **接口**: `DELETE /api/files/:uuid`

#### 批量删除文件
- **接口**: `DELETE /api/files/batch`
- **参数**:
  - `uuids` (数组): 要删除的文件UUID列表

### 5. 公开访问接口

#### 公开文件预览
- **接口**: `GET /api/files/public/preview/:uuid`
- **说明**: 预览标记为公开的文件，无需认证

#### 公开文件下载
- **接口**: `GET /api/files/public/download/:uuid`
- **说明**: 下载标记为公开的文件，无需认证

## 文件存储结构

文件按日期目录结构存储：

```
uploads/
├── 2024/
│   ├── 01/
│   │   ├── 01/
│   │   │   ├── image_1704067200000_abc123.jpg
│   │   │   └── document_1704067300000_def456.pdf
│   │   └── 02/
│   └── 02/
└── temp/  # 临时文件目录
```

## 支持的文件类型

- **图片**: JPEG, PNG, GIF, WebP, SVG
- **文档**: PDF, Word (.doc, .docx)
- **表格**: Excel (.xls, .xlsx)
- **文本**: TXT, CSV, JSON
- **压缩包**: ZIP, RAR

## 权限控制

- 用户只能管理自己上传的文件
- 支持多平台（platformId）隔离
- 公开文件可以无认证访问
- 管理员可以查看所有文件（通过showAll参数）

## 错误代码

- `400`: 请求参数错误
- `401`: 未认证或token无效
- `403`: 无权限访问
- `404`: 文件不存在
- `413`: 文件过大
- `415`: 不支持的文件类型
- `500`: 服务器内部错误

## 使用示例

### JavaScript/TypeScript 客户端示例

```typescript
class FileManager {
  constructor(private baseUrl: string, private token: string) {}

  // 上传文件
  async uploadFile(file: File, options?: {
    tags?: string[];
    description?: string;
    isPublic?: boolean;
  }) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.tags) {
      formData.append('tags', options.tags.join(','));
    }
    if (options?.description) {
      formData.append('description', options.description);
    }
    if (options?.isPublic !== undefined) {
      formData.append('isPublic', options.isPublic.toString());
    }

    const response = await fetch(\`\${this.baseUrl}/api/files/upload\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.token}\`
      },
      body: formData
    });

    return response.json();
  }

  // 获取文件列表
  async getFileList(params?: {
    page?: number;
    pageSize?: number;
    keyword?: string;
  }) {
    const query = new URLSearchParams(params as any).toString();
    const response = await fetch(\`\${this.baseUrl}/api/files/list?\${query}\`, {
      headers: {
        'Authorization': \`Bearer \${this.token}\`
      }
    });

    return response.json();
  }

  // 下载文件
  downloadFile(uuid: string) {
    window.open(\`\${this.baseUrl}/api/files/download/\${uuid}\`);
  }
}

// 使用示例
const fileManager = new FileManager('http://localhost:3000', 'your-jwt-token');

// 上传文件
const result = await fileManager.uploadFile(file, {
  tags: ['头像', '图片'],
  description: '用户头像图片',
  isPublic: false
});

// 获取文件列表
const fileList = await fileManager.getFileList({
  page: 1,
  pageSize: 10,
  keyword: '头像'
});
```

## 注意事项

1. 文件上传有大小限制，默认100MB
2. 删除文件为软删除，实际文件仍保留在磁盘上
3. 建议定期清理软删除的文件以释放磁盘空间
4. 公开文件需要谨慎设置，避免敏感信息泄露
5. 建议为上传目录配置适当的磁盘空间监控