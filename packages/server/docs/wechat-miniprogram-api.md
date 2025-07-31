# 微信小程序API接口文档

## 概述

本文档为微信小程序开发者提供后端API接口的详细说明。系统支持多个微信小程序，每个小程序通过唯一的 `appId` 进行数据隔离。

## 基础信息

**API 基础URL：** `https://your-domain.com/api`

**认证方式：** JWT Token（部分接口需要）

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

## 用户认证相关接口

### 1. 微信小程序登录

**接口地址：** `POST /wechat/login`

**接口描述：** 使用微信登录凭证进行用户登录/注册

**请求参数：**
```json
{
  "code": "微信登录凭证",
  "appId": "你的小程序AppID"
}
```

**参数说明：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 通过 wx.login() 获取的登录凭证 |
| appId | string | 是 | 微信小程序的AppID |

**小程序端调用示例：**
```javascript
// 获取登录凭证
wx.login({
  success(res) {
    if (res.code) {
      // 调用后端登录接口
      wx.request({
        url: 'https://your-domain.com/api/wechat/login',
        method: 'POST',
        data: {
          code: res.code,
          appId: 'wx1234567890abcdef' // 替换为你的AppID
        },
        success(loginRes) {
          const { token, user, isNewUser } = loginRes.data.data;
          
          // 保存token用于后续API调用
          wx.setStorageSync('token', token);
          
          if (isNewUser) {
            console.log('新用户注册成功');
          } else {
            console.log('用户登录成功');
          }
        }
      });
    }
  }
});
```

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "用户ID",
      "openid": "用户openid",
      "appId": "wx1234567890abcdef",
      "nickName": "微信昵称",
      "avatarUrl": "头像URL",
      "gender": 0,
      "city": "",
      "province": "",
      "country": "",
      "language": "zh_CN",
      "phone": "",
      "isActive": true,
      "isBlocked": false,
      "loginCount": 1,
      "registerTime": "2024-01-01T00:00:00.000Z",
      "lastLoginTime": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "isNewUser": true
  },
  "message": "注册成功"
}
```

### 2. 获取用户信息

**接口地址：** `GET /wechat/userinfo`

**接口描述：** 获取当前登录用户的详细信息

**请求头：**
```
Authorization: Bearer <your_jwt_token>
```

**小程序端调用示例：**
```javascript
wx.request({
  url: 'https://your-domain.com/api/wechat/userinfo',
  method: 'GET',
  header: {
    'Authorization': 'Bearer ' + wx.getStorageSync('token')
  },
  success(res) {
    const userInfo = res.data.data;
    console.log('用户信息：', userInfo);
  }
});
```

**响应数据：** 同登录接口中的 `user` 对象

### 3. 解密用户信息

**接口地址：** `POST /wechat/decrypt-userinfo`

**接口描述：** 解密通过 `wx.getUserProfile()` 获取的加密用户信息

**请求头：**
```
Authorization: Bearer <your_jwt_token>
```

**请求参数：**
```json
{
  "encryptedData": "加密数据",
  "iv": "初始向量"
}
```

**小程序端调用示例：**
```javascript
// 获取用户信息
wx.getUserProfile({
  desc: '用于完善用户资料',
  success(res) {
    // 发送到后端解密
    wx.request({
      url: 'https://your-domain.com/api/wechat/decrypt-userinfo',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: {
        encryptedData: res.encryptedData,
        iv: res.iv
      },
      success(decryptRes) {
        const userInfo = decryptRes.data.data;
        console.log('解密后的用户信息：', userInfo);
      }
    });
  }
});
```

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "openId": "用户openid",
    "nickName": "微信昵称",
    "gender": 1,
    "city": "广州",
    "province": "广东",
    "country": "中国",
    "avatarUrl": "头像URL",
    "unionId": "unionid（如果有）",
    "watermark": {
      "timestamp": 1234567890,
      "appid": "wx1234567890abcdef"
    }
  },
  "message": "解密成功"
}
```

### 4. 解密手机号

**接口地址：** `POST /wechat/decrypt-phone`

**接口描述：** 解密通过 `wx.getPhoneNumber()` 获取的加密手机号

**请求头：**
```
Authorization: Bearer <your_jwt_token>
```

**请求参数：**
```json
{
  "encryptedData": "加密数据",
  "iv": "初始向量"
}
```

**小程序端调用示例：**
```javascript
// 在button组件上绑定获取手机号事件
// <button open-type="getPhoneNumber" bindgetphonenumber="getPhoneNumber">
//   获取手机号
// </button>

getPhoneNumber(e) {
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    // 发送到后端解密
    wx.request({
      url: 'https://your-domain.com/api/wechat/decrypt-phone',
      method: 'POST',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      data: {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      },
      success(res) {
        const phoneInfo = res.data.data;
        console.log('手机号：', phoneInfo.phoneNumber);
      }
    });
  }
}
```

**响应数据：**
```json
{
  "code": 200,
  "data": {
    "phoneNumber": "13800138000",
    "countryCode": "86"
  },
  "message": "获取手机号成功"
}
```

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（token无效或过期） |
| 403 | 禁止访问 |
| 404 | 接口不存在 |
| 500 | 服务器内部错误 |

## 常见问题

### Q1: 如何获取AppID？
A: 在微信公众平台（mp.weixin.qq.com）的小程序后台，开发管理 -> 开发设置中可以找到AppID。

### Q2: Token过期了怎么办？
A: Token默认有效期为30天。过期后需要重新调用登录接口获取新的token。

### Q3: 同一个用户在不同小程序中是否是同一个账号？
A: 不是。系统按AppID进行数据隔离，同一个微信用户在不同小程序中会创建不同的账号。

### Q4: 如何处理网络错误？
A: 建议在小程序中添加重试机制和错误提示：

```javascript
function apiRequest(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success(res) {
        if (res.data.code === 200) {
          resolve(res.data.data);
        } else {
          wx.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
          reject(res.data);
        }
      },
      fail(err) {
        wx.showToast({
          title: '网络连接失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}

// 使用示例
apiRequest({
  url: 'https://your-domain.com/api/wechat/login',
  method: 'POST',
  data: { code, appId }
}).then(data => {
  // 处理成功响应
}).catch(err => {
  // 处理错误
});
```

## 安全建议

1. **AppID保护：** 虽然AppID不是敏感信息，但建议不要硬编码在代码中，可以通过配置文件管理。

2. **Token存储：** Token应该安全存储在小程序的本地存储中，避免在URL参数中传递。

3. **HTTPS：** 生产环境必须使用HTTPS协议。

4. **错误处理：** 合理处理各种错误情况，避免敏感信息泄露。

5. **数据校验：** 在调用API前对参数进行基本校验。

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持微信小程序登录
- 支持用户信息解密
- 支持手机号解密
- 支持多小程序数据隔离

---

如有其他问题，请联系技术支持团队。