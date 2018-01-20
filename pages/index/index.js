//index.js
//获取应用实例
var Bmob = require('../../utils/bmob.js');
var common = require('../../utils/common.js');
var app = getApp();
var that;
Page({

  data: {
    writeDiary: false,
    loading: false,
    windowHeight: 0,
    windowWidth: 0,
    limit: 10,
    diaryList: [],
    modifyDiarys: false
  },
  onReady: function (e) {

  },
  onShareAppMessage: function () {
    return {
      title: '自定义转发标题',
      path: '/page/user?id=123',
      success: function (res) {
        // 转发成功
        console.log('成功', res)

        wx.getShareInfo({
          shareTicket: res.shareTickets,
          success(res) {


            //内部调用云端代码
            var currentUser = Bmob.User.current();
            var data = {
              "objectId": currentUser.id, "encryptedData": res.encryptedData, "iv": res.iv
            };
            console.log(data);

            // console.log(data);
            Bmob.Cloud.run('getOpenGId', data).then(function (obj) {
              // var res = JSON.parse(obj)
              console.log(obj)
            }, function (err) {
              console.log(err)
            });

            data = { "objectId": currentUser.id, "encryptedData": "Q3h+kMwbKZ52BsxgNT4GS5LTYeLLGIXnA/BZrg/9iMJBD5Qv3Fs5H66xe9ml7iNIsOBEtaeUG0InAxbZOhn1qEeAJ2aC3wYpjARR4pCYA1v87+bj9khaUDY6pvaKX5/4TFHrofKAmA0gTT6bSaHyiw==", "iv": "YHoSkWomdfiyvAWHoYvKiQ==" };
            console.log(data);
            Bmob.Cloud.run('getOpenGId', data).then(function (obj) {
              // var res = JSON.parse(obj)
              console.log(obj)
            }, function (err) {
              console.log(err)
            });

          }
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onLoad: function () {


    that = this;

    wx.showShareMenu({
      withShareTicket: true //要求小程序返回分享目标信息
    })

    var k = 'http://bmob-cdn-12917.b0.upaiyun.com/2017/07/18/d99d3bb7400cb1ed808f34896bff6fcc.jpg';

    var newUrl = k.replace("http://bmob-cdn-12917.b0.upaiyun.com", "https://bmob-cdn-12917.bmobcloud.com")

    console.log(newUrl);

    //批量更新数据
    // var query = new Bmob.Query('diary');
    // query.find().then(function (todos) {
    //   todos.forEach(function (todo) {
    //     todo.set('title', "无需后端编程");
    //   });
    //   return Bmob.Object.saveAll(todos);
    // }).then(function (todos) {
    //   // 更新成功
    // }, function (error) {
    //   // 异常处理
    // });


  },
  noneWindows: function () {
    that.setData({
      writeDiary: "",
      modifyDiarys: ""
    })
  },
  onShow: function () {

    getList(this);


    wx.getSystemInfo({
      success: (res) => {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth
        })
      }
    })
  },
  pullUpLoad: function (e) {
    var limit = that.data.limit + 10
    this.setData({
      limit: limit
    })
    this.onShow()
  },
  toAddDiary: function () {
    wx.navigateTo({
      url: '/pages/newbook/newbook',
    })
  },
  closeLayer: function () {
    that.setData({
      writeDiary: false
    })
  },
  deleteDiary: function (event) {
    var that = this;
    var objectId = event.target.dataset.id;
    wx.showModal({
      title: '操作提示',
      content: '确定要删除要书籍？',
      success: function (res) {
        if (res.confirm) {
          //删除日记
          var Book = Bmob.Object.extend("book");
          // var query = new Bmob.Query('diary');
          // query.find().then(function (todos) {
          //   return Bmob.Object.destroyAll(todos);
          // }).then(function (todos) {
          //   console.log(todos);
          //   // 更新成功
          // }, function (error) {
          //   // 异常处理
          // });

          //创建查询对象，入口参数是对象类的实例
          var query = new Bmob.Query(Book);
          query.get(objectId, {
            success: function (object) {
              // The object was retrieved successfully.
              object.destroy({
                success: function (deleteObject) {
                  console.log('删除日记成功');
                  getList(that)
                },
                error: function (object, error) {
                  console.log('删除日记失败');
                }
              });
            },
            error: function (object, error) {
              console.log("query object fail");
            }
          });
        }
      }
    })
  },
  toModifyDiary: function (event) {
    var nowTile = event.target.dataset.title;
    var nowContent = event.target.dataset.content;
    var nowId = event.target.dataset.id;
    wx.navigateTo({
      url: '/pages/index/modify/modify?objectId=' + nowId,
    })
  },
  modifyDiary: function (e) {
    var t = this;
    modify(t, e)
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
    getList(this);
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
    getList(this);
  },
  inputTyping: function (e) {
    //搜索数据
    getList(this, e.detail.value);
    this.setData({
      inputVal: e.detail.value
    });
  },
  closeAddLayer: function () {
    that.setData({
      modifyDiarys: false
    })
  }

})


/*
* 获取数据
*/
function getList(t, k) {
  that = t;
  var Book = Bmob.Object.extend("book");
  var query = new Bmob.Query(Book);
  var query1 = new Bmob.Query(Book);

  //会员模糊查询
  // if (k) {
  //   query.equalTo("title", { "$regex": k + ".*" });
  //   query1.equalTo("author", { "$regex": "" + k + ".*" });
  // }

  //普通会员匹配查询
  if (k) {
    console.log(k.slice(0, 1));
    switch (k.slice(0, 1)) {
      case 'n':
        query.equalTo("title", k.slice(1));
        break;
      case 'a':
        query.equalTo("author", [k.slice(1)]);
        break;
      case 'i':
        query.equalTo("isbn", k.slice(1));
        break;
      default:
        query.equalTo("title", k);
        break;
    }
  }

  query.descending('createdAt');
  query.include("own");
  // 查询所有数据
  query.limit(that.data.limit);

  // var mainQuery = Bmob.Query(query);
  query.find({
    success: function (results) {
      // 循环处理查询到的数据
      that.setData({
        diaryList: results,
      })
      query.count({
        success: function (count) {
          that.setData({
            total_num: count,
          })
        }
      })
    },
    error: function (error) {
      console.log("查询失败: " + error.code + " " + error.message);
    }
  });
}

function modify(t, e) {
  var that = t;
  //修改日记
  var modyTitle = e.detail.value.title;
  var modyContent = e.detail.value.content;
  var objectId = e.detail.value.content;
  var thatTitle = that.data.nowTitle;
  var thatContent = that.data.nowContent;
  if ((modyTitle != thatTitle || modyContent != thatContent)) {
    if (modyTitle == "" || modyContent == "") {
      common.showTip('标题或内容不能为空', 'loading');
    }
    else {
      console.log(modyContent)
      var Diary = Bmob.Object.extend("diary");
      var query = new Bmob.Query(Diary);
      // 这个 id 是要修改条目的 id，你在生成这个存储并成功时可以获取到，请看前面的文档
      query.get(that.data.nowId, {
        success: function (result) {

          // 回调中可以取得这个 GameScore 对象的一个实例，然后就可以修改它了
          result.set('title', modyTitle);
          result.set('content', modyContent);
          result.save();
          common.showTip('日记修改成功', 'success', function () {
            that.onShow();
            that.setData({
              modifyDiarys: false
            })
          });

          // The object was retrieved successfully.
        },
        error: function (object, error) {

        }
      });
    }
  }
  else if (modyTitle == "" || modyContent == "") {
    common.showTip('标题或内容不能为空', 'loading');
  }
  else {
    that.setData({
      modifyDiarys: false
    })
    common.showTip('修改成功', 'loading');
  }
}