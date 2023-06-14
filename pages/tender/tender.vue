<template>
  <view>
    <cell-bar @queryLimit="queryTenderLimit"></cell-bar>
    <u-cell title="按年度统计" :isLink="true" arrow-direction="right" @click="showYear = true">
      <view slot="value">{{ selectYear }}</view>
    </u-cell>
    <u-picker
      :show="showYear"
      ref="uPicker"
      :defaultIndex="defaultIndex"
      :columns="columnsYear"
      @confirm="confirmYear"
      @cancel="showYear = false"
    ></u-picker>
    <u-tabs
      :list="list1"
      lineWidth="50"
      @change="changeTabs"
      :activeStyle="{
        color: '#3d9cff',
        fontWeight: 'bold',
        transform: 'scale(1.02)',
      }"
    ></u-tabs>

    <view class="charts-box">
      <qiun-title-bar :title="'月度投标额'" />
      <qiun-data-charts type="bar" :opts="optsBar" :chartData="chartsDataColumn1" />
      <qiun-title-bar :title="'月度投标数'" />
      <qiun-data-charts type="bar" :opts="optsBar" :chartData="chartsDataColumn2" />
    </view>
  </view>
</template>

<script>
import { getMonthBid } from '@/api/market.js'
import progressAccount from '@/components/progress/progress.vue'
import cellBar from '@/components/cell-bar/cell-bar.vue'
export default {
  components: { progressAccount, cellBar },
  data() {
    return {
      defaultIndex: [4],
      selectYear: new Date().getFullYear() + '年',
      showYear: false,
      columnsYear: [],
      selectPlace: '全国',
      params: {
        level: this.$companyLevel,
        dateFrom: new Date().getFullYear() + '-01-01',
        dateTo: new Date().getFullYear() + '-12-31',
      },
      swvalue: false,
      chartData: {
        //投标额
        bidAmountList: [],
        //中标额
        winBidAmountList: [],
        //回款额
        repayAmountList: [],
        //投标数
        bidNumList: [],
        //中标数
        winBidNumList: [],
      },
      activeName: '上半年',
      list1: [
        {
          name: '上半年',
        },
        {
          name: '下半年',
        },
      ],
      chartsDataColumn1: {},
      chartsDataColumn2: {},
      optsBar: {
        fontSize: 10,
        xAxis: { max: 40, fontSize: 13 },
        extra: {
          bar: { width: 10, linearType: 'custom', seriesGap: 2, barBorderCircle: true },
        },
        legend: {
          fontSize: 13,
        },
      },
    }
  },

  methods: {
    pageInit() {
      getMonthBid(this.params).then((res) => {
        if (res.length > 0) {
          this.chartData = res
          this.chartData = {
            bidAmountList: [],
            winBidAmountList: [],
            repayAmountList: [],
            bidNumList: [],
            winBidNumList: [],
          }
          console.log(res, 'chartData')
          res.forEach((item) => {
            this.chartData.bidAmountList.push(this.numberFormat(item.bidAmount))
            this.chartData.winBidAmountList.push(this.numberFormat(item.winBidAmount))
            this.chartData.repayAmountList.push(this.numberFormat(item.repayAmount))
            this.chartData.bidNumList.push(Number(item.bidNum))
            this.chartData.winBidNumList.push(Number(item.winBidNum))
          })
          this.switchYear()
        }
      })
    },
    //钱转换成万元制
    numberFormat(num) {
      return num ? Math.floor(num / 10000).toFixed(0) : 0
    },

    //按地区查看完成额
    queryTenderLimit(param) {
      this.params.level = param.level
      this.params.centId = param.item.id
      this.pageInit()
      this.selectPlace = param.item.name
      console.log(this.selectPlace)
    },
    changeTabs(item) {
      const { name } = item
      this.activeName = name
      console.log(this.activeName)
      this.switchYear()
    },
    switchYear() {
      const monthList = [
        ['1月', '2月', '3月', '4月', '5月', '6月'],
        ['7月', '8月', '9月', '10月', '11月', '12月'],
      ]
      const {
        //投标额
        bidAmountList,
        //中标额
        winBidAmountList,
        //回款额
        repayAmountList,
        //投标数
        bidNumList,
        //中标数
        winBidNumList,
      } = this.chartData
      if (this.activeName === '上半年') {
        this.chartsDataColumn1 = {
          categories: monthList[0],
          series: [
            {
              name: '投标额',
              data: bidAmountList.slice(0, 6),
            },
            {
              name: '中标额',
              data: winBidAmountList.slice(0, 6),
            },
            {
              name: '回款额',
              data: repayAmountList.slice(0, 6),
            },
          ],
        }
        this.chartsDataColumn2 = {
          categories: monthList[0],
          series: [
            {
              name: '投标数',
              data: bidNumList.slice(0, 6),
            },
            {
              name: '中标数',
              data: winBidNumList.slice(0, 6),
            },
          ],
        }
        console.log(this.chartsDataColumn1, this.chartsDataColumn2)
      } else {
        this.chartsDataColumn1 = {
          categories: monthList[1],
          series: [
            {
              name: '投标额',
              data: bidAmountList.slice(6),
            },
            {
              name: '中标额',
              data: winBidAmountList.slice(6),
            },
            {
              name: '回款额',
              data: repayAmountList.slice(6),
            },
          ],
        }
        this.chartsDataColumn2 = {
          categories: monthList[1],
          series: [
            {
              name: '投标数',
              data: bidNumList.slice(6),
            },
            {
              name: '中标数',
              data: winBidNumList.slice(6),
            },
          ],
        }
      }
    },
    //按时间查询
    confirmYear(e) {
      const { value, indexs } = e
      this.defaultIndex = indexs
      const { level, centId } = this.params
      this.params = {
        level: level,
        centId: centId,
        dateFrom: value[0] + '-' + '01-01',
        dateTo: value[0] + '-' + '12-31',
      }
      this.pageInit()
      this.selectYear = value[0] + '年'
      console.log(this.params)
      this.showYear = false
    },
  },
  onLoad() {
    let year = new Date().getFullYear()
    let arr = []
    for (let index = 0; index < 5; index++) {
      arr.unshift(year--)
    }
    this.columnsYear.push(arr)
    this.pageInit()
  },
}
</script>

<style lang="scss" scoped>
.btn-group {
  width: 160px;
  display: flex;
  justify-content: space-between;
  padding: 10rpx;
}
.charts-box {
  height: 800rpx;
}
</style>
