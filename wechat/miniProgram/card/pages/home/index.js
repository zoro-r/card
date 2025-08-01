Page({
  data: {
    tabs: [
      {
        title: "分享名片",
        icon: "dddd",
        type: "share"
      },
      {
        title: "个人名片码",
        icon: "dddd",
        type: "share"
      },
      {
        title: "拨打电话",
        icon: "dddd",
        type: "share"
      },
      {
        title: "加通讯录",
        icon: "dddd",
        type: "share"
      },
      {
        title: "添加微信",
        icon: "dddd",
        type: "share"
      },
    ],
  },
  onPageScroll(e) {
    const scrollTop = e.scrollTop;
    const max = 100;
    let opacity = scrollTop / max;
    if (opacity > 1) opacity = 1;
    this.setData({
      navOpacity: opacity
    });
  },

  onLoad(options) {

  },

  onReady() {

  },
  onShow() {

  },

  onHide() {

  },

  onUnload() {

  },

  onPullDownRefresh() {

  },

  onReachBottom() {

  },

  onShareAppMessage() {

  },

  // Header组件事件处理
  onHeaderMenu() {
    console.log('Header菜单按钮被点击');
  },

  onHeaderMenuSelect(e) {
    const { index, item } = e.detail;
    console.log(`用户选择了: ${item} (索引: ${index})`);
    
    switch (index) {
      case 0:
        wx.showToast({
          title: '进入设置页面',
          icon: 'none'
        });
        break;
      case 1:
        wx.showToast({
          title: '查看帮助信息',
          icon: 'none'
        });
        break;
      case 2:
        wx.showToast({
          title: '关于我们',
          icon: 'none'
        });
        break;
    }
  }
})