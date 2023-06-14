<template>
  <view>
    <qiun-title-bar title="统计占比" />
    <qiun-data-charts type="ring" v-if="showChart" :opts="opts" :chartData="chartsDataRing" />
    <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    <!-- <view style="height: 50rpx; padding: 10rpx">
      <u-button
        type="primary"
        style="width: 160rpx; float: left"
        shape="circle"
        size="small"
        :plain="true"
        text="时长统计"
        @click="toDuration"
      ></u-button>
    </view> -->
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
      <view class="item1"> 联系方式</view>
      <view class="item2">最后时间</view>
      <view class="item3" style="margin-right: 5px">版本</view>
    </view>
    <view class="scroll-wrapper">
      <!-- 如果遇见滚动条至20条左右无法滚动的问题，需要去node_modules修改ulist的paddingTop的Bug -->
      <view v-if="tableData.length > 0">
        <view class="group" v-for="(item, index) in tableData">
          <view class="underLine cell item0" @click="selectPerson(item)"> {{ item.userName }}</view>
          <view class="underLine cell item1" @click="openPhone(item.phone)"> {{ item.phone }}</view>
          <view class="item2 cell">{{ item.lastTime }}</view>
          <view class="item3 cell" style="margin-right: 5px">{{ item.localVersion }}</view>
        </view>
      </view>
      <!-- <u-list v-if="tableData.length > 0" class="ulist" @scrolltolower="scrolltolower">
        <u-list-item v-for="(item, index) in tableData" :key="index">
          <u-cell class="group" style="margin-top: 0">
            <text slot="value" class="underLine item0" @click="selectPerson(item)">
              {{ item.userName }}
            </text>
            <text slot="value" class="underLine item1" @click="openPhone(item.phone)"> {{ item.phone }}</text>
            <text slot="value" class="item2"> {{ item.lastTime }}</text>
            <text slot="value" class="item3"> {{ item.localVersion }}</text>
          </u-cell>
        </u-list-item>
      </u-list> -->
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    </view>
    <u-modal
      :show="showModal"
      :content="modalContent"
      showCancelButton
      confirmText="查看员工详情"
      @cancel="showModal = false"
      @confirm="toEmployess"
    ></u-modal>
  </view>
</template>

<script>
import { getCurrentOnline, getUserInfo } from '@/api/market.js'
// import scrollTable from '@/components/scroll-table/scroll-table.vue'
import ListScroll from '@/components/listScroll/listScroll'

export default {
  components: {
    ListScroll,
  },
  data() {
    return {
      activeName: '在线人员',
      showModal: false,
      modalContent: '',
      activeItem: '',
      showChart: true,
      columns1: [
        {
          title: '姓名',
          key: 'userName',
          width: '20%',
        },
        {
          title: '位置描述',
          key: 'locationName',
          width: '40%',
          color: '#4D61B3',
        },

        {
          title: '最后时间',
          key: 'lastTime',
          width: '40%',
        },
      ],
      resData: [],
      onlineVoList: [],
      offlineVoList: [],
      chartsDataRing: {},
      opts: {
        color: ['#18b566', '#5D5D5D'],
        title: { name: '在线人数' },
        legend: { position: 'bottom' },
        extra: { ring: { ringWidth: 20, linearType: 'custom', centerColor: '#fff' } },
      },
      tableData: [],
      typeList: [
        {
          name: '在线人员',
        },
        {
          name: '离线人员',
        },
      ],
    }
  },
  onReady() {
    this.getOnline()
  },
  //下拉刷新
  onPullDownRefresh() {
    this.getOnline()
  },
  //自定义返回逻辑
  onBackPress() {
    uni.switchTab({
      url: '../home/home',
    })
    return true
  },

  methods: {
    getOnline() {
      uni.showLoading({
        title: '正在查询中...',
      })

      getCurrentOnline()
        .then((res) => {
          uni.stopPullDownRefresh()
          uni.hideLoading()
          this.offlineVoList = res.filter((item) => item.status === '离线')
          this.onlineVoList = res.filter((item) => item.status === '在线')
          console.log(this.offlineVoList)
          console.log(this.onlineVoList)
          if (this.activeName === '在线人员') {
            this.tableData = this.onlineVoList
          } else {
            this.tableData = this.offlineVoList.slice(0, 30)
          }
          const onlineNum = this.onlineVoList.length
          const offlineNum = this.offlineVoList.length

          const chartData = [
            {
              name: '在线人数',
              value: onlineNum,
            },
            {
              name: '离线人数',
              value: offlineNum,
            },
          ]
          this.chartsDataRing = {
            series: [
              {
                data: chartData,
              },
            ],
          }

          this.opts.subtitle = {
            name: onlineNum.toString(),
          }
        })
        .catch(() => {
          uni.hideLoading()
        })
    },
    changeTabs(item) {
      this.activeName = item.name
      this.getOnline()
    },
    scrolltolower() {
      if (this.activeName === '在线人员') {
        this.tableData = this.onlineVoList
      } else {
        this.tableData = this.offlineVoList
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
    getUserByPhone(item) {
      getUserInfo(item.phone).then((res) => {
        this.showModal = true

        this.modalContent = '姓名: ' + res.userName + ' \r\n运营: ' + res.operation + ' \r\n省份: ' + res.province
        if (res.phoneModel && res.phoneModel !== '未知') {
          this.modalContent += ' \r\n手机: ' + res.phoneModel
        }
        if (res.phoneSystem && res.phoneSystem !== '未知') {
          this.modalContent += ' \r\n系统: ' + res.phoneSystem
        }
      })
    },
    toEmployess() {
      getUserInfo(this.activeItem.phone).then((res) => {
        if (!res) {
          res = {
            jobTitle: '未知',
            locationInfoVo: null,
            mobilePhone: phone,
            operation: '未知',
            parentUserName: '未知',
            province: '未知',
            userId: 0,
            userName: '未知',
          }
        }

        // 记录当前切换的人员

        uni.navigateTo({
          url: '../employees/employees?phone=' + res.mobilePhone,
        })
      })
    },
    toDuration() {
      uni.navigateTo({
        url: '../duration/duration',
      })
    },
    selectPerson(item) {
      this.activeItem = item
      this.getUserByPhone(item)
    },
  },
}
</script>
<style lang="scss" scoped>
.ulist {
  height: 800px;
  display: flex;
  flex-direction: column;
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
  padding-left: 20rpx;
  .cell {
    line-height: 48rpx;
  }
  .item0 {
    flex: 1;
    font-size: 26rpx;
  }
  .item1 {
    flex: 2;
    text-align: center;
    font-size: 26rpx;
  }
  .item2 {
    flex: 2.8;
    text-align: center;
    font-size: 26rpx;
  }
  .item3 {
    flex: 1.3;
    text-align: center;
    font-size: 26rpx;
  }
}
</style>
