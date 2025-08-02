# 商品管理接口文档

## 管理后台商品接口

### 1. 创建商品
**接口地址**: `POST /api/admin/products`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:create`

**请求参数**:
```json
{
  "name": "string",                 // 必填，商品名称
  "description": "string",          // 可选，商品描述
  "shortDescription": "string",     // 可选，简短描述
  "images": ["string"],             // 必填，商品图片URL列表
  "video": "string",                // 可选，商品视频URL
  "price": 10000,                   // 必填，基础价格（分）
  "originalPrice": 15000,           // 可选，原价（分）
  "costPrice": 5000,                // 可选，成本价（分）
  "stock": 100,                     // 必填，总库存
  "stockWarning": 10,               // 可选，库存预警值（默认10）
  "categoryId": "string",           // 可选，商品分类ID
  "categoryPath": ["string"],       // 可选，分类路径
  "tags": ["string"],               // 可选，商品标签
  "hasMultipleSkus": false,         // 可选，是否有多个SKU（默认false）
  "specs": [                        // 可选，商品规格（多SKU时必填）
    {
      "name": "颜色",
      "values": ["红色", "蓝色", "绿色"],
      "isRequired": true
    }
  ],
  "skus": [                         // 可选，SKU列表（多SKU时必填）
    {
      "name": "红色-L",
      "price": 10000,
      "originalPrice": 15000,
      "stock": 50,
      "attributes": {
        "颜色": "红色",
        "尺寸": "L"
      },
      "images": ["string"],
      "barcode": "string",
      "weight": 500,
      "volume": {
        "length": 10,
        "width": 10,
        "height": 5
      }
    }
  ],
  "type": "PHYSICAL",               // 可选，商品类型（PHYSICAL/VIRTUAL/SERVICE）
  "status": "DRAFT",                // 可选，商品状态（默认DRAFT）
  "isRecommended": false,           // 可选，是否推荐
  "isFeatured": false,              // 可选，是否精选
  "isVirtual": false,               // 可选，是否虚拟商品
  "seoTitle": "string",             // 可选，SEO标题
  "seoKeywords": "string",          // 可选，SEO关键词
  "seoDescription": "string",       // 可选，SEO描述
  "minQuantity": 1,                 // 可选，最小购买数量（默认1）
  "maxQuantity": 999,               // 可选，最大购买数量
  "weight": 500,                    // 可选，重量（克）
  "volume": {                       // 可选，体积
    "length": 10,
    "width": 10,
    "height": 5
  },
  "shippingTemplateId": "string",   // 可选，运费模板ID
  "attributes": {                   // 可选，自定义属性
    "brand": "品牌名",
    "material": "材质"
  }
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "创建商品成功",
  "data": {
    "_id": "string",
    "productId": "string",
    "name": "商品名称",
    "description": "商品描述",
    "shortDescription": "简短描述",
    "images": ["string"],
    "video": "string",
    "price": 10000,
    "priceYuan": "100.00",
    "originalPrice": 15000,
    "originalPriceYuan": "150.00",
    "costPrice": 5000,
    "costPriceYuan": "50.00",
    "stock": 100,
    "stockWarning": 10,
    "sold": 0,
    "categoryId": "string",
    "categoryPath": ["string"],
    "tags": ["string"],
    "hasMultipleSkus": false,
    "specs": [],
    "skus": [],
    "type": "PHYSICAL",
    "status": "DRAFT",
    "statusText": "草稿",
    "isRecommended": false,
    "isFeatured": false,
    "isVirtual": false,
    "seoTitle": "string",
    "seoKeywords": "string",
    "seoDescription": "string",
    "minQuantity": 1,
    "maxQuantity": 999,
    "salesCount": 0,
    "viewCount": 0,
    "favoriteCount": 0,
    "weight": 500,
    "volume": {},
    "shippingTemplateId": "string",
    "platformId": "root",
    "attributes": {},
    "publishedAt": null,
    "inStock": true,
    "priceRange": "¥100.00",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### 2. 获取商品列表
**接口地址**: `GET /api/admin/products`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:read`

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20）
- `keyword`: 搜索关键词（商品名称、描述、标签）
- `categoryId`: 分类过滤
- `status`: 状态过滤（DRAFT/ACTIVE/INACTIVE/OUT_OF_STOCK）
- `type`: 类型过滤（PHYSICAL/VIRTUAL/SERVICE）
- `isRecommended`: 推荐过滤（true/false）
- `isFeatured`: 精选过滤（true/false）
- `minPrice`: 最低价格（分）
- `maxPrice`: 最高价格（分）
- `inStock`: 库存过滤（true显示有库存）
- `sortBy`: 排序字段（createdAt/salesCount/viewCount/price/stock）
- `sortOrder`: 排序方向（asc/desc）
- `tags`: 标签过滤（数组）

**响应数据**:
```json
{
  "code": 0,
  "message": "获取商品列表成功",
  "data": {
    "products": [
      {
        "_id": "string",
        "productId": "string",
        "name": "商品名称",
        "images": ["string"],
        "price": 10000,
        "priceYuan": "100.00",
        "stock": 100,
        "status": "ACTIVE",
        "statusText": "上架",
        "salesCount": 50,
        "viewCount": 200,
        "isRecommended": true,
        "isFeatured": false,
        "createdAt": "string"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### 3. 获取商品详情
**接口地址**: `GET /api/admin/products/:productId`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:read`

**路径参数**:
- `productId`: 商品ID

**查询参数**:
- `incrementView`: 是否增加浏览次数（true/false）

**响应数据**: 同创建商品响应数据

### 4. 更新商品
**接口地址**: `PUT /api/admin/products/:productId`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:update`

**路径参数**:
- `productId`: 商品ID

**请求参数**: 同创建商品参数（所有字段可选）

### 5. 删除商品
**接口地址**: `DELETE /api/admin/products/:productId`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:delete`

**路径参数**:
- `productId`: 商品ID

**响应数据**:
```json
{
  "code": 0,
  "message": "删除商品成功",
  "data": null
}
```

### 6. 批量删除商品
**接口地址**: `POST /api/admin/products/batch-delete`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:delete`

**请求参数**:
```json
{
  "productIds": ["string"]  // 商品ID列表
}
```

**响应数据**:
```json
{
  "code": 0,
  "message": "批量删除完成",
  "data": {
    "success": ["productId1", "productId2"],
    "failed": ["productId3"]
  }
}
```

### 7. 搜索商品
**接口地址**: `GET /api/admin/products/search`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:read`

**查询参数**:
- `keyword`: 搜索关键词（必填）

**响应数据**:
```json
{
  "code": 0,
  "message": "搜索商品成功",
  "data": [
    {
      "productId": "string",
      "name": "商品名称",
      "images": ["string"],
      "price": 10000,
      "priceYuan": "100.00",
      "status": "ACTIVE"
    }
  ]
}
```

### 8. 获取推荐商品
**接口地址**: `GET /api/admin/products/recommended`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:read`

**查询参数**:
- `limit`: 数量限制（默认: 10）

### 9. 获取精选商品
**接口地址**: `GET /api/admin/products/featured`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:read`

**查询参数**:
- `limit`: 数量限制（默认: 10）

### 10. 更新库存
**接口地址**: `PUT /api/admin/products/:productId/stock`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:update`

**路径参数**:
- `productId`: 商品ID

**请求参数**:
```json
{
  "quantity": 10,        // 必填，库存变化量（正数增加，负数减少）
  "skuId": "string"      // 可选，指定SKU ID
}
```

### 11. 批量更新商品状态
**接口地址**: `POST /api/admin/products/batch-update-status`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:update`

**请求参数**:
```json
{
  "productIds": ["string"],   // 商品ID列表
  "status": "ACTIVE"          // 新状态
}
```

### 12. 获取商品统计信息
**接口地址**: `GET /api/admin/products/statistics`

**请求头**: `Authorization: Bearer <token>`

**权限要求**: `product:read`

**响应数据**:
```json
{
  "code": 0,
  "message": "获取统计信息成功",
  "data": {
    "totalProducts": 100,
    "activeProducts": 80,
    "draftProducts": 15,
    "outOfStockProducts": 5,
    "totalStock": 10000,
    "totalSales": 5000,
    "recommendedProducts": 20,
    "featuredProducts": 10
  }
}
```

---

## 小程序端商品接口

### 1. 获取商品列表（小程序）
**接口地址**: `GET /api/wechat/:platformId/products`

**权限要求**: 无需认证

**路径参数**:
- `platformId`: 平台ID

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 20）
- `keyword`: 搜索关键词
- `categoryId`: 分类过滤
- `type`: 类型过滤
- `minPrice`: 最低价格（分）
- `maxPrice`: 最高价格（分）
- `sortBy`: 排序字段（默认: salesCount）
- `sortOrder`: 排序方向（默认: desc）
- `tags`: 标签过滤

**说明**: 只返回上架且有库存的商品

### 2. 获取商品详情（小程序）
**接口地址**: `GET /api/wechat/:platformId/products/:productId`

**权限要求**: 无需认证

**路径参数**:
- `platformId`: 平台ID
- `productId`: 商品ID

**说明**: 只能查看上架商品，会自动增加浏览次数

### 3. 搜索商品（小程序）
**接口地址**: `GET /api/wechat/:platformId/products/search`

**权限要求**: 无需认证

**路径参数**:
- `platformId`: 平台ID

**查询参数**:
- `keyword`: 搜索关键词（必填）
- `limit`: 返回数量限制

### 4. 获取推荐商品（小程序）
**接口地址**: `GET /api/wechat/:platformId/products/recommended`

**权限要求**: 无需认证

**路径参数**:
- `platformId`: 平台ID

**查询参数**:
- `limit`: 数量限制（默认: 10）

### 5. 获取精选商品（小程序）
**接口地址**: `GET /api/wechat/:platformId/products/featured`

**权限要求**: 无需认证

**路径参数**:
- `platformId`: 平台ID

**查询参数**:
- `limit`: 数量限制（默认: 10）

## 数据字段说明

### 商品状态（ProductStatus）
- `DRAFT`: 草稿
- `ACTIVE`: 上架
- `INACTIVE`: 下架
- `OUT_OF_STOCK`: 缺货
- `DELETED`: 已删除

### 商品类型（ProductType）
- `PHYSICAL`: 实物商品
- `VIRTUAL`: 虚拟商品
- `SERVICE`: 服务商品

### SKU属性说明
- `skuId`: SKU唯一标识，系统自动生成
- `name`: SKU名称，通常为属性组合
- `price`: SKU价格，以分为单位
- `attributes`: SKU属性键值对，如 `{"颜色": "红色", "尺寸": "L"}`
- `stock`: SKU库存数量
- `isActive`: SKU是否启用

### 商品规格说明
- `name`: 规格名称，如"颜色"、"尺寸"
- `values`: 规格值数组，如["红色", "蓝色", "绿色"]
- `isRequired`: 是否必选规格

## 权限说明

### 商品管理权限
- `product:create` - 创建商品
- `product:read` - 查看商品列表和详情
- `product:update` - 更新商品信息、库存、状态
- `product:delete` - 删除商品

## 业务流程说明

### 商品创建流程
1. 上传商品图片到文件管理系统
2. 填写商品基本信息（名称、价格、库存等）
3. 设置商品分类和标签
4. 配置SKU信息（如有多规格）
5. 设置SEO信息和其他属性
6. 保存为草稿或直接发布

### 多SKU商品管理
1. 设置 `hasMultipleSkus` 为 `true`
2. 定义商品规格 `specs`（如颜色、尺寸）
3. 根据规格组合创建SKU列表
4. 每个SKU独立设置价格和库存
5. 系统自动计算总库存

### 库存管理
1. 单SKU商品：直接更新商品库存
2. 多SKU商品：更新指定SKU库存，系统重新计算总库存
3. 库存为0时自动设置为缺货状态
4. 库存恢复时自动设置为上架状态

## 注意事项

1. **价格处理**: 所有价格以分为单位存储，前端显示时转换为元
2. **图片管理**: 商品图片需先通过文件上传接口上传
3. **库存同步**: 订单支付成功后会自动扣减相应SKU库存
4. **搜索优化**: 商品名称、描述、标签都会被搜索索引
5. **状态控制**: 只有上架状态的商品才能在小程序端显示
6. **权限控制**: 管理后台接口需要相应权限，小程序端接口公开访问