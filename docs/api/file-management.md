# 文件管理接口文档

## 文件上传

### 1. 上传单个文件
**接口地址**: `POST /api/files/upload`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: 需要登录认证

**请求格式**: `multipart/form-data`

**请求参数**:
- `file`: 文件（必填，表单字段名）

**文件限制**:
- 最大文件大小: 100MB
- 支持的文件类型:
  - 图片: JPEG, PNG, GIF, WebP, SVG
  - 文档: PDF, Word (.doc/.docx), Excel (.xls/.xlsx)
  - 文本: TXT, CSV, JSON
  - 压缩包: ZIP, RAR

**响应数据**:
```json
{
  "code": 0,
  "message": "文件上传成功",
  "data": {
    "uuid": "string",
    "originalName": "example.jpg",
    "fileName": "string",
    "fileType": "image/jpeg",
    "fileSize": 102400,
    "fileSizeFormatted": "100.0 KB",
    "isPublic": false,
    "uploadDate": "2023/12/01",
    "uploadTime": "12:00:00",
    "platformId": "root",
    "uploadedBy": "string",
    "filePath": "/uploads/2023/12/01/filename.jpg",
    "previewUrl": "/api/files/preview/uuid",
    "downloadUrl": "/api/files/download/uuid",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 2. 批量上传文件
**接口地址**: `POST /api/files/upload-multiple`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: 需要登录认证

**请求格式**: `multipart/form-data`

**请求参数**:
- `files`: 文件数组（必填，最多10个文件）

**响应数据**:
```json
{
  "code": 0,
  "message": "批量上传成功",
  "data": {
    "successful": [
      {
        "uuid": "string",
        "originalName": "file1.jpg",
        "fileName": "string",
        "fileType": "image/jpeg",
        "fileSize": 102400,
        "fileSizeFormatted": "100.0 KB",
        "isPublic": false,
        "uploadDate": "2023/12/01",
        "uploadTime": "12:00:00",
        "platformId": "root",
        "uploadedBy": "string",
        "filePath": "/uploads/2023/12/01/filename.jpg",
        "previewUrl": "/api/files/preview/uuid",
        "downloadUrl": "/api/files/download/uuid"
      }
    ],
    "failed": [
      {
        "originalName": "file2.exe",
        "error": "不支持的文件类型"
      }
    ],
    "totalUploaded": 1,
    "totalFailed": 1
  }
}
```

---

## 文件查询

### 1. 获取文件列表
**接口地址**: `GET /api/files/list`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `file:read`

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20）
- `search`: 搜索关键词（文件名）
- `fileType`: 文件类型过滤（image、document、text等）
- `isPublic`: 权限过滤（true/false）
- `uploadedBy`: 上传者过滤
- `startDate`: 开始日期（YYYY-MM-DD）
- `endDate`: 结束日期（YYYY-MM-DD）
- `sortBy`: 排序字段（uploadTime、fileSize、originalName）
- `sortOrder`: 排序方向（asc、desc，默认: desc）

**响应数据**:
```json
{
  "code": 0,
  "message": "获取文件列表成功",
  "data": {
    "files": [
      {
        "uuid": "string",
        "originalName": "example.jpg",
        "fileName": "string",
        "fileType": "image/jpeg",
        "fileSize": 102400,
        "fileSizeFormatted": "100.0 KB",
        "isPublic": false,
        "uploadDate": "2023/12/01",
        "uploadTime": "12:00:00",
        "platformId": "root",
        "uploadedBy": "string",
        "uploaderName": "管理员",
        "filePath": "/uploads/2023/12/01/filename.jpg",
        "previewUrl": "/api/files/preview/uuid",
        "downloadUrl": "/api/files/download/uuid",
        "downloadCount": 5,
        "isDeleted": false,
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    },
    "summary": {
      "totalFiles": 100,
      "totalSize": "10.5 MB",
      "publicFiles": 30,
      "privateFiles": 70
    }
  }
}
```

### 2. 获取文件统计信息
**接口地址**: `GET /api/files/statistics`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `file:read`

**响应数据**:
```json
{
  "code": 0,
  "message": "获取统计信息成功",
  "data": {
    "overview": {
      "totalFiles": 500,
      "totalSize": "2.5 GB",
      "totalSizeBytes": 2684354560,
      "publicFiles": 150,
      "privateFiles": 350,
      "deletedFiles": 20
    },
    "typeDistribution": [
      {
        "type": "image",
        "count": 200,
        "size": "800 MB",
        "percentage": 40
      },
      {
        "type": "document",
        "count": 150,
        "size": "1.2 GB",
        "percentage": 30
      },
      {
        "type": "text",
        "count": 100,
        "size": "50 MB",
        "percentage": 20
      },
      {
        "type": "other",
        "count": 50,
        "size": "450 MB",
        "percentage": 10
      }
    ],
    "uploadTrend": {
      "daily": [
        {
          "date": "2023-12-01",
          "count": 20,
          "size": "50 MB"
        }
      ],
      "monthly": [
        {
          "month": "2023-12",
          "count": 100,
          "size": "500 MB"
        }
      ]
    },
    "topUploaders": [
      {
        "userId": "string",
        "username": "admin",
        "uploadCount": 50,
        "totalSize": "200 MB"
      }
    ]
  }
}
```

### 3. 获取文件详情
**接口地址**: `GET /api/files/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `file:read`

**路径参数**:
- `uuid`: 文件UUID

**响应数据**:
```json
{
  "code": 0,
  "message": "获取文件详情成功",
  "data": {
    "uuid": "string",
    "originalName": "example.jpg",
    "fileName": "string",
    "fileType": "image/jpeg",
    "fileSize": 102400,
    "fileSizeFormatted": "100.0 KB",
    "isPublic": false,
    "uploadDate": "2023/12/01",
    "uploadTime": "12:00:00",
    "platformId": "root",
    "uploadedBy": "string",
    "uploaderName": "管理员",
    "filePath": "/uploads/2023/12/01/filename.jpg",
    "previewUrl": "/api/files/preview/uuid",
    "downloadUrl": "/api/files/download/uuid",
    "publicPreviewUrl": "/api/files/public/preview/uuid",
    "publicDownloadUrl": "/api/files/public/download/uuid",
    "downloadCount": 5,
    "lastDownloadAt": "string",
    "isDeleted": false,
    "metadata": {
      "width": 1920,
      "height": 1080,
      "format": "JPEG",
      "colorSpace": "RGB"
    },
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

---

## 文件权限管理

### 1. 更新文件权限
**接口地址**: `PUT /api/files/:uuid/permission`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `file:update`

**路径参数**:
- `uuid`: 文件UUID

**请求参数**:
```json
{
  "isPublic": true,      // 必填，是否公开
  "reason": "string"     // 可选，操作原因
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "文件权限更新成功",
  "data": {
    "uuid": "string",
    "isPublic": true,
    "publicPreviewUrl": "/api/files/public/preview/uuid",
    "publicDownloadUrl": "/api/files/public/download/uuid",
    "updatedAt": "string"
  }
}
```

---

## 文件下载

### 1. 下载文件
**接口地址**: `GET /api/files/download/:uuid`

**权限要求**: 需要根据文件权限验证

**路径参数**:
- `uuid`: 文件UUID

**说明**: 
- 私有文件需要token认证
- 公开文件可直接访问
- 支持断点续传（Range请求）

**响应**: 直接返回文件流

### 2. 预览文件
**接口地址**: `GET /api/files/preview/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `file:read`

**路径参数**:
- `uuid`: 文件UUID

**说明**: 适用于图片、PDF等可在线预览的文件

**响应**: 直接返回文件流，Content-Disposition设置为inline

### 3. 批量下载（ZIP）
**接口地址**: `POST /api/files/download-multiple`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `file:read`

**请求参数**:
```json
{
  "fileUuids": ["string"],    // 必填，文件UUID列表
  "zipName": "download.zip"   // 可选，ZIP文件名
}
```

**响应**: 返回ZIP文件流

---

## 公开文件访问

### 1. 公开文件预览
**接口地址**: `GET /api/files/public/preview/:uuid`

**权限要求**: 无（文件必须标记为公开）

**路径参数**:
- `uuid`: 文件UUID

**说明**: 仅能访问标记为公开的文件

### 2. 公开文件下载
**接口地址**: `GET /api/files/public/download/:uuid`

**权限要求**: 无（文件必须标记为公开）

**路径参数**:
- `uuid`: 文件UUID

**说明**: 仅能访问标记为公开的文件

---

## 文件删除

### 1. 删除文件
**接口地址**: `DELETE /api/files/:uuid`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `file:delete`

**路径参数**:
- `uuid`: 文件UUID

**响应数据**:
```json
{
  "code": 0,
  "message": "文件删除成功",
  "data": {
    "uuid": "string",
    "isDeleted": true,
    "deletedAt": "string"
  }
}
```

### 2. 批量删除文件
**接口地址**: `DELETE /api/files/batch`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `file:delete`

**请求参数**:
```json
{
  "fileUuids": ["string"],   // 必填，文件UUID列表
  "reason": "string"         // 可选，删除原因
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "批量删除成功",
  "data": {
    "successful": ["uuid1", "uuid2"],
    "failed": [
      {
        "uuid": "uuid3",
        "error": "文件不存在"
      }
    ],
    "totalDeleted": 2,
    "totalFailed": 1
  }
}
```

## 文件类型说明

### 支持的文件类型
- **图片类型**: 
  - `image/jpeg` - JPEG图片
  - `image/png` - PNG图片
  - `image/gif` - GIF动图
  - `image/webp` - WebP图片
  - `image/svg+xml` - SVG矢量图

- **文档类型**:
  - `application/pdf` - PDF文档
  - `application/msword` - Word文档（.doc）
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Word文档（.docx）
  - `application/vnd.ms-excel` - Excel文档（.xls）
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` - Excel文档（.xlsx）

- **文本类型**:
  - `text/plain` - 纯文本
  - `text/csv` - CSV文件
  - `application/json` - JSON文件

- **压缩包类型**:
  - `application/zip` - ZIP压缩包
  - `application/x-rar-compressed` - RAR压缩包

## 存储结构说明

### 文件存储路径
文件按日期结构存储：
```
uploads/
├── 2023/
│   ├── 12/
│   │   ├── 01/
│   │   │   ├── filename1.jpg
│   │   │   └── filename2.pdf
│   │   └── 02/
│   └── 11/
```

### 文件命名规则
- 上传时自动生成唯一文件名
- 保留原始文件名用于下载时显示
- 文件UUID用于API访问

## 权限说明

### 文件管理权限
- `file:create` - 上传文件
- `file:read` - 查看文件列表和详情
- `file:update` - 更新文件权限
- `file:delete` - 删除文件

### 文件访问权限
- **私有文件**: 需要token认证才能访问
- **公开文件**: 任何人都可以通过公开URL访问
- **权限验证**: 用户只能访问自己上传的文件或公开文件（管理员可访问所有文件）

## 注意事项

1. **文件大小限制**: 默认最大100MB，可通过环境变量`MAX_FILE_SIZE`配置
2. **文件类型限制**: 只允许指定的安全文件类型上传
3. **中文文件名**: 系统自动处理中文文件名编码问题
4. **软删除**: 删除操作为软删除，文件实际仍存储在磁盘上
5. **断点续传**: 下载接口支持HTTP Range请求，可实现断点续传
6. **缓存策略**: 公开文件设置长时间缓存（1年）
7. **安全考虑**: 文件上传前进行类型验证，防止恶意文件上传