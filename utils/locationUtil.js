var locationUtil = function () {
  this.PI = 3.14159265358979324
  this.x_pi = (3.14159265358979324 * 3000.0) / 180.0
  this.shopSignInitialize
}

locationUtil.prototype.bd_decrypt = function (bdLat, bdLon) {
  var x = bdLon - 0.0065,
    y = bdLat - 0.006
  var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi)
  var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi)
  var gcjLon = z * Math.cos(theta)
  var gcjLat = z * Math.sin(theta)
  return {
    lat: gcjLat,
    lon: gcjLon,
  }
}

/**
 * 返回秒的时间戳 String
 */
locationUtil.prototype.phpTime = function () {
  var date = new Date()
  var timeInt = date.getTime()
  timeInt = (timeInt - (timeInt % 1000)) / 1000
  return timeInt + ''
}

/**
 * 返回秒的时间戳 number
 */
locationUtil.prototype.phpTimeInt = function () {
  var date = new Date()
  var timeInt = date.getTime()
  timeInt = (timeInt - (timeInt % 1000)) / 1000
  return timeInt
}

/**
 * 判断是否有定位权限
 */
locationUtil.prototype.getLocationPermission = function () {
  var main = plus.android.runtimeMainActivity()
  var Build = plus.android.importClass('android.os.Build')
  var Manifest = plus.android.importClass('android.Manifest')
  var PackageManager = plus.android.importClass('android.content.pm.PackageManager')
  var Permission = Manifest.permission
  var VERSION = Build.VERSION
  var VERSION_CODES = Build.VERSION_CODES
  var isCheck = Permission.ACCESS_FINE_LOCATION
  var pkName = main.getPackageName()
  var packageManager = main.getPackageManager()
  console.log(isCheck)
  var GRANTED = ''
  if (VERSION.SDK_INT >= VERSION_CODES.M) {
    GRANTED = plus.android.invoke(main, 'checkSelfPermission', isCheck)
    alert(GRANTED)
    if (GRANTED == PackageManager.PERMISSION_DENIED) {
      console.log('没开启定位权限')
    } else {
      console.log('启定位权限')
    }
  } else {
    GRANTED = plus.android.invoke(packageManager, 'checkPermission', isCheck, pkName)
    alert(GRANTED)
    if (GRANTED == PackageManager.PERMISSION_DENIED) {
      console.log('没开启定位权限')
    } else {
      console.log('启定位权限')
    }
  }
}
module.exports = locationUtil
