<script>
import { getMapDistance } from '@/utils'
import { addActionLog, addUserLocation, getUserSchools, getParamConfig, setRedisOnline } from '@/api/market'
import { mapState } from 'vuex'
import Location from '@/utils/location'
const aMapHelper = uni.requireNativePlugin('SLY-AMapHelper')
export default {
  onLaunch: function () {
    // #ifdef APP-PLUS
    this.moveToBack()
    // #endif
    this.setRedis()
    this.addLog('APP 首次加载')
  },
  onShow: function () {
    this.addLog('App 进入前台')
  },
  onHide: function () {
    this.addLog('App 进入后台')
  },
  computed: {
    ...mapState(['userPhone']),
  },
  data() {
    return {
      Locations: {},
      schoolList: [],
      addrTimer: null,
      addrInterval: 30000,
      range: ['08:25:00', '22:35:00'],
      watchLocation: null,
      locationPool: [], // 定位坐标点集合
      lastUptime: uni.getStorageSync('lastUptime'),
    }
  },
  methods: {
    hasToken() {
      return uni.getStorageSync('USER_TOKEN')
    },
    //设置在线redis
    setRedis() {
      if (this.userPhone && this.hasToken()) {
        setRedisOnline(this.userPhone)
      }
      //3分钟推送一次
      setTimeout(() => {
        this.setRedis()
      }, 18000)
    },
    //添加Log
    addLog(str) {
      if (this.userPhone && this.hasToken()) {
        addActionLog({
          phone: this.userPhone,
          action: str,
        }).then(() => {
          console.log(str)
        })
      }
    },
    //重写安卓APP默认关闭的功能，而是退至后台
    moveToBack() {
      if (uni.getSystemInfoSync().platform === 'android') {
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
    },
    //获取配置信息
    autoUploadPosition() {
      if (!this.userPhone || !this.hasToken()) return
      //取配置
      getParamConfig().then((res) => {
        if (res && res.length > 0) {
          try {
            let interval = res.filter((item) => item.name == 'FINTERVAL')[0].value
            let from = res.filter((item) => item.name == 'T_CHECKSTART')[0].value
            let to = res.filter((item) => item.name == 'T_CHECKEND')[0].value
            let treg = /^(\d{2})(:)(\d{2})(:)(\d{2})$/
            if (treg.test(from) && treg.test(to)) this.range = [from, to]
            if (interval) this.addrInterval = Number(interval) * 1000
            console.log(interval, 'interval')
            this.addrInterval = 900000
          } catch (error) {
            this.range = ['08:20:00', '22:35:00']
            this.addrInterval = 30000
          }
        }

        // 获取学校配置
        getUserSchools(this.userPhone).then((res) => {
          this.schoolList = res
          //判断APP类型
          // #ifdef APP-PLUS
          if (uni.getSystemInfoSync().platform === 'android') {
            this.androidStart()
          } else if (uni.getSystemInfoSync().platform === 'ios') {
            this.iosStart()
          }
          // #endif
        })
      })
    },

    /**android持续定位方法 */
    //开启安卓连续定位
    androidStart() {
      aMapHelper.trackLocation(
        {
          intervalTime: 3000, //定位间隔时间 , 毫秒-30000-30s定位一次
          spacing: 0, //有效移动距离，超过该值才会回调
          coordType: 'gcj02',
          notificationTitle: '汇博位置服务',
          notificationContent: '正在使用地理位置',
          isAlwaysAsk: uni.getStorageSync('isAlwaysAsk') === '',
        },
        (res) => {
          //调试时请以控制台日志是否持续打印为准，息屏后view页面可能不会更新result结果
          // console.log('【持续定位结果】', `时间：${res.formatTime},坐标：${res.address}`)
          if (res.errorCode == 0) {
            uni.setStorageSync('isAlwaysAsk', false)
            // 计算是否在学校范围内
            this.calcSchoolsDistance(res.longitude, res.latitude, res.address)
          } else if (res.errorCode == 12) {
            let deniedPermissionAndNoAsk = res.deniedPermissionAndNoAsk
            uni.showModal({
              title: '提示',
              content: res.errorInfo,
              success: (res) => {
                if (res.confirm && deniedPermissionAndNoAsk) {
                  aMapHelper.openSettingPage()
                }
              },
            })
          } else {
            this.addLog('Android定位失败')
            console.log('其它错误', `${res.errorCode}:${res.errorInfo}`)
          }
        }
      )
    },
    //停止安卓定位
    stopLocation() {
      aMapHelper.stopLocation()
    },

    /**ios持续定位方法 */
    iosStart() {
      let _this = this
      if (this.watchLocation) {
        plus.geolocation.clearWatch(this.watchLocation)
        this.watchLocation = null
      }
      let locationParams = {
        enableHighAccuracy: true, //高精度-没啥用-还是取不到解析后的经纬度
        geocode: true, // 是否解析地址信息
        maximumAge: 3000, // 每次间隔时间-实测没啥用-watchPostion会在非常短的时间间隔内不停执行
        coordsType: 'gcj02', //坐标的格式
        provider: 'amap', //什么类型的坐标
        timeout: 3000, // 超时时间
      }
      _this.watchLocation = plus.geolocation.watchPosition(
        function (res) {
          // console.log(res.coords, 'iphone定位结果')
          _this.calcSchoolsDistance(res.coords.longitude, res.coords.latitude, '')
        },
        function (err) {
          //此函数监听3次后，就报监听超时，然后就停止监听了，如果不设超时时间就一直没有返回位置,只好在失败回调函数中重新唤起
          // console.log('IOS定位失败', err)
          // _this.addLog('IOS定位失败,尝试重新开启定位')
          if (_this.watchLocation) {
            plus.geolocation.clearWatch(_this.watchLocation)
            _this.watchLocation = null
            setTimeout(() => {
              _this.iosStart()
            }, 100)
          }
        },
        locationParams
      )
    },

    //判断时间间隔上传位置
    validTimeAndDiff() {
      let nowTime = new Date().getTime()
      let bool = false
      this.lastUptime = uni.getStorageSync('lastUptime')
      // 在工作时间
      if (this.validTime()) {
        //时间差大于等于间隔
        if (this.lastUptime) {
          if (nowTime - this.lastUptime > this.addrInterval) {
            this.lastUptime = nowTime
            uni.setStorageSync('lastUptime', this.lastUptime)
            bool = true
          } else bool = false
        } else {
          this.lastUptime = nowTime
          uni.setStorageSync('lastUptime', this.lastUptime)
          bool = true
        }
      }
      console.log('时间范围' + bool, uni.$u.timeFormat(new Date(this.lastUptime), 'hh:MM:ss'), uni.$u.timeFormat(new Date(), 'hh:MM:ss'))
      return bool
    },
    //判断当前时间是否在打卡有效时间内
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
      if (currSec > beginSec && currSec < endSec) {
        return true
      } else {
        return false
      }
    },
    //计算是否在学校范围
    calcSchoolsDistance(lng1, lat1, remark) {
      //过滤一些重复的或者没开启定位权限的坐标
      if (lng1 < 0.00000001 || lat1 < 0.00000001) {
        return
      }
      // console.log('位置', lng1, lat1, remark)
      var isSchool = false
      //判断时间间隔，判断是否有效Token
      if (this.hasToken() && this.validTimeAndDiff()) {
        console.log('this.schoolList', this.schoolList)
        if (this.schoolList.length) {
          this.schoolList.forEach((item) => {
            if (item.zuoBiao && item.zuoBiao.includes(',') && !item.zuoBiao.includes('null')) {
              if (item.zuoBiao.includes('$')) {
                item.zuoBiao = item.zuoBiao.replace(/[$]/g, '')
              }

              let point = item.zuoBiao.split(',')
              let lng2 = point[0]
              let lat2 = point[1]
              let accountId = item.accountId
              let exactRange = item.exactRange
              let dis = getMapDistance({ lng1, lat1, lng2, lat2 })
              if (dis < exactRange) {
                console.log('处于学校范围')
                if (!isSchool) this.signIn(lng1, lat1, accountId, remark)
                isSchool = true
              }
            }
          })
        }
        if (isSchool === false) {
          console.log('不在学校范围')
          this.signIn(lng1, lat1, '', remark)
        }
      }
    },
    //上报位置
    signIn(longitude, latitude, locationName, remark) {
      uni.getSystemInfo({
        success: (system) => {
          let phone = this.userPhone
          let paramsData = {
            latitude,
            locationName,
            longitude,
            mobilePhone: phone,
            remark: remark,
            status: 'ONLINE',
            localVersion: this.$appVersion,
            phoneCode: system.deviceId,
          }
          console.log(paramsData, 'paramsData')
          //处理Iphone经纬度解析问题
          if (remark) {
            addUserLocation(paramsData)
              .then((res) => {
                console.log(paramsData.remark, res, '上报位置成功')
              })
              .catch(() => {
                console.log(paramsData.remark, res, '上报位置失败')
                this.lastUptime = new Date().getTime()
                uni.setStorageSync('lastUptime', this.lastUptime)
              })
          } else {
            let api = `https://restapi.amap.com/v3/geocode/regeo?output=json&radius=1000&extensions=all&`
            let key = '297d5789a369cd3beb93f9b880603404'
            uni.request({
              url: api + `location=${longitude},${latitude}&key=${key}`,
              method: 'GET',
              dataType: 'json',
              success: function (res) {
                console.log('解析成功')
                paramsData.remark = res.data.regeocode.formatted_address || '当前经纬度: ' + longitude + ',' + latitude
                // 计算是否在学校范围内
                addUserLocation(paramsData).then((res) => {
                  console.log(paramsData.remark, res)
                })
              },
              fail: function () {
                paramsData.remark = '位置解析失败' + uni.$u.timeFormat(new Date(), 'yyyy-mm-dd hh:MM:ss')
                // 计算是否在学校范围内
                addUserLocation(paramsData).then((res) => {
                  console.log(paramsData.remark, res)
                })
                this.lastUptime = new Date().getTime()
                uni.setStorageSync('lastUptime', this.lastUptime)
                console.log(paramsData.remark)
              },
            })
          }
        },
      })
    },

    getTime() {
      let date = new Date()
      let time =
        date.getFullYear() +
        '-' +
        this.numberFormat(date.getMonth() + 1) +
        '-' +
        this.numberFormat(date.getDate()) +
        ' ' +
        this.numberFormat(date.getHours()) +
        ':' +
        this.numberFormat(date.getMinutes()) +
        ':' +
        this.numberFormat(date.getSeconds())
      return time
    },
    //加0
    numberFormat(num) {
      if (typeof num == 'String') num = Number(num)
      return num < 10 ? '0' + num : num
    },
  },
}
</script>

<style lang="scss">
@import '@/common/uni.css';
@import '@/styles/index.scss';
page {
  height: 100%;
  width: 100%;
  position: relative;
}

@import 'uview-ui/index.scss'; /*每个页面公共css */
</style>
