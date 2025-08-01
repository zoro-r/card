Component({
  properties: {
    title: {
      type: String,
      value: '我的名片'
    },
    opacity: {
      type: Number,
      value: 0
    },
    showBack: {
      type: Boolean,
      value: true
    }
  },
  data: {
    statusBarHeight: 20,
    navHeight: 64
  },
  lifetimes: {
    attached() {
      const sys = wx.getWindowInfo();
      const statusBarHeight = sys.statusBarHeight;
      console.log('sys', sys);
      // 获取胶囊的位置
      const menuButton = wx.getMenuButtonBoundingClientRect();
      const navHeight = menuButton.bottom + menuButton.top - statusBarHeight;

      console.log('menuButton', menuButton);
      console.log('navHeight', navHeight);
      this.setData({
        statusBarHeight,
        navHeight
      });
    }
  },
  methods: {
    onBack() {
      wx.navigateBack();
    }
  }
});
