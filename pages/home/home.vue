<template>
  <view>
    <!-- <view class="nav-bar"></view> -->

    <SwiperImg :list="swiperList"></SwiperImg>

    <view class="company-info">
      <view class="info-item">
        <view class="title">
          <u-icon name="star-fill" size="22"></u-icon>
          年度目标(万元)
        </view>
        <view class="value">{{ company.targetAmount }} </view>
      </view>
      <u-line direction="col" length="55px"></u-line>
      <view class="info-item">
        <view class="title"> 完成额(万元) </view>
        <view class="value"> {{ company.amount }} </view>
      </view>
      <u-line direction="col" length="55px"></u-line>
      <view class="info-item">
        <view class="title"> 完成率 </view>
        <view class="value"> {{ company.rate }} </view>
      </view>
    </view>
    <view class="complete-rate">
      <view class="info-title">完成额冠军(万元)</view>
      <view class="info-group">
        <view v-if="!(completeObj.OPERATION.name && completeObj.PROVINCE.name && completeObj.PROVINCE.name)" class="empty">暂无数据</view>
        <view class="info-item" v-if="completeObj.OPERATION.name">
          <view class="title"> {{ completeObj.OPERATION.name }}(全国) </view>
          <view class="value"> {{ completeObj.OPERATION.sumTotal }} </view>
        </view>
        <u-line direction="col" length="55px" v-if="completeObj.PROVINCE.name"></u-line>
        <view class="info-item" v-if="completeObj.PROVINCE.name">
          <view class="title"> {{ completeObj.PROVINCE.name }}(全国) </view>
          <view class="value"> {{ completeObj.PROVINCE.sumTotal }} </view>
        </view>
        <u-line direction="col" length="55px" v-if="completeObj.PEOPLE.name"></u-line>
        <view class="info-item" v-if="completeObj.PEOPLE.name">
          <view class="title"> {{ completeObj.PEOPLE.name }}(全国) </view>
          <view class="value"> {{ completeObj.PEOPLE.sumTotal }} </view>
        </view>
      </view>
    </view>
    <view class="complete-rate">
      <view class="info-title">完成率冠军 </view>
      <view class="info-group">
        <view v-if="!(rateObj.OPERATION.name && rateObj.PROVINCE.name && rateObj.PROVINCE.name)" class="empty">暂无数据</view>
        <view class="info-item" v-if="rateObj.OPERATION.name">
          <view class="title"> {{ rateObj.OPERATION.name }}(全国) </view>
          <view class="rate"> {{ rateObj.OPERATION.rate }} </view>
        </view>
        <u-line direction="col" length="55px" v-if="rateObj.PROVINCE.name"></u-line>
        <view class="info-item" v-if="rateObj.PROVINCE.name">
          <view class="title"> {{ rateObj.PROVINCE.name }}(全国)</view>
          <view class="rate"> {{ rateObj.PROVINCE.rate }} </view>
        </view>
        <u-line direction="col" length="55px" v-if="rateObj.PEOPLE.name"></u-line>
        <view class="info-item" v-if="rateObj.PEOPLE.name">
          <view class="title"> {{ rateObj.PEOPLE.name }}(全国) </view>
          <view class="rate"> {{ rateObj.PEOPLE.rate }} </view>
        </view>
      </view>
    </view>

    <u-grid :border="false" col="4" @click="clickGrid" style="margin-top: 30rpx">
      <u-grid-item v-for="(item, listIndex) in homeList" :key="listIndex">
        <u--image :src="item.src" width="100rpx" height="100rpx"></u--image>
        <text class="grid-text">{{ item.title }}</text>
      </u-grid-item>
    </u-grid>
    <!-- <u-modal
      :show="showModal"
      title="温馨提示"
      confirmText="去下载"
      :showCancelButton="isAdmin"
      @cancel="showModal = false"
      @confirm="confirmRedirect"
      :content="`您当前的版本${appVersion}，检测到应用已更新至${webVersion}，请重新下载最新版！`"
    ></u-modal> -->
    <u-toast ref="uToast" />
    <popup v-if="showModal" :content="modalDesc" @close="closeMask()" @eventClick="confirmRedirect()"></popup>
    <keep-position ref="keepPosition"></keep-position>
  </view>
</template>

<script>
import { addActionLog, getBannerImg, getRank, getNewVersion, getParamConfig } from '@/api/market.js'
import SwiperImg from '@/components/swiper-img'
import popup from '@/components/popup/popup'
import KeepPosition from '@/components/KeepPosition'
import { versionList } from '@/config/version.js'
import { mapState } from 'vuex'
export default {
  components: { SwiperImg, popup, KeepPosition },
  data() {
    return {
      modalDesc: '',
      /***** */
      isAdmin: false,
      timer: null,

      webVersion: '',
      AndroidUpdateUrl: '',
      IOSUpdateUrl: '',
      showModal: false,
      company: {
        targetAmount: 0,
        amount: 0,
        rate: '',
      },
      completeObj: { OPERATION: {}, PROVINCE: {}, PEOPLE: {} },
      rateObj: {
        OPERATION: {},
        PROVINCE: {},
        PEOPLE: {},
      },

      current: 0,

      swiperList: [require('@/static/img/banner.png'), require('@/static/img/banner1.png')],
      homeList: [],
      homePage: [
        {
          path: '../dynamic/dynamic',
          src: require('@/static/homeIcon/dynamic.png'),
          title: '最新动态',
        },
        {
          path: '../duration/duration',
          src: require('@/static/homeIcon/duration.png'),
          title: '时长统计',
        },
        {
          path: '../trackReport/trackReport',
          src: require('@/static/homeIcon/locus.png'),
          title: '在线统计',
        },
        {
          path: '../attendance/attendance',
          src: require('@/static/homeIcon/attendance.png'),
          title: '考勤统计',
        },

        {
          path: '../visit/visit',
          src: require('@/static/homeIcon/visit.png'),
          title: '拜访分析',
        },
        {
          path: '../complete/complete',
          src: require('@/static/homeIcon/quota.png'),
          title: '完成额度',
        },
        {
          path: '../tender/tender',
          src: require('@/static/homeIcon/bid.png'),
          title: '投标分析',
        },
        {
          path: '../market/market',
          src: require('@/static/homeIcon/proportion.png'),
          title: '市场占有率',
        },
        {
          path: '../device/device',
          src: require('@/static/homeIcon/statistics.png'),
          title: '设备统计',
        },
        {
          path: '../performance/performance',
          src: require('@/static/homeIcon/ranking.png'),
          title: '业绩排名',
        },
        {
          path: '../employees/employees',
          src: require('@/static/homeIcon/personal.png'),
          title: '员工情况',
        },

        {
          path: '../attendanceView/attendanceView',
          src: require('@/static/homeIcon/viewattend.png'),
          title: '员工考勤',
        },

        {
          path: '../systemConfig/systemConfig',
          src: require('@/static/homeIcon/config.png'),
          title: '系统配置',
        },
        {
          path: '../manager/manager',
          src: require('@/static/homeIcon/roles.png'),
          title: '角色分配',
        },
      ],
      employees: [
        {
          path: '../dynamic/dynamic',
          src: require('@/static/homeIcon/dynamic.png'),
          title: '最新动态',
        },

        {
          path: '../duration/duration',
          src: require('@/static/homeIcon/duration.png'),
          title: '时长统计',
        },
        {
          path: '../employees/employees',
          src: require('@/static/homeIcon/personal.png'),
          title: '员工情况',
        },

        {
          path: '../attendanceView/attendanceView',
          src: require('@/static/homeIcon/viewattend.png'),
          title: '考勤查看',
        },

        {
          path: '../report/report',
          src: require('@/static/homeIcon/report.png'),
          title: '工作上报',
        },
        {
          path: '../complete/complete',
          src: require('@/static/homeIcon/quota.png'),
          title: '完成额度',
        },
        {
          path: '../tender/tender',
          src: require('@/static/homeIcon/bid.png'),
          title: '投标分析',
        },
        {
          path: '../visit/visit',
          src: require('@/static/homeIcon/visit.png'),
          title: '拜访分析',
        },
        {
          path: '../market/market',
          src: require('@/static/homeIcon/proportion.png'),
          title: '市场占有率',
        },
        {
          path: '../device/device',
          src: require('@/static/homeIcon/statistics.png'),
          title: '设备统计',
        },

        // {
        //   path: '../developing/developing',
        //   src: require('@/static/homeIcon/more.png'),
        //   title: '建设中',
        // },
      ],
    }
  },
  computed: {
    ...mapState({
      orionUserInfo: (state) => state.orionUserInfo,
    }),
  },
  onLoad() {
    if (this.orionUserInfo) {
      this.judgeRole()

      // setTimeout(() => {
      //   this.getBanner()
      // }, 500)
    }
  },

  //解决tabbar切换不调用onload函数
  onShow() {
    console.log('onShow')
    if (!this.orionUserInfo) {
      uni.navigateTo({
        url: '../login/login',
      })
      return
    }
    this.judgeRole()
    this.getTarget('COMPANY')
    this.getTarget('OPERATION')
    this.getTarget('PROVINCE')
    this.getTarget('PEOPLE')
    this.getNewVersion()
    if (this.$refs.keepPosition) this.$refs.keepPosition.autoUploadPosition()
  },
  mounted() {
    // 启动自动上传位置

    if (this.$refs.keepPosition) this.$refs.keepPosition.autoUploadPosition()
  },

  methods: {
    //角色判断
    judgeRole() {
      //角色判断，区分管理端和员工端
      const { roles } = this.orionUserInfo
      if (roles && roles.length > 0 && !roles.includes('SaleManage')) {
        this.homeList = this.employees
        this.isAdmin = false
      } else {
        this.isAdmin = true
        this.homeList = this.homePage
      }
    },
    //版本不是最新版跳转浏览器
    confirmRedirect() {
      switch (uni.getSystemInfoSync().platform) {
        case 'android':
          plus.runtime.openURL(this.AndroidUpdateUrl, () => {
            this.showModal = false
          })

          break
        case 'ios':
          plus.runtime.openURL(this.IOSUpdateUrl, () => {
            this.showModal = false
          })
          this.showModal = false
          break
        case 'devtools':
          console.log('客户端是在开发者工具上')
          window.open(encodeURI(this.AndroidUpdateUrl))
          break
        default:
          window.open(encodeURI(this.AndroidUpdateUrl))
          break
      }

      this.showModal = false
    },
    //获取导航轮播图
    getBanner() {
      getBannerImg().then((res) => {
        if (res.length > 0) {
          this.swiperList = res.map((item) => {
            return 'https://www.huiborobot.com.cn:8843/hbcrm/sao/files/' + item.saoFileId + '/download'
          })
        }
      })
    },

    getNewVersion() {
      getParamConfig().then((res) => {
        this.AndroidUpdateUrl = res.filter((item) => item.name === 'ANDROIDURL')[0].value
        this.IOSUpdateUrl = res.filter((item) => item.name === 'IOSURL')[0].value
      })

      getNewVersion().then((res) => {
        this.webVersion = res.webVersion

        if (res.webVersion > this.$appVersion) {
          let versionInfo = versionList.filter((item) => item.appVersion === res.webVersion)
          console.log('versionInfo', versionInfo)

          if (versionInfo.length > 0) {
            this.modalDesc = versionList.filter((item) => item.appVersion === res.webVersion)[0].dto.join('<br/>')
          } else {
            this.modalDesc = versionList[0].dto.join('<br/>')
          }

          this.showModal = true
        }
      })
    },
    getTarget(level) {
      const params = {
        level: level,
        dateFrom: this.$defalutFrom,
        dateTo: this.$defalutTo,
      }
      getRank(params).then((res) => {
        //完成率
        if (res.completeRateVoList.length > 0) {
          const completeRateVo = res.completeRateVoList[0]
          if (level === 'COMPANY') {
            this.company = {
              targetAmount: (Math.floor(Number(completeRateVo.targetAmount) / 100) / 100).toFixed(2),
              amount: (Math.floor(Number(completeRateVo.sumTotal) / 100) / 100).toFixed(2),
              rate: (completeRateVo.rate * 100).toFixed(2) + '%',
            }
          } else {
            this.rateObj[level] = {
              name: completeRateVo.name,
              rate: ((completeRateVo.rate * 100).toFixed(2) || 0) + '%',
            }
          }
        }
        //完成额
        if (res.targetCompleteVoList.length > 0) {
          const total = res.targetCompleteVoList[0]
          if (level !== 'COMPANY') {
            this.completeObj[level] = {
              name: total.name,
              sumTotal: (Math.floor(Number(total.sumTotal) / 100) / 100).toFixed(2) || 0,
            }
          }
        }
      })
    },
    clickGrid(name) {
      uni.navigateTo({
        url: this.homeList[name].path,
      })
      // this.$refs.uToast.success(`点击了第${name}个`)
    },
  },
}
</script>

<style lang="scss" scoped>
.nav-bar {
  height: 70rpx;
  width: 100%;
  background-color: #0093e9;
  background-image: linear-gradient(225deg, #256dee 0%, #c0e3f7 100%);
}
.u-swiper {
  border-radius: 0px !important;
  padding: 0 !important;
}
/deep/.u-swiper__wrapper__item__wrapper__image {
  border-radius: 0 !important;
}
.company-info {
  background: url(../../static/img/data-bg.png);
  background-size: 100% 100%;
  display: flex;
  justify-content: space-around;
  width: 94%;
  margin: 20rpx auto 0;
  line-height: 60rpx;
  .info-item {
    display: flex;
    flex-direction: column;
    text-align: center;
    .desc {
      font-size: 24rpx;
    }
    .title {
      color: #1d1e20;
      display: flex;
      flex-wrap: nowrap;
    }
    .value {
      color: #256def;
    }
  }
}
.complete-rate {
  font-size: 30rpx;
  .info-title {
    color: #7a7a7a;
    margin: 12rpx 0 5rpx;
    padding-left: 7%;
    font-weight: bold;
    font-size: 28rpx;
  }
  .info-group {
    display: flex;
    justify-content: space-around;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 #ebeef5;
    border-radius: 10rpx;
    width: 86%;
    margin: 0 auto;
    padding: 10rpx 10rpx 0;
    .empty {
      color: #82848a;
      text-align: center;
    }
    .info-item {
      display: flex;
      flex-direction: column;
      line-height: 52rpx;
      font-size: 28rpx;
      text-align: center;
      .title {
        color: #1d1e20;
      }
      .value {
        color: #dc4b3b;
      }

      .rate {
        color: #713e98;
      }
    }
  }
}
.target-title {
  display: flex;
  justify-content: center;
  flex-direction: column;
  background: url(../../static/img/data-bg.png);
  background-size: 100% 100%;
  margin-bottom: 20rpx;
  font-weight: bold;
  font-style: italic;
  font-size: 80rpx;
  text-align: center;
  color: #3bc2f6;
  .desc {
    color: #909399;
    font-size: 40rpx;
  }
  .number {
    font-family: 'electronicFont';
    color: #7ec8e4;
  }
}
.grid-text {
  font-size: 14px;
  color: #909399;
  padding: 10rpx 0 20rpx 0rpx;
  /* #ifndef APP-PLUS */
  box-sizing: border-box;
  /* #endif */
}
.indicator {
  @include flex(row);
  justify-content: center;
  &__dot {
    height: 6px;
    width: 6px;
    border-radius: 100px;
    background-color: rgba(255, 255, 255, 0.35);
    margin: 0 5px;
    transition: background-color 0.3s;
    &--active {
      background-color: #ffffff;
    }
  }
}
</style>
