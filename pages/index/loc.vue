<template>
  <view>
    <button type="primary" @click="enableBackgroundLocation()">开启后台</button>
    <button type="primary" @click="disableBackgroundLocation()">停止后台</button>
    <button type="primary" @click="startLocation()">开启定位</button>
    <button type="primary" @click="stopLocation()">停止定位</button>
    <view class="">
      <view> 定位结果： {{ location }} </view>
      <view> 定位时间： {{ time }}</view>
      <view> 定位次数：{{ count }} </view>
    </view>
  </view>
</template>

<script>
//持续定位插件对象
var loc = uni.requireNativePlugin('AMap-Loc')
export default {
  data() {
    return {
      pathPoints: [],
      location: null,
      time: null,
      count: 0,
    }
  },
  onLoad() {
    //隐私合规接口
    var isContains = true //隐私权政策是否包含高德开平隐私权政策  true是包含
    var isShow = true //隐私权政策是否弹窗展示告知用户 true是展示
    loc.updatePrivacyShow(isContains, isShow)

    var isAgree = true //隐私权政策是否取得用户同意  true是用户同意
    loc.updatePrivacyAgree(isAgree)

    //判断是否始终允许定位，false 引导用户去设置页面
    var always = loc.grantedAlwaysLocation()
    console.log('always:' + always)

    var nowTime = new Date().getTime()
    console.log(nowTime)

    //设置定位数据回调
    var that = this
    loc.setLocationCallback(function (res) {
      if (res.code == 0) {
				console.log(res.data);
        that.location = res.data.address
        that.location = res.data.address || res.data.latitude + ',' + res.data.longitude
        that.time = that.getYMDHMS(res.data.time)
        that.count++
        // console.log(that.time, that.count)
      }
    })

    //定位配置
    loc.setLocationOption({
      needAddress: true, //定位是否需要解析地址
      enableHTTPS: true, //(ios）
      allowsBackgroundLocationUpdates: true, //(ios）开启后台定位
      pausesLocationUpdatesAutomatically: true, //(ios）开启后台定位
      locationAccuracyMode: 1,
      //distanceFilter:1,//(ios）设置定位最小更新距离方法如下，单位米。当两次定位距离满足设置的最小更新距离时，SDK会返回符合要求的定位结果。
      //locationTimeout:5,//单次定位超时时间（ios）
      //reGeocodeTimeout:10,//单次定位地址解析超时时间（ios）
      //onceLocation:true,//定位一次（android）
      //onceLocationLatest:true,（android）
      interval: 1000, //android设置定位间隔,单位毫秒,默认为2000ms，最低1000ms。（android）
      //httpTimeOut:30000//设置定位请求超时时间,单位是毫秒，默认30000毫秒，不要低于8000毫秒。（android）
      //mockEnable:true,//设置是否允许模拟位置,默认为true，允许模拟位置（android）
      //locationCacheEnable:false//设置是否开启定位缓存机制（android）
    })
  },
  methods: {
    enableBackgroundLocation() {
      //android特有的接口
      //检查是否允许通知，oppo vivo等部分手机默认不允许通知
      if (loc.areNotificationsEnabled()) {
        //是否忽略电池优化，vivo部分手机需要忽略电池优化，保活才不被杀掉
        if (loc.isIgnoringBatteryOptimizations()) {
          loc.enableBackgroundLocation({
            contentTitle: '掌控乾坤',
            contentText: '正在后台运行',
          })
          console.log('enableBackgroundLocation')
        } else {
          //请求忽略电池优化
          loc.requestIgnoreBatteryOptimizations()
        }
      } else {
        //打开设置通知
        loc.openSetting()
      }
    },
    disableBackgroundLocation() {
      //android特有的接口
      //停止后台保活定位服务
      var removeNotification = true
      loc.disableBackgroundLocation(removeNotification)
    },
    startLocation() {
			const platform =uni.getSystemInfoSync().platform
      //开始定位
      loc.startLocation()
			console.log(platform)
			if(platform === 'android') this.enableBackgroundLocation()
      
    },
    stopLocation() {
      //停止定位
      loc.stopLocation()
			this.count=0
			const platform =uni.getSystemInfoSync().platform
			if(platform === 'android') this.enableBackgroundLocation()
    },
    getYMDHMS(timestamp) {
      let time = new Date(timestamp)
      let year = time.getFullYear()
      let month = time.getMonth() + 1
      let date = time.getDate()
      let hours = time.getHours()
      let minute = time.getMinutes()
      let second = time.getSeconds()

      if (month < 10) {
        month = '0' + month
      }
      if (date < 10) {
        date = '0' + date
      }
      if (hours < 10) {
        hours = '0' + hours
      }
      if (minute < 10) {
        minute = '0' + minute
      }
      if (second < 10) {
        second = '0' + second
      }
      return year + '-' + month + '-' + date + ' ' + hours + ':' + minute + ':' + second
    },
  },
}
</script>

<style></style>
