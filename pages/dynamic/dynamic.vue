<template>
  <view>
    <qiun-title-bar :title="title" />
    <view class="btn-group" v-if="title !== '近一年'">
      <u-button type="primary" class="btn-item" shape="circle" @click="changeTime(6)" text="近一周"></u-button>
      <u-button type="primary" class="btn-item" shape="circle" @click="changeTime(30)" text="近一月"></u-button>
    </view>
    <u-tabs
      :list="typeList"
      lineWidth="50"
      :activeStyle="{
        color: '#3d9cff',
        fontWeight: 'bold',
        transform: 'scale(1.02)',
      }"
      @click="changeTabs"
    ></u-tabs>
    <view class="group">
      <view class="item0" style="text-align: center"> 姓名</view>
      <view class="item1"> 大区</view>
      <view class="item2">金额(万元)</view>
      <view class="item3" style="margin-right: 5px">时间</view>
    </view>
    <view class="scroll-wrapper">
      <!-- 如果遇见滚动条至20条左右无法滚动的问题，需要去node_modules修改ulist的paddingTop的Bug -->
      <!-- @scrolltolower="scrolltolower" -->
      <u-list v-if="tableData.length > 0" class="ulist">
        <u-list-item v-for="(item, index) in tableData" :key="index">
          <u-cell class="group" style="margin-top: 0">
            <text slot="value" class="underLine item0" @click="selectPerson(item)">
              {{ item.name }}
            </text>
            <text slot="value" class="item1"> {{ item.operationName }}</text>
            <text slot="value" class="item2 underLine" @click="queryOrderDtl(item)"> {{ handleUnit(item.total) }}</text>
            <text slot="value" class="item3"> {{ item.time }}</text>
          </u-cell>
        </u-list-item>
      </u-list>
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    </view>
    <u-modal :show="showModal" :content="modalContent" confirmText="确定" @confirm="showModal = false"></u-modal>
  </view>
</template>

<script>
import { getCompleteOrder, getUserInfo, getCompleteOrderDtl } from '@/api/market.js'
import ListScroll from '@/components/listScroll/listScroll'
import { mapState } from 'vuex'
export default {
  components: {
    ListScroll,
  },
  computed: {
    ...mapState(['orionUserInfo']),
  },
  data() {
    return {
      title: '近一周',
      activeName: '销售订单',
      showModal: false,
      modalContent: '',
      tableData: [],
      typeList: [
        {
          name: '销售订单',
        },
        {
          name: '大额订单',
        },
      ],
      num: 6,
    }
  },

  onReady() {
    this.getOrder()
  },

  methods: {
    // getCurrentUserInfo() {
    //   getUserInfo(this.orionUserInfo.phone).then((res) => {
    //     this.isProvManager = res.jobTitle === '省区经理'
    //   })
    // },
    handleUnit(val) {
      return (Number(val) / 10000).toFixed(2) ? (Number(val) / 10000).toFixed(2) : 0
    },

    getOrder() {
      uni.showLoading({
        title: '正在查询中...',
      })
      let date = new Date()
      let timeList = this.getDateRange(date, this.num, true)
      let param = {
        dateFrom: '',
        dateTo: '',
        maxTotal: 0,
      }

      if (this.num === 365) {
        param = {
          dateFrom: this.$defalutFrom,
          dateTo: this.$defalutTo,
          maxTotal: 5000000,
        }
      } else {
        param = {
          dateFrom: timeList[0],
          dateTo: timeList[1],
          maxTotal: 0,
        }
      }

      getCompleteOrder(param).then((res) => {
        this.tableData = res
        uni.hideLoading()
      })
    },
    changeTabs(item) {
      this.activeName = item.name
      this.changeTime()
    },
    changeTime(num) {
      if (this.activeName === '大额订单') {
        this.num = 365
        this.title = '近一年'
      } else {
        this.num = num || 6
        this.title = this.num < 7 ? '近一周' : '近一月'
      }
      this.getOrder()
    },

    selectPerson(row) {
      getUserInfo(row.phone).then((res) => {
        this.showModal = true
        this.modalContent =
          '姓名: ' +
          res.userName +
          ' \r\n运营: ' +
          res.operation +
          ' \r\n省份: ' +
          res.province +
          ' \r\n职位: ' +
          res.jobTitle +
          ' \r\n省区经理: ' +
          res.parentUserName
      })
    },

    queryOrderDtl(row) {
      uni.showLoading({
        title: '正在查询中...',
      })
      let date = new Date()
      let timeList = this.getDateRange(date, this.num, true)
      let param = {
        dateFrom: '',
        dateTo: '',
        maxTotal: 0,
      }

      if (this.num === 365) {
        param = {
          dateFrom: this.$defalutFrom,
          dateTo: this.$defalutTo,
          orderName: row.orderName,
        }
      } else {
        param = {
          dateFrom: timeList[0],
          dateTo: timeList[1],
        }
      }
      getCompleteOrderDtl({ orderName: row.orderName }).then((res) => {
        let other = row.total
        this.modalContent = ''
        if (res.length > 0) {
          res.forEach((item) => {
            this.modalContent = this.modalContent + ` \r\n${item.customType}-${item.subjectName} : ${this.handleUnit(item.totalAmount)}万元`
            other = other - item.totalAmount
          })
        }

        this.showModal = true
        this.modalContent = this.modalContent + ' \r\n其他项：' + other + '元'

        uni.hideLoading()
      })
    },
    /**
     *
     * @param dateNow :Date类
     * @param intervalDays ：间隔天数
     * @param bolPastTime  ：Boolean,判断在参数date之前，还是之后，
     */
    getDateRange(dateNow, intervalDays, bolPastTime) {
      let oneDayTime = 24 * 60 * 60 * 1000
      let list = []
      let lastDay

      if (bolPastTime == true) {
        lastDay = new Date(dateNow.getTime() - intervalDays * oneDayTime)
        list.push(this.formateDate(lastDay))
        list.push(this.formateDate(dateNow))
      } else {
        lastDay = new Date(dateNow.getTime() + intervalDays * oneDayTime)
        list.push(this.formateDate(dateNow))
        list.push(this.formateDate(lastDay))
      }
      return list
    },
    formateDate(time) {
      let year = time.getFullYear()
      let month = time.getMonth() + 1
      let day = time.getDate()

      if (month < 10) {
        month = '0' + month
      }

      if (day < 10) {
        day = '0' + day
      }

      return year + '-' + month + '-' + day + ''
    },
  },
  //下拉刷新
  onPullDownRefresh() {
    this.getOrder()
  },
  //自定义返回逻辑
  onBackPress() {
    uni.switchTab({
      url: '../home/home',
    })
    return true
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
/deep/.u-modal__content__text {
  padding-left: 20%;
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
  font-size: 26rpx;
  .item0 {
    flex: 0.8;
  }
  .item1 {
    flex: 1.2;
    text-align: center;
  }
  .item2 {
    flex: 1;
    text-align: center;
  }
  .item3 {
    flex: 1.5;
    text-align: center;
  }
}
.btn-group {
  display: flex;
  justify-content: center;
  width: 400rpx;
  .btn-item {
    width: 180rpx;
    border: 2rpx solid #eeeeee;
    height: 60rpx;
    line-height: 80rpx;
  }
}
</style>
