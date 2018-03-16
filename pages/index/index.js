//index.js
//获取应用实例
const app = getApp()
Page({
  enablePullDownRefresh:true,
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    productList:{},//商品列表
    advert: {//首页顶部轮播广告参数
      indicatorDots: true,//是否出现焦点
      indicatorColor:"#ffffff",
      indicatorActiveColor:"#cc0000",
      autoplay: true,//是否自动播放
      interval: 5000,//自动播放间隔时间
      duration: 1000,//滑动动画时间
    },
    advertImgUrls: [],//滚动图片地址
    tabArr: {//中间的选项卡
      curHdIndex: 0,
      curBdIndex: 0
    },
    tabIsTop:false,//中间选项卡是否置顶，默认否
    starproducts: [],//明星商品数据列表
    popularproducts: [],//为你推荐数据列表
    commentproducts: [],//热评商品数据列表
    newproducts: [], //新品推荐数据列表
    pageInfo:{//中间选项卡的分页信息
      starproducts: 1,//明星商品
      popularproducts: 1,//为你推荐
      commentproducts: 1,//热评商品
      newproducts: 1, //新品推荐
      currentitem:0,//当前的选项卡选中的位置,默认是第一个
      current:1,//当前选项卡选中的项目的当前页数
    },
    moreLoading:false,//加载更多判断符
    noMoreData:false,//没有更多数据判断符
    hotType:[],//热门分类
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  tabFun: function (e) {//中间选项卡点击切换事件
    //获取触发事件组件的dataset属性  
    var _datasetId = e.target.dataset.id;
    console.log("----" + _datasetId + "----");
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    let pageinfo = this.data.pageInfo;
    pageinfo.currentPage = _datasetId;
    this.setData({
      tabArr: _obj,
      pageInfo: pageinfo,
      moreLoading: false,
      noMoreData: false
    });
  },
  onLoad: function () {
    let _this=this;
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    dataInit(_this);//初始化数据
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  onPageScroll: function (e) { // 页面滚动事件
    let wh = wx.getSystemInfoSync().windowHeight;//获取屏幕高度
    let swh=wh*0.5;//页面滚动到选项卡的距离，需根据css的高度进行修改值
    if (e.scrollTop > swh){
      this.setData({tabIsTop:true})
    }else{
      this.setData({ tabIsTop: false })
    }
  },
  goTop: function (e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  /**
   * 上拉加载更多
   */
  onReachBottom:function(){
    let _this=this;
    _this.setData({ moreLoading:true});
    function loadmore(url,fun){
      app.getHttp({
        url: app.globalData.httpUrl + '/recommend/'+url,
        data: { current: _this.data.pageInfo.current},
        success: function (data) {
          fun(data);
        }
      })
    }
    let pageinfo = this.data.pageInfo;
    let id = pageinfo.currentitem;
    let uurl="";
    let current;
    let list=[];
    if(id==0){
      current = pageinfo.newproducts + 1;
      uurl = "new";
      list = _this.data.newproducts;
    } else if (id == 1){
      current = pageinfo.popularproducts + 1;
      uurl = "popular";
      list = _this.data.popularproducts;
    } else if (id == 2){
      current = pageinfo.starproducts + 1;
      uurl = "star";
      list = _this.data.starproducts;
    } else if (id == 3){
      current = pageinfo.commentproducts + 1;
      uurl = "comment";
      list = _this.data.commentproducts;
    }
    pageinfo.current = current;
    _this.setData({ pageInfo: pageinfo });
    loadmore(uurl, function (res) {
      if (res.products.length > 0) {
        list = list.concat(res.products);
        if (id == 0) {
          pageinfo.newproducts++;
          _this.setData({ newproducts: list, pageInfo: pageinfo });
        } else if (id == 1) {
          pageinfo.popularproducts++;
          _this.setData({ popularproducts: list, pageInfo: pageinfo });
        } else if (id == 2) {
          pageinfo.starproducts++;
          _this.setData({ starproducts: list, pageInfo: pageinfo });
        } else if (id == 3) {
          pageinfo.commentproducts++;
          _this.setData({ commentproducts: list, pageInfo: pageinfo });
        }
        _this.setData({ moreLoading: false });
      }else{
        _this.setData({ moreLoading: false });
        _this.setData({ noMoreData: true });
      }
    });
    
  },
  
  nativeToProtuctInfo:function(e){
    let productNumber = e.currentTarget.dataset.productnumber;
    let productId = e.currentTarget.dataset.productid;
    wx.navigateTo({
      url: '../productInfo/productinfo?productNumber=' + productNumber+'&productId='+productId,
    })
  }

})
/**
 * 数据初始化函数
 */
function dataInit(_this){
  getProductList(_this);
  getIndexData(_this);
  getTabData(_this);
  getHotType(_this);
}
/**
 * 获取商品列表数据
 */
function getProductList(_this) {
  app.getHttp({ 
    url: app.globalData.httpUrl + '/list',
    data: {categoryId: 1,},
    success: function (data) {
      _this.setData({ productList: data })
    }
  })
}
/**
 * 获取首页的
 * 轮播广告图，首页热点广告列表
 */
function getIndexData(_this){
  //获取轮播广告图，首页热点广告列表数据
  app.getHttp({
    url: app.globalData.httpUrl + '/index',
    success: function (data) {
      let _data=data;
      for (let i = 0; i < _data.indexCarouselImgs.length;i++){
        let img = _data.indexCarouselImgs[i].picImg
        _data.indexCarouselImgs[i].picImg = app.globalData.httpUrl + '/uploads/' + img;
      }
      _this.setData({ advertImgUrls: _data.indexCarouselImgs })
    }
  });

  //

}
/**
 * 获取首页中间选项卡的数据
 */
function getTabData(_this) {
  //获取明星商品
  app.getHttp({
    url: app.globalData.httpUrl + '/recommend/star',
    success: function (data) {
      let _data = data.products;
      for (let i = 0; i < _data.length; i++) {
        let img = _data[i].picImg;
        _data[i].picImg = app.globalData.httpUrl + '/uploads/' + img;
      }
      _this.setData({ starproducts: _data})
    }
  });
  //获取为你推荐
  app.getHttp({
    url: app.globalData.httpUrl + '/recommend/popular',
    success: function (data) {
      let _data = data.products;
      for (let i = 0; i < _data.length; i++) {
        let img = _data[i].picImg;
        _data[i].picImg = app.globalData.httpUrl + '/uploads/' + img;
      }
      _this.setData({ popularproducts: _data})
    }
  });
  //获取热评商品
  app.getHttp({
    url: app.globalData.httpUrl + '/recommend/comment',
    success: function (data) {
      let _data = data.products;
      for (let i = 0; i < _data.length; i++) {
        let img = _data[i].picImg;
        _data[i].picImg = app.globalData.httpUrl + '/uploads/' + img;
      }
      _this.setData({ commentproducts: _data })
    }
  });
  //获取新品推荐
  app.getHttp({
    url: app.globalData.httpUrl + '/recommend/new',
    success: function (data) {
      let _data = data.products;
      for (let i = 0; i < _data.length; i++) {
        let img = _data[i].picImg;
        _data[i].picImg = app.globalData.httpUrl + '/uploads/' + img;
      }
      _this.setData({ newproducts: _data })
    }
  });

}

function getHotType(_this){
  app.getHttp({
    url: app.globalData.httpUrl + '/recommend/hottype',
    success: function (data) {
      let _data = data.categorys;
      for (let i = 0; i < _data.length; i++) {
        let img = _data[i].pic;
        _data[i].pic = app.globalData.httpUrl + '/uploads/' + img;
      }
      _this.setData({ hotType: _data })
    }
  })
}

