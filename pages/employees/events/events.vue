<template>
  <view class="component-container">
    <view class="section-content map-wrapper">
      <!-- <view class="title-line">地图展示</view> -->
      <qiun-title-bar title="打卡定位" />
      <view class="map-container">
        <map
          style="width: 100%; height: 100%"
          :latitude="latitude"
          :longitude="longitude"
          :markers="markers"
          :show-location="true"
          :controls="controls"
          id="mymap"
          @markertap="clickmarker"
          v-if="mapInitFlag"
        >
          <cover-image class="control-location" @click="mylocation" src="/static/map/mark/location.png"></cover-image>
        </map>
        <view class="myloading" v-else><u-loading-icon text="定位中..." textSize="16"></u-loading-icon></view>
      </view>
    </view>
    <view class="button-wrapper">
      <view class="button-submit" @click="getAddr(1)">打卡</view>
    </view>
    <view class="section-content trail-wrapper">
      <qiun-title-bar title="最近轨迹" />

      <view class="scroll-wrapper">
        <view class="list-wrapper" v-if="listData.length > 0">
          <view class="cn-item-list">
            <view class="cn-item cn-item-first">
              <view class="index"> 序号 </view>
              <view class="info"> 实时位置 </view>
              <view class="time"> 时间 ({{ listData.length }}条) </view>
            </view>
            <view class="cn-item" v-for="item in showListData" :key="item.id" @click="mapItemClick(item.id)">
              <view class="index">
                {{ item.rank }}
              </view>
              <view class="info">
                {{ item.name }}
              </view>
              <view class="time">
                {{ item.time }}
              </view>
            </view>
          </view>
        </view>
        <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
      </view>
    </view>
    <u-modal :show="mshow" :title="mtitle" :closeOnClickOverlay="true" @confirm="mconfirm">
      <view class="slot-content">
        <rich-text :nodes="mcontent"></rich-text>
      </view>
    </u-modal>
  </view>
</template>

<script>
import ListScroll from '../listScroll/listScroll'
import { getUserLocation, addUserLocation, getParamConfig, getUserSchools, getPersonLocation } from '@/api/market'
import { getMapDistance } from '@/utils'
import { mapState } from 'vuex'

export default {
  props: ['userName'],
  components: {
    ListScroll,
  },
  computed: {
    ...mapState({ orionUserInfo: (state) => state.orionUserInfo }),
    scrollWrapperHeight() {
      return this.listData.length < 10 ? 80 * this.listData.length + 'rpx' : '800rpx'
    },
    showListData() {
      var end = this.listPage * this.listSize
      return this.listData.slice(0, end)
    },
    isMine() {
      if (this.currPhone == null || this.orionUserInfo.phone == null) {
        return true
      }

      return this.currPhone == this.orionUserInfo.phone
    },
  },
  data() {
    return {
      clockInterval: 0,

      dateBegin: '05:00:00', //考勤计入默认开始时间
      dateEnd: '23:00:00', //考勤计入默认结束时间
      mapMarkerUser: require('@/static/map/mark/markred.png'),
      mapMarkerIcon: require('@/static/map/mark/markblue.png'),
      mapMarkerUserLocation: require('@/static/map/mark/markred.png'),
      mapMarkerSchool: require('@/static/map/mark/school.png'),
      markerWidth: 35,
      markerHeight: 35,
      mapControls: [
        {
          id: 1,
          position: {
            left: '20rpx',
            top: '20rpx',
            width: this.markerWidth,
            height: '70rpx',
          },
          iconPath: require('@/static/map/mark/location.png'),
          clickable: true,
        },
      ],
      controls: [
        {
          //在地图上显示控件，控件不随着地图移动
          id: 1, //控件id
          iconPath: '../../../static/map/mark/location.png', //显示的图标
          position: {
            //控件在地图的位置
            left: 15,
            top: 15,
            width: 50,
            height: 50,
          },
        },
      ],
      listDataTest: [
        {
          id: 101,
          rank: 1,
          name: '苏州W酒店',
          time: '2022-01-01 8:30:21',
        },
        {
          id: 102,
          rank: 2,
          name: '苏州东方之门',
          time: '2022-01-01 8:30:21',
        },
      ],
      listPage: 1,
      listSize: 10,
      listTotalPage: 1,
      listData: [],
      latitude: null,
      longitude: null,
      markers: [
        {
          id: 101,
          latitude: 31.32463716984,
          longitude: 120.80305539166,
          iconPath: '../../../static/map/mark/location_50.png',
          width: this.markerWidth,
          height: this.markerHeight,
        },
      ],
      dataList: [
        {
          id: 1,
          title: '用户信息',
          note: '经纬度',
          time: '2022',
        },
      ],
      schoolList: [],
      mapInitFlag: false,
      addrTimer: null,
      addrInterval: 30000,
      mapLocationList: [],
      currPhone: null,
      mshow: false,
      mtitle: '位置信息',
      mcontent: '',
      mapctx: null,
      myLocation: null,
      params: {},
    }
  },

  methods: {
    mapTouchStart(event) {
      console.log('mapTouchStart', event)
      event.preventDefault()
      event.stopPropagation()
    },
    mapTouchMove(event) {
      console.log('mapTouchMove', event)
      event.preventDefault()
      event.stopPropagation()
    },
    mapTouchEnd(event) {
      console.log('mapTouchEnd', event)
      event.preventDefault()
      event.stopPropagation()
    },
    initPage(params) {
      console.log(params, 'init11')
      this.initData()
      this.getCardConfig()
      const phone = params.mobilePhone
      this.currPhone = phone
      this.params = params
      // 地图初始化
      // this.mapInit()
      // this.getLocationList(params)
      this.getMapLocations(params)
    },
    initData() {
      this.listData = []
      this.markers = []
      this.mapInitFlag = false
      this.longitude = null
      this.latitude = null
      this.mapLocationList = []
    },
    mylocation() {
      if (this.myLocation) {
        this.mapctx.moveToLocation({
          longitude: this.myLocation.longitude,
          latitude: this.myLocation.latitude,
        })
      } else {
        uni.showToast({
          title: '未获取到您当前位置',
          duration: 2000,
          icon: 'none',
        })
      }
    },
    getCardConfig() {
      getParamConfig().then((res) => {
        try {
          this.clockInterval = res.filter((item) => item.name == 'FINTERVAL')[0].value
          this.dateBegin = res.filter((item) => item.name === 'T_QUERYCHECKFROM')[0].value
          this.dateEnd = res.filter((item) => item.name === 'T_QUERYCHECKTO')[0].value
        } catch (error) {}
      })
    },

    getLocationList(params) {
      // {
      //   id: 101,
      //   rank: 1,
      //   name: '苏州W酒店',
      //   time: '2022-01-01 8:30:21',
      // }
      var listData = []
      // var markers = []
      getUserLocation(params).then((res) => {
        console.log('getUserLocation', res)
        if (res.length > 0) {
          res.forEach((item, index) => {
            var locationItem = {
              id: item.id,
              rank: index + 1,
              name: item.locationName || item.remark,
              time: item.createdTime,
              latitude: item.latitude,
              longitude: item.longitude,
            }

            // if (item.longitude && item.latitude && item.latitude < 100) {
            // var markerItem = {
            // 	id: item.id,
            // 	latitude: item.latitude,
            // 	longitude: item.longitude,
            // 	// iconPath: 'https://www.huiborobot.com.cn:3183/static/avatar.png',
            // 	// iconPath: '../../../static/map/mark/avatar.png',
            // 	iconPath: this.mapMarkerUser,
            // 	width: this.markerWidth,
            // 	height: this.markerHeight,
            // }
            // markers.push(markerItem)
            // }
            // 非查看自己
            if (this.currPhone != this.orionUserInfo.phone && index == 0) {
              if (item.longitude && item.latitude && item.latitude < 100) {
                var markerItem = {
                  id: item.id,
                  latitude: item.latitude,
                  longitude: item.longitude,
                  iconPath: this.mapMarkerUserLocation,
                  width: this.markerWidth,
                  height: '70rpx',
                }

                this.markers.push(markerItem)
                this.mapLocationList.push({
                  id: item.id,
                  locationName: item.locationName || item.remark,
                  time: item.createdTime,
                  zuoBiao: item.longitude + ',' + item.latitude,
                })

                this.longitude = item.longitude
                this.latitude = item.latitude
              }
            }
            listData.push(locationItem)
          })
          this.listData = listData
          this.listTotalPage = Math.ceil(listData.length / this.listSize)

          console.log('this.markers', this.markers)
        }
        // 地图初始化
        this.mapInit()
      })
    },
    nextPage() {
      console.log(this.listPage + ':' + this.listTotalPage)
      if (this.listPage < this.listTotalPage) {
        this.listPage++
      }
    },
    // 先获取用户地图上的打卡点 再获取用户所有的打卡点(是为了强调显示当前用户最新的一个打卡点位) 再去渲染地图
    getMapLocations(params) {
      var markers = []
      var mapLocationList = []
      getPersonLocation(params.mobilePhone).then((res) => {
        console.log('getPersonLocation', res)
        if (res.length > 0) {
          res.forEach((item, index) => {
            if (!item.id) item.id = 'index' + index
            if (item.zuoBiao && item.zuoBiao.indexOf(',') > 0) {
              var point = item.zuoBiao.split(',')
              var lng = point[0]
              var lat = point[1]
              var calloutTitle = item.time ? item.time.substring(5, 10) : '异常'
              if (lng && lat && lat < 100) {
                var markerItem = {
                  id: item.id,
                  latitude: lat,
                  longitude: lng,
                  iconPath: this.mapMarkerUser,
                  width: this.markerWidth,
                  height: this.markerHeight,
                  callout: {
                    content: calloutTitle,
                    color: '#ffffff',
                    fontSize: '26rpx',
                    borderRadius: '6rpx',
                    borderWidth: '6rpx',
                    bgColor: '#00c16f',
                    padding: '0rpx 10rpx',
                    display: 'ALWAYS',
                    textAlign: 'center',
                  },
                }
                mapLocationList.push(item)
                markers.push(markerItem)
              }
            }
          })
        }
        this.markers = markers
        this.mapInitFlag = true
        this.mapLocationList = mapLocationList
        this.mapctx = uni.createMapContext('mymap', this)
        // console.log('this.mapctx', this.mapctx)
        this.getLocationList(params)
      })
    },
    getSchoolsList(phone) {
      var _this = this
      getUserSchools(phone).then((res) => {
        console.log('getUserSchools', res)
        if (res) {
          this.schoolList = res
          res.forEach((item, index) => {
            if (item.zuoBiao && item.zuoBiao.indexOf(',') > 0) {
              var point = item.zuoBiao.split(',')
              var lng2 = point[0]
              var lat2 = point[1]
              var accountName = item.accountName
              var pointId = 'aa' + index
              var markerItem = {
                id: pointId,
                latitude: lat2,
                longitude: lng2,
                iconPath: _this.mapMarkerSchool,
                width: '80rpx',
                height: '80rpx',
                title: accountName,
                callout: {
                  content: accountName,
                  color: '#ffffff',
                  fontSize: '26rpx',
                  borderRadius: '6rpx',
                  borderWidth: '6rpx',
                  bgColor: '#00c16f',
                  padding: '0rpx 10rpx',
                  display: 'ALWAYS',
                  textAlign: 'center',
                },
              }

              if (_this.mapLocationList.every((a) => a.id !== pointId)) {
                _this.markers.push(markerItem)
                _this.mapLocationList.push({
                  id: pointId,
                  locationName: accountName,
                  time: _this.getTime(),
                  zuoBiao: item.zuoBiao,
                  type: 'school',
                })
              }
            }
          })
        }
      })
    },
    mapInit() {
      var _this = this
      // var lng1 = 120.795073, lat1 = 31.318293, lng2 = 120.80021021344031, lat2 = 31.325789772435247
      // var dis = getMapDistance({lng1, lat1, lng2, lat2})
      // console.log('getMapDistance',dis)
      uni.getLocation({
        type: 'wgs84',
        geocode: true,
        success: function (res) {
          console.log('mapInit', res)
          if (res) {
            var longitude = res.longitude
            var latitude = res.latitude
            if (longitude && latitude) {
              // 只有查看自己的时候会定位到自己当前位置 否则切换到选择用户的最新位置
              if (_this.longitude == null) {
                _this.longitude = longitude
                _this.latitude = latitude
              }
              _this.myLocation = {
                longitude,
                latitude,
              }
              var pointId = 'localLocation'
              var markerItem = {
                id: pointId,
                latitude: latitude,
                longitude: longitude,
                iconPath: _this.mapMarkerIcon,
                // iconPath: 'https://www.huiborobot.com.cn:3183/static/location_50.png',
                // iconPath: '../../../static/map/mark/location_50.png',
                width: _this.markerWidth,
                height: _this.markerHeight,
              }
              var addrinfo = '经纬度: ' + longitude + ',' + latitude
              if (res.address) {
                var address = res.address
                addrinfo =
                  address.province +
                  ' ' +
                  address.city +
                  address.district +
                  address.street +
                  address.streetNum +
                  ' \r\n周边:' +
                  address.poiName
              }

              if (_this.mapLocationList.every((a) => a.id !== pointId)) {
                _this.markers.push(markerItem)
                _this.mapLocationList.push({
                  id: pointId,
                  locationName: addrinfo,
                  time: _this.getTime(),
                  zuoBiao: longitude + ',' + latitude,
                })
              }
            }
          }
        },
        fail: function (err) {
          console.log('err.errMsg', err.errMsg)
          if (err.errMsg) {
            uni.showToast({
              title: '定位失败',
              duration: 2000,
              icon: 'none',
            })
          }
          console.log('location err', err)
          if (_this.longitude == null && _this.myLocation != null) {
            _this.longitude = _this.myLocation.longitude
            _this.latitude = _this.myLocation.latitude
          }
        },
        complete: function () {
          console.log('location complete')
          _this.$emit('pullDownRefreshComplete')
          // 获取用户关联的学校, 使用登录的用户作为打卡用户 不能代替他人定位打卡
          _this.getSchoolsList(_this.currPhone)
        },
      })
    },
    getTime() {
      var date = new Date()
      var Y = date.getFullYear()
      var M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
      var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      var hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
      var mm = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
      var ss = date.getSeconds() < 10 ? '0' + date.getDate() : date.getSeconds()
      return Y + '-' + M + '-' + D + ' ' + hh + ':' + mm + ':' + ss
    },
    clickmarker(e) {
      // console.log('marker click', e, this.mapLocationList)
      var markerId = e.detail.markerId
      var addr = '',
        time = ''
      var lng1 = '',
        lat1 = ''
      var type = ''
      this.mapLocationList.forEach((item) => {
        if (item.id == markerId) {
          addr = item.locationName
          time = item.time
          var point = item.zuoBiao.split(',')
          lng1 = point[0]
          lat1 = point[1]
          if (item.type) type = item.type
        }
      })
      console.log('e.detail', e.detail, markerId, type)
      addr = addr.replace(/<br>/g, '')
      // 两个特殊点 一个1是自己的位置 一个2是当前查看的用户最新的位置
      if (markerId == 1) {
        uni.showModal({
          title: '打卡信息',
          content: '您当前位置为: ' + addr + ', \r\n当前时间: ' + time,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          },
        })

        // this.mcontent = '您当前位置为: '+addr + ' <br>当前时间: ' + time
        // this.mshow = true
      } else if (markerId == 2) {
        var userName = this.userName || '当前员工'
        uni.showModal({
          title: '打卡信息',
          content: userName + ' 的最新位置: ' + addr + ', \r\n更新时间: ' + time,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          },
        })
        // uview弹窗层级低 暂不使用
        // this.mcontent = userName + ' 的最新位置: ' + addr + '<br>更新时间: '+ time
        // this.mshow = true
      } else if (type == 'school') {
        var lng2 = this.myLocation.longitude
        var lat2 = this.myLocation.latitude
        var content = addr
        if (lng1 && lat1 && lng2 && lat2) {
          var dis = getMapDistance({ lng1, lat1, lng2, lat2 })
          dis = parseInt(dis)
          content = content + ', \r\n距你当前位置 ' + dis + '米'
        }

        uni.showModal({
          title: '学校信息',
          content: content,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          },
        })
      } else {
        // this.mcontent = '打卡位置: ' + addr + '<br>打卡时间: '+ time
        // this.mshow = true
        uni.showModal({
          title: '打卡信息',
          content: '打卡位置: ' + addr + ', \r\n打卡时间: ' + time,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          },
        })
      }
    },
    getAddr() {
      var _this = this
      const clockTimer = uni.getStorageSync('clockTimer')
      console.log(this.clockInterval)
      if (clockTimer) {
        if (new Date().getTime() - uni.getStorageSync('clockTimer') < Number(this.clockInterval) * 1000) {
          const interval = parseInt(this.clockInterval - (new Date().getTime() - uni.getStorageSync('clockTimer')) / 1000)
          const points = Math.floor(interval / 60)
          const seconds = interval % 60
          uni.showToast({
            title: `请于${points}分${seconds}秒后再打卡`,
            duration: 2000,
            icon: 'none',
          })
          return
        }
      }

      uni.setStorageSync('clockTimer', new Date().getTime())

      uni.showLoading({
        title: '定位中',
        mask: true,
      })
      // gcj02 高德定位key不支持iphone定位了
      uni.getLocation({
        type: 'wgs84',
        geocode: true,
        success: function (res) {
          console.log('当前位置的经度：' + res.longitude)
          console.log('当前位置的纬度：' + res.latitude)
          // var addrinfo = '经纬度: ' + res.longitude + ',' + res.latitude
          var addrinfo = ''
          if (res.address) {
            var address = res.address
            addrinfo =
              address.province + ' ' + address.city + address.district + address.street + address.streetNum + ' \r\n周边:' + address.poiName
          }

          uni.hideLoading()

          _this.calcSchoolsDistance(res.longitude, res.latitude, addrinfo, 1)
        },
        fail: function (err) {
          console.log('err', err)
          uni.hideLoading()
          if (err.errMsg && show == 1) {
            uni.showToast({
              title: err.errMsg,
              duration: 2000,
              icon: 'none',
            })
          }
        },
      })
    },
    calcSchoolsDistance(lng1, lat1, remark, show) {
      var isSchool = false
      this.schoolList.forEach((item) => {
        if (item.zuoBiao && item.zuoBiao.includes(',') && !item.zuoBiao.includes('null')) {
          if (item.zuoBiao.includes('$')) {
            item.zuoBiao = item.zuoBiao.replace(/[$]/g, '')
          }
          var point = item.zuoBiao.split(',')
          var lng2 = point[0]
          var lat2 = point[1]
          var accountId = item.accountId
          var exactRange = item.exactRange
          var dis = getMapDistance({ lng1, lat1, lng2, lat2 })

          var accountName = item.accountName
          if (dis < exactRange) {
            if (!isSchool) {
              this.signIn(lng1, lat1, accountId, remark)
              if (show == 1) {
                uni.showToast({
                  title: '您当前所在学校:' + accountName,
                  duration: 2000,
                  icon: 'none',
                })
              }
            }

            isSchool = true
          }
        }
      })
      if (isSchool === false) {
        this.signIn(lng1, lat1, '', remark)
      }
    },
    //计算是否在考勤范围中
    nowInDateBetwen() {
      var date = new Date() //获取当前时间
      var h = date.getHours()
      var m = date.getMinutes()
      var s = date.getSeconds()
      var currSec = h * 3600 + m * 60 + s
      var from = this.dateBegin.split(':')
      var to = this.dateEnd.split(':')
      var dateBegin = Number(from[0]) * 3600 + Number(from[1]) * 60 + Number(from[2])
      var dateEnd = Number(to[0]) * 3600 + Number(to[1]) * 60 + Number(to[2])
      if (currSec > dateEnd) {
        return `打卡异常! \n打卡已过最晚时间，请于${this.dateEnd}之前打卡`
      } else if (currSec < dateBegin) {
        return `打卡异常! \n打卡没到开始时间，请于${this.dateBegin}之后打卡`
      } else {
        return ''
      }
    },

    signIn(longitude, latitude, locationName, remark) {
      var data = {
        latitude,
        locationName,
        longitude,
        mobilePhone: this.orionUserInfo.phone,
        remark: remark,
        status: 'HANDLE',
        localVersion: this.$appVersion,
      }
      const validStr = this.nowInDateBetwen()
      if (validStr) {
        uni.showToast({
          title: validStr,
          duration: 2000,
          icon: 'none',
        })
      } else {
        if (remark) {
          addUserLocation(data).then((res) => {
            console.log('addUserLocation', res)
            const list = [
              '\n世界会向那些有目标和有远见的人让路！',
              '\n世界上没有完不成的故事，只有未死之心！',
              '\n推销工作的首要之处就是勤劳',
              '\n加油！今天也要元气满满',
            ]
            let word = ''
            if (this.validAfterWork()) {
              word = '\n 您一定累了，好好放松一下吧！'
            } else {
              word = list[this.getRand(0, 4)]
            }
            //重新获取打卡记录
            this.getLocationList(this.params)
            uni.showToast({
              title: ` 打卡成功！${word}`,
              duration: 2000,
              icon: 'none',
            })
          })
        } else {
          let api = `https://restapi.amap.com/v3/geocode/regeo?output=json&radius=1000&extensions=all&`
          let key = '9c5273840e6cb30d4582536feabf6009'
          var that = this
          uni.request({
            url: api + `location=${longitude},${latitude}&key=${key}`,
            method: 'GET',
            dataType: 'json',
            success: function (res) {
              console.log('解析成功')
              data.remark = res.data.regeocode.formatted_address || '当前经纬度: ' + longitude + ',' + latitude

              addUserLocation(data).then((res) => {
                console.log('addUserLocation', res)
                const list = [
                  '\n世界会向那些有目标和有远见的人让路！',
                  '\n世界上没有完不成的故事，只有未死之心！',
                  '\n推销工作的首要之处就是勤劳',
                  '\n加油！今天也要元气满满',
                ]
                let word = ''
                if (that.validAfterWork()) {
                  word = '\n 您一定累了，好好放松一下吧！'
                } else {
                  word = list[that.getRand(0, 4)]
                }
                //重新获取打卡记录
                that.getLocationList(that.params)
                uni.showToast({
                  title: ` 打卡成功！${word}`,
                  duration: 2000,
                  icon: 'none',
                })
              })
            },
            fail: function () {
              data.remark = '位置解析失败' + uni.$u.timeFormat(new Date(), 'yyyy-mm-dd hh:MM:ss')

              addUserLocation(data).then((res) => {
                console.log('addUserLocation', res)
                const list = [
                  '\n世界会向那些有目标和有远见的人让路！',
                  '\n世界上没有完不成的故事，只有未死之心！',
                  '\n推销工作的首要之处就是勤劳',
                  '\n加油！今天也要元气满满',
                ]
                let word = ''
                if (that.validAfterWork()) {
                  word = '\n 您一定累了，好好放松一下吧！'
                } else {
                  word = list[that.getRand(0, 4)]
                }
                //重新获取打卡记录
                that.getLocationList(that.params)
                uni.showToast({
                  title: ` 打卡成功！${word}`,
                  duration: 2000,
                  icon: 'none',
                })
              })
            },
          })
        }
      }
    },
    getRand(min, max) {
      return parseInt(Math.random() * (max - min)) + min
    },
    //判断是否下班
    validAfterWork() {
      var date = new Date()
      var h = date.getHours()
      var m = date.getMinutes()
      var s = date.getSeconds()
      var currSec = h * 3600 + m * 60 + s
      var endSec = 17 * 3600 + 30 * 60
      return currSec > endSec
    },

    getTime() {
      var date = new Date()
      var time =
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
    numberFormat(num) {
      if (typeof num == 'String') num = Number(num)
      return num < 10 ? '0' + num : num
    },
    mconfirm() {
      this.mshow = false
    },
    mapItemClick(id) {
      console.log(id, this.markers)
      var _this = this
      this.listData.forEach((item, index) => {
        if (item.id == id) {
          // this.modal(item.name+'<br>更新时间: '+ item.time)
          var content = item.name.replace(/<br>/g, '')

          var isexist = false
          this.markers.forEach((mitem) => {
            if (mitem.id == item.id) isexist = true
          })
          var islocation = false
          if (item.latitude && item.longitude) {
            islocation = true
          }
          if (isexist == false && item.latitude && item.longitude) {
            // 如果是他人第一条忽略 已经默认地图展示第一条了
            if (this.currPhone != this.orionUserInfo.phone && index == 0) {
              return
            }
            var markerItem = {
              id: item.id,
              latitude: item.latitude,
              longitude: item.longitude,
              iconPath: this.mapMarkerUser,
              width: this.markerWidth,
              height: this.markerHeight,
            }

            if (_this.mapLocationList.every((a) => a.id !== item.id)) {
              this.markers.push(markerItem)
              this.mapLocationList.push({
                id: item.id,
                locationName: item.name,
                time: item.time,
                zuoBiao: item.longitude + ',' + item.latitude,
              })
            }
          }
          uni.showModal({
            title: '打卡信息',
            content: content + ', \r\n更新时间: ' + item.time,
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                if (islocation) {
                  uni.pageScrollTo({
                    scrollTop: 0,
                    duration: 300,
                  })
                  _this.mapctx.moveToLocation({
                    longitude: item.longitude,
                    latitude: item.latitude,
                  })
                  // uni.showToast({
                  //   title: '地图已定位到该打卡点',
                  //   duration: 2000,
                  //   icon: 'none',
                  //   position: 'bottom',
                  //   success: () => {

                  //   },
                  // })
                } else {
                  uni.showToast({
                    title: '打卡点无效',
                    duration: 2000,
                    icon: 'none',
                  })
                }
                // console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            },
          })
          // this.longitude = item.longitude
          // this.latitude = item.latitude
        }
      })
    },
    modal(content) {
      this.mcontent = content
      this.mshow = true
    },
  },
}
</script>

<style lang="scss" scoped>
.component-container {
  width: 100%;
  font-size: 26rpx;
  .map-wrapper {
    height: 700rpx;
  }
  .section-content {
    .title-line {
      line-height: 70rpx;
      color: black;
      .unit {
        color: #b2b2b2;
        padding-left: 10rpx;
      }
    }
    .scroll-wrapper {
      padding-top: 10rpx;
      box-sizing: border-box;
      // height: 800rpx;
    }
    .map-container {
      margin-top: 10rpx;
      box-sizing: border-box;
      height: 600rpx;
      background-color: #ebeef5;
      .myloading {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
  .button-wrapper {
    margin-top: 60rpx;
    margin-bottom: 60rpx;
    height: 90rpx;
    width: 100%;
    .button-submit {
      width: 600rpx;
      height: 100%;
      margin-left: 55rpx;
      background-color: #2d8cf0;
      color: #ffffff;
      line-height: 90rpx;
      font-size: 36rpx;
      border-radius: 60rpx;
      text-align: center;
    }
  }
  .trail-wrapper {
    margin-bottom: 60rpx;
  }
}
.cn-item-list {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .cn-item.cn-item-first {
    height: 70rpx;
    flex-grow: 0;
    flex-shrink: 0;
    background-color: #ebeef5;
    border: 1px solid #dcdfe6;
    .info {
      color: black;
    }
  }
  .cn-item {
    width: inherit;
    height: 70rpx;
    flex-shrink: 0;
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
    transition: all 0.3s;
    overflow: hidden;
    position: relative;
    color: black;
    flex-grow: 0;
    &.cnuphide {
      height: 0px;
    }
    .index {
      width: 80rpx;
      text-align: center;
    }
    .info {
      width: 50%;
      text-align: center;
      color: #4d61b3;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .time {
      width: calc(50% - 80rpx);
      text-align: center;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .triangle {
      width: 0rpx;
      height: 0rpx;
      border: 20rpx solid;
      border-color: black transparent transparent transparent;
      display: inline-block;
    }
  }
}
.cover-view {
  position: absolute;
  top: 720rpx;
  left: 630rpx;
  padding: 10rpx;
  border-radius: 30rpx;
  background-color: #ffffff;
  box-shadow: 0rpx 0rpx 10rpx 0rpx rgba(0, 0, 0, 0.3);
  .controls-location {
    width: 40rpx;
    height: 40rpx;
  }
}
.control-location {
  position: absolute;
  top: 510rpx;
  left: 620rpx;
  width: 80rpx;
  height: 80rpx;
}
</style>
