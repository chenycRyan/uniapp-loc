<template>
  <view>
    <cell-bar @queryLimit="queryLimit"></cell-bar>
    <u-cell title="选择日期" :isLink="true" arrow-direction="right" isLink :url="'../conditions/conditions?path=' + $mp.page.route">
      <view slot="value">{{ selectTime }}</view>
    </u-cell>
    <qiun-title-bar title="总合同额占比" />

    <view class="charts-box">
      <qiun-data-charts type="ring" v-if="showChart" :opts="optsRing" tooltipFormat="tooltip2" :chartData="chartsDataRing" />
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    </view>
    <qiun-title-bar title="总合同额" />

    <view class="charts-box">
      <qiun-data-charts type="bar" style="width: 90%" :opts="optsBar" v-if="showChart" :chartData="chartsDataColumn" />
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
      <!-- <qiun-data-charts type="column" :opts="optsColumn" :chartData="chartsDataColumn5" /> -->
    </view>
    <u-toast ref="uToast"></u-toast>
  </view>
</template>

<script>
import { getMarket } from '@/api/market.js'
import progressAccount from '@/components/progress/progress.vue'
import cellBar from '@/components/cell-bar/cell-bar.vue'
export default {
  components: { progressAccount, cellBar },
  data() {
    return {
      params: {
        dateFrom: new Date().getFullYear() - 1 + '-01-01',
        dateTo: new Date().getFullYear() - 1 + '-12-31',
        // level: this.$companyLevel,
      },
      showChart: true,
      showDate: false,
      selectTime: '',
      //   optsColumn: {
      //     legend: { show: false },
      //     color: ['#A3DFFC'],
      //     extra: {
      //       column: { width: 20, linearType: 'custom', seriesGap: 5, linearOpacity: 0.5, barBorderCircle: true, customColor: ['#1965F1'] },
      //     },
      //   },
      optsBar: {
        fontSize: 9,
        xAxis: { fontSize: 12, max: 40, fontSize: 13 },
        yAxis: { fontSize: 12 },
        extra: {
          bar: { width: 10, linearType: 'custom', seriesGap: 2, barBorderCircle: true },
        },
        legend: {
          show: false,
        },
      },
      chartsDataColumn: {},
      chartsDataRing: {},
      optsRing: {
        legend: { position: 'bottom' },
        extra: {
          ring: { ringWidth: 20, linearType: 'custom' },
        },
      },
    }
  },
  onBackPress() {
    uni.switchTab({
      url: '../home/home',
    })
    return true
  },
  onLoad(options) {
    if (options.params) {
      console.log(JSON.parse(options.params), 'query')
      this.params = Object.assign(this.params, JSON.parse(options.params))
    }
    this.selectTime = `${this.params.dateFrom} 至 ${this.params.dateTo}`
    this.pageInit()
  },
  methods: {
    pageInit() {
      getMarket(this.params).then((res) => {
        if (res.length === 0) {
          this.showChart = false
          this.$refs.uToast.show({
            type: 'default',
            title: '默认主题',
            message: '查询时间段无数据',
            iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/default.png',
          })
          return
        }
        this.showChart = true
        res = res.sort((a, b) => {
          return b.totalContractAmount - a.totalContractAmount
        })
        res = res.slice(0, 5)
        let num = 0
        if (res.length > 5 && res.length < 8) {
          num = 3
        } else if (res.length >= 8) {
          num = 4
        }
        let legendData = res.slice(0, res.length - num)
        const otherArr = res.slice(res.length - num)

        const sumValue = otherArr.reduce((sum, item) => {
          return sum + item.totalContractAmount
        }, 0)
        console.log(legendData, otherArr)
        legendData.push({
          companyName: '其他',
          totalContractAmount: sumValue,
        })

        const chartData = legendData.map((item) => {
          return {
            name: item.companyName.length > 4 ? item.companyName.slice(0, 4) : item.companyName,
            value: item.totalContractAmount,
          }
        })

        // format在uni_modules--qiun-data-charts--js_sdk--config-ucharts配置自定义格式
        this.chartsDataRing = {
          series: [
            {
              data: chartData,
            },
          ],
        }
        let categorieData = []
        let serieData = []
        res.forEach((item) => {
          categorieData.push(item.companyName.slice(0, 4))
          serieData.push(item.totalContractAmount)
        })
        this.chartsDataColumn = {
          categories: categorieData,
          series: [
            {
              name: '合同额',
              data: serieData,
            },
          ],
        }
      })
    },
    //按地区查看拜访
    queryLimit(param) {
      this.params.level = ''
      this.params.centId = param.item.id !== -1 ? param.item.id : ''
      this.pageInit()
    },
  },
}
</script>

<style lang="scss" scoped>
.pro-box {
  display: flex;
  justify-content: center;
  .pro-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 40%;
    height: 100%;
    padding: 10rpx;
    border-radius: 20rpx;
    background: #f5f8ff;
    margin: 20rpx;
  }
}
.charts-box {
  height: 500rpx;
}
</style>
