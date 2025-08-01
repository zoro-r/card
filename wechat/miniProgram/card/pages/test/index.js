const API_BASE = 'http://192.168.31.126:3000/api'

Page({
  data: {
    userInfo: null,
    token: null,
    testResults: [],
    loading: false
  },

  onLoad() {
    // 页面载入时检查登录状态
    const token = wx.getStorageSync('token')
    if (token) {
      this.setData({ token })
    }
  },

  // 添加测试结果
  addTestResult(title, success, data = null, error = null) {
    const result = {
      title,
      success,
      data: success ? JSON.stringify(data, null, 2) : null,
      error: success ? null : (error?.message || error || '未知错误'),
      time: new Date().toLocaleTimeString()
    }
    
    const results = [...this.data.testResults, result]
    this.setData({ testResults: results })
  },

  // 清空测试结果
  clearResults() {
    this.setData({ testResults: [] })
  },

  // 微信登录测试
  async testWechatLogin() {
    this.setData({ loading: true })
    
    try {
      // 获取微信登录code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        })
      })

      if (!loginRes.code) {
        throw new Error('获取微信登录code失败')
      }

      // 调用后端登录接口
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE}/wechat/login`,
          method: 'POST',
          data: {
            code: loginRes.code,
            appId: 'wxcb03144d55fc82c4' // 使用配置的AppID
          },
          success: resolve,
          fail: reject
        })
      })

      if (response.statusCode === 200 && response.data.code === 200) {
        const { token, userInfo } = response.data.data
        
        // 保存token
        wx.setStorageSync('token', token)
        
        this.setData({ 
          token,
          userInfo 
        })
        
        this.addTestResult('微信登录', true, { token, userInfo })
      } else {
        throw new Error(response.data.message || '登录失败')
      }
    } catch (error) {
      this.addTestResult('微信登录', false, null, error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 获取用户信息测试
  async testGetUserInfo() {
    const token = this.data.token
    if (!token) {
      this.addTestResult('获取用户信息', false, null, '请先登录')
      return
    }

    this.setData({ loading: true })

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE}/wechat/userinfo`,
          method: 'GET',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: resolve,
          fail: reject
        })
      })

      if (response.statusCode === 200 && response.data.code === 200) {
        this.addTestResult('获取用户信息', true, response.data.data)
      } else {
        throw new Error(response.data.message || '获取用户信息失败')
      }
    } catch (error) {
      this.addTestResult('获取用户信息', false, null, error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 解密用户信息测试
  async testDecryptUserInfo() {
    const token = this.data.token
    if (!token) {
      this.addTestResult('获取用户信息', false, null, '请先登录')
      return
    }

    this.setData({ loading: true })

    try {
      // 检查小程序基础库版本
      const systemInfo = wx.getSystemInfoSync()
      this.addTestResult('系统信息检查', true, {
        SDKVersion: systemInfo.SDKVersion,
        version: systemInfo.version,
        platform: systemInfo.platform
      })

      // 获取用户信息
      const userProfile = await new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于测试解密功能',
          success: resolve,
          fail: reject
        })
      })

      // 检查是否获取到加密数据
      if (!userProfile.encryptedData || !userProfile.iv) {
        throw new Error('未获取到加密数据，可能是用户拒绝授权或小程序配置有误')
      }

      this.addTestResult('getUserProfile调用', true, {
        hasEncryptedData: !!userProfile.encryptedData,
        hasIv: !!userProfile.iv,
        encryptedDataLength: userProfile.encryptedData ? userProfile.encryptedData.length : 0,
        ivLength: userProfile.iv ? userProfile.iv.length : 0,
        userInfo: userProfile.userInfo
      })

      // 调用后端解密接口
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE}/wechat/decrypt-userinfo`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            encryptedData: userProfile.encryptedData,
            iv: userProfile.iv
          },
          success: resolve,
          fail: reject
        })
      })

      // 详细记录后端响应
      this.addTestResult('后端响应信息', true, {
        statusCode: response.statusCode,
        responseData: response.data
      })

      if (response.statusCode === 200 && response.data.code === 200) {
        this.addTestResult('解密用户信息', true, response.data.data)
      } else {
        throw new Error(response.data.message || '解密用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.addTestResult('获取用户信息', false, null, {
        errorMessage: error.message || error.toString(),
        errorType: error.name,
        stack: error.stack
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // open-type方式获取用户信息授权回调
  onGetUserInfo(e) {
    console.log('open-type getUserInfo result:', e.detail)
    
    // 记录详细的回调信息
    this.addTestResult('open-type回调信息', true, {
      hasUserInfo: !!e.detail.userInfo,
      hasEncryptedData: !!e.detail.encryptedData,
      hasIv: !!e.detail.iv,
      errMsg: e.detail.errMsg,
      rawResponse: e.detail
    })

    if (e.detail.userInfo && e.detail.encryptedData && e.detail.iv) {
      // 用户同意授权，且有加密数据
      this.doDecryptUserInfoWithOpenType(e.detail.encryptedData, e.detail.iv)
    } else {
      // 用户拒绝授权或没有获取到加密数据
      const message = e.detail.errMsg || '用户拒绝授权或open-type方式已不支持获取加密数据'
      this.addTestResult('获取用户信息(open-type)', false, null, message)
    }
  },

  // 执行解密用户信息 - open-type方式
  async doDecryptUserInfoWithOpenType(encryptedData, iv) {
    const token = this.data.token
    this.setData({ loading: true })

    try {
      // 调用后端解密接口
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE}/wechat/decrypt-userinfo`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            encryptedData,
            iv
          },
          success: resolve,
          fail: reject
        })
      })

      if (response.statusCode === 200 && response.data.code === 200) {
        this.addTestResult('解密用户信息(open-type)', true, response.data.data)
      } else {
        throw new Error(response.data.message || '解密用户信息失败')
      }
    } catch (error) {
      this.addTestResult('解密用户信息(open-type)', false, null, error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 获取手机号授权回调
  onGetPhoneNumber(e) {
    if (e.detail.encryptedData && e.detail.iv) {
      // 用户同意授权，调用解密接口
      this.doDecryptPhoneNumber(e.detail.encryptedData, e.detail.iv)
    } else {
      // 用户拒绝授权或获取失败
      this.addTestResult('获取用户手机号', false, null, e.detail.errMsg || '用户拒绝授权')
    }
  },

  // 执行解密手机号
  async doDecryptPhoneNumber(encryptedData, iv) {
    const token = this.data.token
    this.setData({ loading: true })

    try {
      // 调用后端解密手机号接口
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE}/wechat/decrypt-phone`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            encryptedData,
            iv
          },
          success: resolve,
          fail: reject
        })
      })

      if (response.statusCode === 200 && response.data.code === 200) {
        this.addTestResult('获取用户手机号', true, response.data.data)
      } else {
        throw new Error(response.data.message || '解密手机号失败')
      }
    } catch (error) {
      this.addTestResult('获取用户手机号', false, null, error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 创建订单测试
  async testCreateOrder() {
    const token = this.data.token
    if (!token) {
      this.addTestResult('创建订单', false, null, '请先登录')
      return
    }

    this.setData({ loading: true })

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE}/orders`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`
          },
          data: {
            orderType: 'PRODUCT',
            amount: 1, // 1分钱测试
            items: [{
              name: '测试商品',
              price: 1,
              quantity: 1,
              description: '用于测试的商品'
            }],
            description: '测试订单'
          },
          success: resolve,
          fail: reject
        })
      })

      if (response.statusCode === 200 && response.data.code === 200) {
        this.addTestResult('创建订单', true, response.data.data)
      } else {
        throw new Error(response.data.message || '创建订单失败')
      }
    } catch (error) {
      this.addTestResult('创建订单', false, null, error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 发起支付测试
  async testInitiatePayment() {
    const token = this.data.token
    if (!token) {
      this.addTestResult('发起支付', false, null, '请先登录')
      return
    }

    // 这里需要先有一个订单，简化处理，提示用户先创建订单
    wx.showModal({
      title: '提示',
      content: '请先创建订单，然后输入订单号进行支付测试',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '输入订单号',
            editable: true,
            placeholderText: '请输入订单号',
            success: async (inputRes) => {
              if (inputRes.confirm && inputRes.content) {
                await this.doPaymentTest(inputRes.content)
              }
            }
          })
        }
      }
    })
  },

  // 执行支付测试
  async doPaymentTest(orderNo) {
    const token = this.data.token
    this.setData({ loading: true })

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE}/orders/${orderNo}/payment`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: resolve,
          fail: reject
        })
      })

      if (response.statusCode === 200 && response.data.code === 200) {
        const paymentData = response.data.data
        
        // 调用微信支付
        const payRes = await new Promise((resolve, reject) => {
          wx.requestPayment({
            ...paymentData,
            success: resolve,
            fail: reject
          })
        })

        this.addTestResult('发起支付', true, { orderNo, paymentResult: payRes })
      } else {
        throw new Error(response.data.message || '发起支付失败')
      }
    } catch (error) {
      this.addTestResult('发起支付', false, null, error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 退出登录
  logout() {
    wx.removeStorageSync('token')
    this.setData({
      token: null,
      userInfo: null
    })
    this.addTestResult('退出登录', true, '已清除本地token')
  },

  // 复制结果
  copyResult(e) {
    const index = e.currentTarget.dataset.index
    const result = this.data.testResults[index]
    const content = result.success ? result.data : result.error
    
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  }
})