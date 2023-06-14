<template></template>
<script>
import { getMapDistance } from '@/utils'
import { addActionLog, addUserLocation, getUserSchools, getParamConfig, setRedisOnline, modifyPersonInfo } from '@/api/market'
import { mapState } from 'vuex'

// #ifdef APP-PLUS
var loc = uni.requireNativePlugin('AMap-Loc')
// #endif
export default {
  computed: {
    ...mapState(['userPhone', 'orionUserInfo']),
  },
  watch: {
    orionUserInfo: {
      handler(newValue) {
        this.hasToken = false
        if (newValue.token) {
          this.hasToken = true
        }
      },
      immediate: true, // 第一次改变就执行
    },
  },

  data() {
    return {
      hasToken: false,
      platform: uni.getSystemInfoSync().platform,
      timer: null,
      schoolList: [],
      timeInterval: 30000,
      range: ['08:25:00', '22:35:00'],
      lastUptime: uni.getStorageSync('lastUptime'),
    }
  },
  methods: {
    //获取配置信息
    async autoUploadPosition() {
      console.log(uni.getStorageSync('lastUptime'), 'lastUptime')
      if (!this.userPhone) return
      const { brand, system, deviceId } = uni.getSystemInfoSync()
      const data = {
        phone: this.userPhone,
        phoneModel: brand || '未知',
        phoneSystem: system || '未知',
        phoneUniqueCode: deviceId || '未知',
      }
      //修改用户手机配置
      modifyPersonInfo(data)
      //取配置
      try {
        const config = await getParamConfig()
        if (config && config.length > 0) {
          let interval = config.find((item) => item.name == 'FINTERVAL').value
          let from = config.find((item) => item.name == 'T_CHECKSTART').value
          let to = config.find((item) => item.name == 'T_CHECKEND').value
          let treg = /^(\d{2})(:)(\d{2})(:)(\d{2})$/
          if (treg.test(from) && treg.test(to)) this.range = [from, to]
          if (interval) this.timeInterval = Number(interval) * 1000
          // this.timeInterval = 60000
          console.log(this.range, this.timeInterval, 'config')
        }
        // 获取学校配置
        const school = await getUserSchools(this.userPhone)
        this.schoolList = school.filter((item) => item.zuoBiao && item.zuoBiao.includes(',') && !item.zuoBiao.includes('null'))
      } catch (error) {
        this.range = ['08:20:00', '22:35:00']
        this.timeInterval = 30000
        this.schoolList = []
      }
      //判断APP类型
      // #ifdef APP-PLUS
      this.stopLocation()
      this.setLocationConfig()
      // #endif
    },
    //设置持续定位配置
    setLocationConfig() {
      //隐私合规接口
      var isContains = true //隐私权政策是否包含高德开平隐私权政策  true是包含
      var isShow = true //隐私权政策是否弹窗展示告知用户 true是展示
      loc.updatePrivacyShow(isContains, isShow)

      var isAgree = true //隐私权政策是否取得用户同意  true是用户同意
      loc.updatePrivacyAgree(isAgree)

      //判断是否始终允许定位，false 引导用户去设置页面
      var always = loc.grantedAlwaysLocation()
      console.log('always:' + always)
      // 引导用户去设置页面
      if (!always) {
        // loc.openSetting()  权限设置接口
        uni.getLocation({
          type: 'wgs84',
          geocode: true,
          success: function (res) {
            console.log('wgs84定位成功！', res)
          },
          fail: function (err) {
            console.log('wgs84定位err', err.errMsg)
          },
        })
      }

      //设置定位数据回调
      loc.setLocationCallback((res) => {
        if (res.code == 0) {
          //   console.log(res)
          // console.log(res.data.longitude, res.data.latitude, res.data.address)
          this.calcSchoolsDistance(res.data.longitude, res.data.latitude, res.data.address)
        }
      })

      //定位配置
      loc.setLocationOption({
        needAddress: true, //定位是否需要解析地址
        enableHTTPS: true, //(ios）
        allowsBackgroundLocationUpdates: true, //(ios）开启后台定位
        pausesLocationUpdatesAutomatically: false, //(ios）开启后台定位-后台定位是否会被系统自动暂停
        locationAccuracyMode: 1,
        //distanceFilter:1,//(ios）设置定位最小更新距离方法如下，单位米。当两次定位距离满足设置的最小更新距离时，SDK会返回符合要求的定位结果。
        //locationTimeout:5,//单次定位超时时间（ios）
        //reGeocodeTimeout:10,//单次定位地址解析超时时间（ios）
        //onceLocation:true,//定位一次（android）
        //onceLocationLatest:true,（android）
        interval: 2000, //android设置定位间隔,单位毫秒,默认为2000ms，最低1000ms。（android）
        //httpTimeOut:30000//设置定位请求超时时间,单位是毫秒，默认30000毫秒，不要低于8000毫秒。（android）
        //mockEnable:true,//设置是否允许模拟位置,默认为true，允许模拟位置（android）
        //locationCacheEnable:false//设置是否开启定位缓存机制（android）
      })
      //开启定位
      this.startLocation()
      if (this.platform === 'android') {
        this.enableBackgroundLocation()
      }
    },
    // 开启后台
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
    //关闭后台
    disableBackgroundLocation() {
      //android特有的接口
      //停止后台保活定位服务
      var removeNotification = true
      loc.disableBackgroundLocation(removeNotification)
    },
    //开始定位
    startLocation() {
      loc.startLocation()
    },
    //停止定位
    stopLocation() {
      // #ifdef APP-PLUS
      console.log('调用停止定位-------------------------------')
      loc.stopLocation()
      // #endif
    },
    //判断时间间隔上传位置
    validTimeAndDiff() {
      let nowTime = new Date().getTime()
      let bool = false
      this.lastUptime = uni.getStorageSync('lastUptime') || ''

      // 在工作时间
      if (this.validTime()) {
        // 或者第一次进入 时间差大于等于间隔
        if (this.lastUptime) {
          console.log('nowTime - this.lastUptime', nowTime - this.lastUptime)
          if (nowTime - this.lastUptime > this.timeInterval) {
            uni.setStorageSync('lastUptime', nowTime)
            bool = true
          }
        } else {
          uni.setStorageSync('lastUptime', nowTime)
          bool = true
        }
      }
      console.log(
        this.lastUptime,
        bool ? '放行' : '拦截',
        uni.$u.timeFormat(new Date(this.lastUptime), 'hh:MM:ss'),
        uni.$u.timeFormat(new Date(), 'hh:MM:ss')
      )
      return bool
    },
    //判断当前时间是否在打卡时间范围内
    validTime() {
      let date = new Date()
      let h = date.getHours()
      let m = date.getMinutes()
      let s = date.getSeconds()
      let currSec = h * 3600 + m * 60 + s
      let from = this.range[0].split(':')
      let to = this.range[1].split(':')
      let beginSec = Number(from[0]) * 3600 + Number(from[1]) * 60 + Number(from[2])
      let endSec = Number(to[0]) * 3600 + Number(to[1]) * 60 + Number(to[2])
      return currSec > beginSec && currSec < endSec
    },
    //计算是否在学校范围
    calcSchoolsDistance(lng1, lat1, remark) {
      //过滤一些重复的或者没开启定位权限的坐标
      if (lng1 < 0.00000001 || lat1 < 0.00000001) {
        return
      }

      //判断是否在有效时间范围内
      if (!(this.validTimeAndDiff() && this.hasToken)) {
        return
      }

      var isSchool = false
      if (this.schoolList.length) {
        this.schoolList.forEach((item) => {
          if (item.zuoBiao.includes('$')) {
            item.zuoBiao = item.zuoBiao.replace(/[$]/g, '')
          }
          if (item.zuoBiao.includes(',')) {
            let point = item.zuoBiao.split(',')
            let lng2 = point[0]
            let lat2 = point[1]
            let accountId = item.accountId
            let exactRange = item.exactRange
            let distance = getMapDistance({ lng1, lat1, lng2, lat2 })
            if (distance < exactRange) {
              console.log('处于学校范围')
              if (!isSchool) this.signIn(lng1, lat1, accountId, remark)
              //   将标识置为True，不再重复上传位置
              isSchool = true
            }
          }
        })
      }
      //保底上传一次位置
      if (isSchool === false) {
        console.log('不在学校范围')
        this.signIn(lng1, lat1, '', remark)
      }
    },
    //上报位置
    signIn(longitude, latitude, locationName, remark) {
      const phoneCode = uni.getSystemInfoSync().deviceId
      let paramsData = {
        latitude,
        locationName,
        longitude,
        mobilePhone: this.userPhone,
        remark: remark,
        status: 'ONLINE',
        localVersion: this.$appVersion,
        phoneCode: phoneCode,
      }

      //处理Iphone详细地址解析失败问题
      if (remark) {
        addUserLocation(paramsData)
          .then((res) => {
            console.log(paramsData)
            console.log(paramsData.remark, res, 'Android上报位置成功')
          })
          .catch(() => {
            console.log(paramsData.remark, res, '上报位置失败')
            uni.setStorageSync('lastUptime', new Date().getTime())
          })
      } else {
        this.analysisAddress(longitude, latitude)
          .then((res) => {
            paramsData.remark = res
            addUserLocation(paramsData).then((res) => {
              console.log(paramsData.remark, res, 'IOS上报位置成功')
            })
          })
          .catch((err) => {
            paramsData.remark = err
            addUserLocation(paramsData)
            uni.setStorageSync('lastUptime', new Date().getTime())
          })
      }
    },
    //解析经纬度
    analysisAddress(longitude, latitude) {
      let api = `https://restapi.amap.com/v3/geocode/regeo?output=json&radius=1000&extensions=all&`
      let key = '297d5789a369cd3beb93f9b880603404'
      return new Promise((resolve, reject) => {
        uni.request({
          url: api + `location=${longitude},${latitude}&key=${key}`,
          method: 'GET',
          dataType: 'json',
          success: function (res) {
            const remark = res.data.regeocode.formatted_address || '当前经纬度: ' + longitude + ',' + latitude
            resolve(remark)
            console.log('解析成功')
          },
          fail: function () {
            const remark = '位置解析失败' + uni.$u.timeFormat(new Date(), 'yyyy-mm-dd hh:MM:ss')
            reject(remark)
          },
        })
      })
    },
    //设置在线redis
    setRedis() {
      if (this.userPhone) setRedisOnline(this.userPhone)
    },
    //添加Log
    addLog(str) {
      if (this.userPhone) addActionLog({ phone: this.userPhone, action: str })
    },
    //重写安卓APP默认关闭的功能，而是退至后台
    moveToBack() {
      // #ifdef APP-PLUS
      if (this.platform === 'android') {
        // 隐藏“再按一次退出应用”的提示，将应用隐藏至后台
        let main = plus.android.runtimeMainActivity()
        plus.runtime.quit = function () {
          main.moveTaskToBack(false)
        }
        //重写提示：如果提示为 ‘再按一次退出应用’ 就隐藏应用，其他提示正常显示
        plus.nativeUI.toast = function (str) {
          console.log('再按一次退出应用')
          if (str == '再按一次退出应用') {
            main.moveTaskToBack(false)
            return false
          } else {
            uni.showToast({
              title: str,
              icon: 'none',
            })
          }
        }
      }
      // #endif
    },
  },
}
</script>
