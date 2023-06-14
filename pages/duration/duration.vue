<template>
  <view>
    <u-cell
      title="选择日期"
      :isLink="true"
      arrow-direction="right"
      isLink
      :url="'../conditions/conditions?path=' + $mp.page.route + '&showDay=1'"
    >
      <view slot="value">{{ selectTime }}</view>
    </u-cell>
    <qiun-title-bar title="在线时长统计" />

    <chart-process v-if="durationList.length > 0" :chartData="durationList" unit="小时"></chart-process>
    <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"></u-empty>
    <view style="display: flex">
      <u-button
        type="primary"
        style="width: 30%"
        shape="circle"
        size="small"
        :plain="true"
        :hairline="true"
        text="正序排列"
        @click="reverse"
      ></u-button>
      <u-button
        type="primary"
        style="width: 30%"
        shape="circle"
        size="small"
        :plain="true"
        :hairline="true"
        text="倒序排列"
        @click="reverse"
      ></u-button>
    </view>
  </view>
</template>

<script>
import { getDuration } from '@/api/market.js'
import chartProcess from '@/components/chart-process.vue'
export default {
  components: { chartProcess },
  data() {
    return {
      resData: [],
      selectTime: '',
      durationList: [],
      params: {
        dateFrom: this.$monthFrom,
        dateTo: this.$monthTo,
      },
    }
  },
  //自定义返回逻辑
  onBackPress() {
    uni.switchTab({
      url: '../home/home',
    })
    return true
  },
  onLoad(options) {
    if (options.params) {
      this.params = Object.assign(this.params, JSON.parse(options.params))
    }
    this.pageInit()
    this.selectTime = `${this.params.dateFrom} 至 ${this.params.dateTo}`
  },
  methods: {
    pageInit() {
      uni.showLoading({
        title: '正在查询中...',
      })

      getDuration(this.params)
        .then((res) => {
          uni.hideLoading()
          this.resData = res
          res = res.reverse()
          this.durationList = res.map((item, index) => {
            return {
              id: item.userName + index,
              rank: index + 1,
              name: item.userName,
              value: Number(item.hourTime),
            }
          })

          console.log(this.durationList)
        })
        .catch(() => {
          uni.hideLoading()
        })
    },
    reverse() {
      this.resData = this.resData.reverse()
      this.durationList = this.resData.map((item, index) => {
        return {
          id: item.userName + index,
          rank: index + 1,
          name: item.userName,
          value: Number(item.hourTime),
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/.cn-component-container .cn-item-list {
  max-height: 460px;
}
</style>
