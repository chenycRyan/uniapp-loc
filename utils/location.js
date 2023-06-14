var Location = function () {
  this.reportLocation = null
  this.watchLocation = null
  this.locationPool = []
  this.isWorking = false
}
const timeInt = 5000
const uploadInt = 5000
/**
 * 开启定位
 * @param {Object} options
 */
Location.prototype.openLocation = function (options) {
  options = options || {}
  var _this = this
  _this.locationReady({
    onSuccess: function () {
      options.onSuccess && options.onSuccess()
    },
    onFailed: function () {
      options.onFailed && options.onFailed()
    },
  })
}

/**
 * 准备开启定位的一些配置
 * @param options
 */
Location.prototype.locationReady = function (options) {
  options = options || {}
  var locationParams = {
    enableHighAccuracy: true, //高精度
    geocode: false,
    maximumAge: timeInt, //每次间隔时间
    coordsType: 'gcj02', //坐标的格式
    provider: 'amap', //什么类型的坐标
  }

  this.getCurrentPosition({
    locationParams: locationParams,
    onSuccess: function () {
      options.onSuccess && options.onSuccess()
    },
    onFailed: function () {
      options.onFailed && options.onFailed()
    },
  })
}

/**
 * 获取定位信息
 * @param  options
 */
Location.prototype.getCurrentPosition = function (options) {
  options = options || {}
  var _this = this
  var locationParams = options.locationParams
  //初始化Location参数
  if (_this.reportLocation) {
    window.clearInterval(_this.reportLocation)
    _this.reportLocation = null
  }
  if (_this.watchLocation) {
    plus.geolocation.clearWatch(_this.watchLocation)
    _this.watchLocation = null
  }

  //是否是工作状态 工作状态用watchPosition 非工作状态用getCurrentPosition
  if (_this.isWorking) {
    _this.watchLocation = plus.geolocation.watchPosition(
      function (position) {
        console.log('watchPosition', JSON.stringify(position))
        //过滤一些重复的或者没开启定位权限的坐标
        var difference = position.timestamp / 1000 - phpTimeInt
        var coords = position.coords
        if (coords.latitude > 0.00000001 && coords.longitude > 0.00000001 && difference > 1) {
          phpTimeInt = position.timestamp / 1000
          _this.locationPool.push(position)
          _this.locationHandle({
            onSuccess: function (success) {
              options.onSuccess && options.onSuccess(success)
            },
            onFailed: function (failure) {
              options.onFailed && options.onFailed(failure)
            },
          })
        }
      },
      function (failure) {
        console.log('onFailed', failure)
        options.onFailed && options.onFailed()
      },
      locationParams
    )
  } else {
    _this.reportLocation = setInterval(function () {
      _this.accurateLocation(options)
    }, uploadInt)
  }
}
/**
 * 非工作状态定位
 * @param  options
 */
Location.prototype.accurateLocation = function (options) {
  options = options || {}
  var _this = this
  plus.geolocation.getCurrentPosition(
    function (position) {
      _this.locationPool.push(position)
      console.log('getCurrentPosition', JSON.stringify(position))
      _this.reportLocationHandle({
        onSuccess: function (success) {
          options.onSuccess && options.onSuccess(success)
        },
        onFailed: function (failure) {
          options.onFailed && options.onFailed(failure)
        },
      })
    },
    function () {
      options.onFailed && options.onFailed()
    },
    options.locationParams
  )
}

/**
 * 开一个定时器5秒或者10秒上传一次消息队列
 * @param options
 */
Location.prototype.locationHandle = function (options) {
  options = options || {}
  var _this = this
  if (!_this.reportLocation) {
    _this.reportLocation = window.setInterval(function () {
      //plus.push.createMessage('locationPool：' + _this.locationPool.length, '', '');
      _this.reportLocationHandle({
        onSuccess: function (success) {
          options.onSuccess && options.onSuccess(success)
        },
        onFailed: function (failure) {
          options.onFailed && options.onFailed(failure)
        },
      })
    }, timeInt)
  }
}

/**
 * 关闭定位
 *
 */
Location.prototype.closeLocation = function () {
  var _this = this
  if (_this.reportLocation) {
    window.clearInterval(_this.reportLocation)
    _this.reportLocation = null
  }
  if (_this.watchLocation) {
    plus.geolocation.clearWatch(_this.watchLocation)
    _this.watchLocation = null
  }
  this.locationPool = []
}

/**
 * 上传定位接口
 * @param options
 */
Location.prototype.reportLocationHandle = function (options) {
  options = options || {}
  var locationPool = this.locationPool
  if (!locationPool[0]) {
    return
  }

  var position = locationPool[0]
  //多个定位信息
  if (locationPool.length > 1) {
    //过滤重复的定位
    var locationPoolArray = Array.deleteDuplicateCoordinates(locationPool)
    locationPool = []
    locationPool = locationPoolArray
    //locationPool每次上传完成之后清空
  } else {
    //单个定位信息
  }
}

/**
 * 过滤重复的定位数据
 * @param arrayObj
 */
Array.deleteDuplicateCoordinates = function (arrayObj) {
  var h = {} //定义一个hash表
  var arr = [] //定义一个临时数组

  for (var i = 0; i < arrayObj.length; i++) {
    //循环遍历当前数组
    //对元素进行判断，看是否已经存在表中，如果存在则跳过，否则存入临时数组
    if (!h[JSON.stringify(arrayObj[i])]) {
      //存入hash表
      h[JSON.stringify(arrayObj[i])] = true
      //把当前数组元素存入到临时数组中
      arr.push(arrayObj[i])
    }
  }
  return arr
}
module.exports = Location
