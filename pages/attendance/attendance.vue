<template>
  <view>
    <!-- <cell-bar @queryLimit="queryLimit"></cell-bar> -->
    <u-cell
      title="选择日期"
      :isLink="true"
      arrow-direction="right"
      isLink
      :url="'../conditions/conditions?path=' + $mp.page.route + '&showDay=1'"
    >
      <view slot="value">{{ selectTime }}</view>
    </u-cell>
    <qiun-title-bar title="考勤占比" />
    <qiun-data-charts type="ring" v-if="showChart" :opts="opts" :chartData="chartsDataRing" />
    <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>

    <u-tabs
      :list="typeList"
      lineWidth="30"
      :activeStyle="{
        color: '#3d9cff',
        fontWeight: 'bold',
        transform: 'scale(1.02)',
      }"
      @click="changeTabs"
    ></u-tabs>
    <view class="group">
      <view class="item0" style="text-align: center"> 姓名</view>
      <!-- <view class="item1"> 联系方式</view> -->
      <view class="item2">到岗时间</view>
      <view class="item3" style="margin-right: 5px">日期</view>
    </view>
    <view class="scroll-wrapper">
      <!-- 如果遇见滚动条至20条左右无法滚动的问题，需要去node_modules修改ulist的paddingTop的Bug -->
      <u-list v-if="tableData.length > 0" class="ulist" @scrolltolower="scrolltolower">
        <u-list-item v-for="(item, index) in tableData" :key="index">
          <u-cell class="group" style="margin-top: 0">
            <text slot="value" class="item0" style="font-size: 26rpx">
              {{ item.userName }}
            </text>
            <!--  <text slot="value" class="underLine item1" style="font-size: 26rpx" @click="openPhone(item.mobilePhone)">
              {{ item.mobilePhone }}</text
            > -->
            <text slot="value" class="item2" style="font-size: 26rpx"> {{ item.earlyCheckIn }}</text>
            <text slot="value" class="item3" style="font-size: 26rpx"> {{ item.timeDate }}</text>
          </u-cell>
        </u-list-item>
      </u-list>
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    </view>
    <u-modal :show="showModal" :content="modalContent" @confirm="showModal = false"></u-modal>
  </view>
</template>

<script>
import { getAllAttendance, getLeaveEarly, getUserInfo } from '@/api/market.js'
// import scrollTable from '@/components/scroll-table/scroll-table.vue'
import ListScroll from '@/components/listScroll/listScroll'
import cellBar from '@/components/cell-bar/cell-bar.vue'
export default {
  components: {
    ListScroll,
    cellBar,
  },
  data() {
    return {
      activeName: '正常',
      showModal: false,
      modalContent: '',
      activeItem: '',
      showChart: true,
      selectPlace: '全国', //选中的区域
      selectTime: '',
      params: {
        level: this.$companyLevel,
        dateFrom: this.$personFrom,
        dateTo: this.$personTo,
      },

      //数据集合
      normalList: [],
      latelList: [],
      absenceList: [],
      earlyList: [],
      chartsDataRing: {},
      opts: {
        color: ['#91CB74', '#FAC858', '#FC8452', '#EE6666'],
        legend: { position: 'bottom' },
        extra: { ring: { ringWidth: 20, linearType: 'custom', centerColor: '#fff' } },
      },
      tableData: [],
      typeList: [
        {
          name: '正常',
        },
        {
          name: '迟到',
        },
        {
          name: '早退',
        },
        {
          name: '缺勤',
        },
      ],
    }
  },

  onLoad(options) {
    if (options.params) {
      this.params = Object.assign(this.params, JSON.parse(options.params))
    }
    this.getAttendance()
    this.selectTime = `${this.params.dateFrom} 至 ${this.params.dateTo}`
  },
  //下拉刷新
  onPullDownRefresh() {
    this.getAttendance()
  },
  //自定义返回逻辑
  onBackPress() {
    uni.switchTab({
      url: '../home/home',
    })
    return true
  },

  methods: {
    getAttendance() {
      uni.showLoading({
        title: '正在查询中...',
      })
      let p1 = new Promise((resolve, reject) => {
        getLeaveEarly(this.params).then((res) => {
          this.earlyList = res
          resolve('p1成功了')
        })
      })

      let p2 = new Promise((resolve, reject) => {
        getAllAttendance(this.params).then((res) => {
          this.normalList = res.filter((item) => item.attendance === '正常')
          this.latelList = res.filter((item) => item.attendance === '迟到')
          this.absenceList = res.filter((item) => item.attendance === '缺勤')
          resolve('p2成功了')
        })
      })
      Promise.all([p1, p2])
        .then((result) => {
          console.log(result)
          uni.stopPullDownRefresh()
          uni.hideLoading()

          if (this.activeName === '正常') {
            this.tableData = this.normalList.slice(0, 30)
          } else if (this.activeName === '迟到') {
            this.tableData = this.latelList.slice(0, 30)
          } else if (this.activeName === '缺勤') {
            this.tableData = this.absenceList.slice(0, 30)
          } else {
            this.tableData = this.earlyList.slice(0, 30)
          }

          const chartData = [
            {
              name: '正常次数',
              value: this.normalList.length,
            },
            {
              name: '迟到次数',
              value: this.latelList.length,
            },
            {
              name: '早退次数',
              value: this.earlyList.length,
            },
            {
              name: '缺勤次数',
              value: this.absenceList.length,
            },
          ]
          this.chartsDataRing = {
            series: [
              {
                data: chartData,
              },
            ],
          }

          // this.opts.subtitle = {
          //   name: this.normalList.length.toString(),
          // }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    changeTabs(item) {
      this.activeName = item.name
      this.getAttendance()
    },
    scrolltolower() {
      if (this.activeName === '正常') {
        this.tableData = this.normalList
      } else if (this.activeName === '迟到') {
        this.tableData = this.latelList
      } else if (this.activeName === '缺勤') {
        this.tableData = this.absenceList
      } else {
        this.tableData = this.earlyList
      }
    },
    openPhone(phone) {
      //#ifdef MP-WEIXIN
      uni.makePhoneCall({
        phoneNumber: phone,
      })
      //#endif
      //#ifdef APP-PLUS
      plus.device.dial(phone, true)
      //#endif
    },
    // getUserByPhone(item) {
    //   getUserInfo(item.mobilePhone).then((res) => {
    //     this.showModal = true
    //     this.modalContent = '姓名: ' + res.userName + ' \r\n运营: ' + res.operation + ' \r\n省份: ' + res.province
    //   })
    // },
    // selectPerson(item) {
    //   this.activeItem = item
    //   this.getUserByPhone(item)
    // },
    //按地区查看拜访
    queryLimit(param) {
      this.params.level = param.level
      this.params.centId = param.item.id
      this.getAttendance()
      this.selectPlace = param.item.name
    },
  },
}
</script>
<style lang="scss" scoped>
.ulist {
  /deep/.u-cell__body__content {
    flex-grow: 0;
  }
  /deep/.u-cell__body {
    font-size: 28rpx;
  }
  uni-view {
    padding-top: 0 !important;
  }
}

.u-tabs {
  display: flex;
}

.scroll-wrapper {
  margin-top: 20rpx;
  box-sizing: border-box;
  min-height: 300rpx;
}
.underLine {
  color: #412f1f;
  text-decoration: underline;
}
.group {
  display: flex;
  margin-top: 20rpx;
  .item0 {
    flex: 0.8;
  }
  .item1 {
    flex: 2;
    text-align: center;
  }
  .item2 {
    flex: 2.8;
    text-align: center;
  }
  .item3 {
    flex: 1.3;
    text-align: center;
  }
}
</style>
