//获取应用实例
const app = getApp()
var productNumber;//商品编号
var productId;//商品ID
var _this;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    product: {},// 商品信息
    productAttribute: {},// 商品属性
    productParameters: [],// 商品参数
    productSpecifications: {},// 商品规格列表
    upperCategories: [],// 上级类目列表
    kindVOs: [],// 商品类型列表
    productImages:[],//商品图片
    commentVOs:[],//商品评论列表
    current: 0,//swiper当前显示的图片下标
    price:0,//用户已选择的商品规格所显示的价格
    selectType: [],//用户已选择的商品规格
    youhuo:true,//是否有货，无货则显示暂无库存
    tabArr: {//中间的选项卡
      curHdIndex: 0,
      curBdIndex: 0
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    _this=this;
    productNumber = options.productNumber;
    getData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.fullpic = this.selectComponent("#fullpic");
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  /**
   * 打开全屏图片
   */
  showfullpic:function(){
    this.fullpic.showDialog();
  },

  /**
   * 选择商品规格
   */
  selecttype:function(e){
    let kindId = e.target.dataset.kindid;
    let kindAttrId = e.target.dataset.kindattrid;
    let kindVOs = _this.data.kindVOs;
    let price;
    let selectType = _this.data.selectType;
    let stringa = "";
    for (let i = 0; i < kindVOs.length;i++){
      if (kindVOs[i].kindId==kindId){
        let kindAttributes = kindVOs[i].kindAttributes;
        for (let q = 0 ;q<kindAttributes.length;q++){
          if (kindAttrId == kindAttributes[q].kindAttrId){
            kindAttributes[q].isselect=1;
            for (let w = 0; w < selectType.length;w++){
              if (selectType[w].kindId == kindId){
                selectType[w].kindAttrId = kindAttrId;
              }
            }
          }else{
            kindAttributes[q].isselect = 0;
          }
        }
        kindVOs[i].kindAttributes = kindAttributes;
      
      }
    }
    checkAttruble(selectType, _this.data.productSpecifications)
    _this.setData({
      kindVOs: kindVOs,
      selectType: selectType,
    });

  },
  tabFun: function (e) {//中间选项卡点击切换事件
    //获取触发事件组件的dataset属性  
    var _datasetId = e.target.dataset.id;
    console.log("----" + _datasetId + "----");
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    
    this.setData({
      tabArr: _obj,
      moreLoading: false,
      noMoreData: false
    });
  },

});

function getData(){
  //获取商品的详细信息
  app.getHttp({
    url: app.globalData.httpUrl + '/detail/' + productNumber,
    success: function (data) {
      let _data = data;
      let imgList = _data.productImages;
      let selectType=[];
      let stringa="";
      let price;
      for (let i = 0; i < imgList.length; i++) {
        let img = imgList[i].picImg;
        imgList[i].picImg = app.globalData.httpUrl + '/uploads/' + img;
      }
      for (let i = 0; i < _data.kindVOs.length;i++){
        let kindAttributes = _data.kindVOs[i].kindAttributes;
        for (let q = 0; q < kindAttributes.length;q++){
          if(q==0){
            kindAttributes[q].isselect=1;//是否选中
            let map={};
            map.kindId = _data.kindVOs[i].kindId;
            map.kindAttrId = kindAttributes[q].kindAttrId;
            selectType.push(map);
          }else{
            kindAttributes[q].isselect = 0;
          }
          kindAttributes[q].has=1;//是否有货，默认有
        }
        _data.kindVOs[i].kindAttributes = kindAttributes;
      }
      
      checkAttruble(selectType, _data.productSpecifications);
      let description = _data.product.description;
      _data.product.description=description.split(";");

      _this.setData({
        product: _data.product,// 商品信息
        productAttribute: _data.productAttribute,// 商品属性
        productParameters: _data.productParameters,// 商品参数
        productSpecifications: _data.productSpecifications,// 商品规格列表
        upperCategories: _data.upperCategories,// 上级类目列表
        kindVOs: _data.kindVOs,// 商品类型列表
        productImages: imgList,//商品图片})
        selectType: selectType,
      });
    }
  });
  app.getHttp({
    url: app.globalData.httpUrl + '/comment/list',
    data: { 'productNumber': productNumber},
    success:function(data){
      let commentVOs = data.commentVOs;
      for (let i = 0; i < commentVOs.length; i++) {
        let img = commentVOs[i].picImg;
        commentVOs[i].picImg = app.globalData.httpUrl + '/uploads/' + img;
      }
      _this.setData({ commentVOs: commentVOs})
    }
  });
}

/**
 * 对所有规格做关联库存判断
 */
function checkAttruble(selectType, productSpecifications){
  let stringa = "";
  let price;
  for (let e = 0; e < selectType.length; e++) {
    if (e != parseInt(selectType.length - 1)) {
      stringa = stringa + selectType[e].kindAttrId + ",";
    } else {
      stringa = stringa + selectType[e].kindAttrId;
    }

  }
  
  if (productSpecifications[stringa]!=undefined){
    price = productSpecifications[stringa].price;
    _this.setData({ price: price });
    if (parseInt(productSpecifications[stringa].stock)>0){
      _this.setData({ youhuo: true });
    }else{
      _this.setData({ youhuo: false});
    }

  }else{
    _this.setData({ price: 0 ,youhuo:false});
  }
  

}