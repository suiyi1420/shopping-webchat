// components/fullpic/fullpic.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 图片列表
    piclist: {            // 属性名
      type: Array,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: []     // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 显示控制
    isShow: false,
    current:1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //隐藏弹框
    hideDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //展示弹框
    showDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    /**
 * swiper当前页的值改变后触发该事件
 */
    onSlideChangeEnd: function (e) {
      console.log(e.detail.source)
      this.setData({
        current: e.detail.current + 1
      })
    },
  }
})
