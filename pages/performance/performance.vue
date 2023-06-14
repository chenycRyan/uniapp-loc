<template>
  <view>
    <u-cell title="选择日期" :isLink="true" arrow-direction="right" isLink :url="'../conditions/conditions?path=' + $mp.page.route">
      <view slot="value"> {{ selectTime }}</view>
    </u-cell>

    <u-tabs
      class="mt-10"
      :list="typeList"
      lineWidth="40"
      :activeStyle="{
        color: '#3d9cff',
        fontWeight: 'bold',
        transform: 'scale(1.02)',
      }"
      @click="changeTabs"
    ></u-tabs>
    <view v-if="activeIndex == 0">
      <qiun-title-bar title="运营中心完成额度" />
      <chart-process v-if="operLimit.length > 0" :chartData="operLimit"></chart-process>
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
      <qiun-title-bar title="运营中心完成率" />
      <chart-process v-if="operRate.length > 0" :max="100" :chartData="operRate" :showPercent="true"></chart-process>
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    </view>
    <view v-if="activeIndex == 1">
      <qiun-title-bar title="省份完成额度" />
      <chart-process v-if="provLimit.length > 0" :chartData="provLimit"></chart-process>
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
      <qiun-title-bar title="省份完成率" />
      <chart-process v-if="provRate.length > 0" :max="100" :chartData="provRate" :showPercent="true"></chart-process>
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    </view>
    <view v-if="activeIndex == 2">
      <qiun-title-bar title="个人完成额度" />
      <chart-process v-if="persLimit.length > 0" :chartData="persLimit"></chart-process>
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
      <qiun-title-bar title="个人完成率" />
      <chart-process v-if="persRate.length > 0" :max="100" :chartData="persRate" :showPercent="true"></chart-process>
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    </view>
  </view>
</template>

<script>
import { getRank } from '@/api/market.js'
import chartProcess from '@/components/chart-process.vue'
export default {
  components: { chartProcess },

  data() {
    return {
      activeIndex: 0,
      selectTime: '',
      selectPlace: '全国', //选中地区
      columns1: [], //传子组件
      columns2: [],
      columnData: [],
      operLimit: [], // 运营中心完成额
      operRate: [], //运营中心完成率
      provLimit: [], // 省份完成额
      provRate: [], //省份完成率
      persLimit: [],
      persRate: [],
      typeList: [
        {
          name: '运营中心',
        },
        {
          name: '省份',
        },
        {
          name: '个人',
        },
      ],
      params: {
        level: 'COMPANY',

        dateFrom: this.$defalutFrom,
        dateTo: this.$defalutTo,
      },
      totalAmount: '0',

      chartsDataRing1: {},
      opts: {
        title: { name: '' },
        subtitle: { name: '' },
        legend: { position: 'bottom' },
        extra: { ring: { ringWidth: 30, linearType: 'custom' } },
      },
    }
  },
  onLoad(options) {
    if (options.params) {
      console.log(JSON.parse(options.params), 'query')
      this.params = Object.assign(this.params, JSON.parse(options.params))
    }
    this.selectTime = `${this.params.dateFrom} 至 ${this.params.dateTo}`
    this.pageInit()
  },
  //自定义返回逻辑
  onBackPress() {
    uni.switchTab({
      url: '../home/home',
    })
    return true
  },
  methods: {
    pageInit() {
      this.getOperRank('OPERATION')
      this.getOperRank('PROVINCE')
      this.getOperRank('PEOPLE')
    },

    //获取运营中心及省份排名
    getOperRank(level) {
      const { dateFrom, dateTo } = this.params
      getRank({
        dateFrom,
        dateTo,
        level: level,
      }).then((res) => {
        //所有运营中心取排名前五
        if (level === 'OPERATION') {
          //运营中心销售额
          this.operLimit = res.targetCompleteVoList.map((item, index) => {
            return {
              id: item.centId,
              rank: index + 1,
              name: item.name,
              value: (Number(item.sumTotal) / 10000).toFixed(2),
            }
          })

          //运营中心完成率
          this.operRate = res.completeRateVoList.map((item, index) => {
            return {
              id: item.centId,
              rank: index + 1,
              name: item.name,
              value: (Number(item.rate) * 100).toFixed(2),
            }
          })
        } else if (level === 'PROVINCE') {
          //省份销售额取排名前五
          this.provLimit = res.targetCompleteVoList.map((item, index) => {
            return {
              id: item.centId,
              rank: index + 1,
              name: item.name,
              value: (Number(item.sumTotal) / 10000).toFixed(2),
            }
          })

          //省份完成率
          this.provRate = res.completeRateVoList.map((item, index) => {
            return {
              id: item.centId,
              rank: index + 1,
              name: item.name,
              value: (Number(item.rate) * 100).toFixed(2),
            }
          })
        } else {
          //个人销售额
          this.persLimit = res.targetCompleteVoList.map((item, index) => {
            return {
              id: item.centId,
              rank: index + 1,
              name: item.name,
              value: (Number(item.sumTotal) / 10000).toFixed(2),
            }
          })

          //个人完成率
          this.persRate = res.completeRateVoList.map((item, index) => {
            return {
              id: item.centId,
              rank: index + 1,
              name: item.name,
              value: (Number(item.rate) * 100).toFixed(2),
            }
          })
        }
        console.log(this.operLimit, 'operLimit')
        console.log(this.provRate, 'provRate')
      })
    },
    changeTabs(item) {
      console.log(item)
      this.activeIndex = item.index
    },
  },
}
</script>

<style lang="scss" scoped>
.panel-box {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  .panel {
    margin: 10rpx;
    font-size: 60rpx;
    font-weight: bold;
    color: #1d9dda;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 100rpx;
    width: 80rpx;
    background: #f5f8ff;
    padding: 0 0.1875rem 0.5rem;
    margin-bottom: 0.1875rem;
    &::before {
      content: '';
      border-left: 2px solid #d8def1;
      border-top: 2px solid #d8def1;
      position: absolute;
      left: 0;
      top: 0;
      width: 10rpx;
      height: 10rpx;
    }
    &::after {
      content: '';
      border-right: 2px solid #d8def1;
      border-top: 2px solid #d8def1;
      position: absolute;
      right: 0;
      top: 0;
      width: 10rpx;
      height: 10rpx;
    }
    .panel-foot {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      &::before {
        content: '';
        border-left: 2px solid #d8def1;
        border-bottom: 2px solid #d8def1;
        position: absolute;
        left: 0;
        bottom: 0;
        width: 10rpx;
        height: 10rpx;
      }
      &::after {
        content: '';
        border-right: 2px solid #d8def1;
        border-bottom: 2px solid #d8def1;
        position: absolute;
        right: 0;
        bottom: 0;
        width: 10rpx;
        height: 10rpx;
      }
    }
  }
}
</style>
