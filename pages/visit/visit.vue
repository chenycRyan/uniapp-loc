<template>
  <view>
    <cell-bar @queryLimit="queryLimit" :date="params.dateFrom"></cell-bar>
    <u-cell title="选择日期" :isLink="true" arrow-direction="right" isLink :url="'../conditions/conditions?path=' + $mp.page.route">
      <view slot="value">{{ selectTime }}</view>
    </u-cell>
    <qiun-title-bar title="拜访分析" />
    <!-- <view class="range">统计范围： {{ selectPlace }} {{ selectTime }}</view> -->
    <view class="pro-box">
      <view class="pro-item">
        <view>拜访次数</view>
        <progress-account :chartData="numberList" :maxValue="maxNumber"></progress-account>
      </view>
      <view class="pro-item">
        <view>客户数量</view>
        <progress-account :chartData="amountList" :maxValue="maxAmount" :addSchoolList="addSchoolList"></progress-account>
      </view>
    </view>
    <qiun-title-bar title="拜访次数占比" />
    <!-- <view class="range">统计范围： {{ selectPlace }} {{ selectTime }}</view> -->
    <view class="charts-box">
      <qiun-data-charts type="ring" :opts="opts" v-if="showChart" :chartData="chartsDataRing" />
      <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    </view>
    <u-toast ref="uToast"></u-toast>
  </view>
</template>

<script>
import { getCustomVisit, getCustomTotal, getAddSchool } from '@/api/market.js'
import progressAccount from '@/components/progress/newprogress.vue'
import cellBar from '@/components/cell-bar/cell-bar.vue'
export default {
  components: { progressAccount, cellBar },
  data() {
    return {
      addSchoolList: [],
      showChart: true,
      maxNumber: 0,
      maxAmount: 0,
      selectPlace: '全国', //选中的区域
      selectTime: '',
      params: {
        level: this.$companyLevel,
        dateFrom: this.$defalutFrom,
        dateTo: this.$defalutTo,
      },
      chartsDataRing: {},
      opts: {
        title: { name: '' },
        subtitle: { name: '' },
        legend: { position: 'bottom' },
        extra: { ring: { ringWidth: 30, linearType: 'custom' } },
      },
      numberList: [
        {
          name: '本科',
          value: 0,
          total: 0,
          allSchool: 0,
        },
        {
          name: '高职',
          value: 0,
          total: 0,
          allSchool: 0,
        },
        {
          name: '中职',
          value: 0,
          total: 0,
          allSchool: 0,
        },
        {
          name: '技师',
          value: 0,
          total: 0,
          allSchool: 0,
        },
      ],
      amountList: [
        {
          name: '本科',
          value: 0,
          addSchool: 0,
        },
        {
          name: '高职',
          value: 0,
          addSchool: 0,
        },
        {
          name: '中职',
          value: 0,
          addSchool: 0,
        },
        {
          name: '技师',
          value: 0,
          addSchool: 0,
        },
      ],
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
    this.selectTime = `${this.params.dateFrom} 至 ${this.params.dateTo}`

    this.getPersonVisit()
    this.getCustomTotal()
  },

  methods: {
    //拜访分析
    getPersonVisit() {
      uni.showLoading({
        title: '正在查询中...',
      })
      getCustomVisit(this.params).then((res) => {
        uni.hideLoading()
        //次数
        this.showChart = true
        this.numberList.forEach((item) => {
          item.value = 0
        })
        if (res.numOfVisit.length > 0) {
          res.numOfVisit.forEach((item) => {
            if (item.customType == '本科') {
              this.numberList[0].value = Number(item.num)
            }
            if (item.customType == '高职') {
              this.numberList[1].value = Number(item.num)
            }
            if (item.customType == '中职') {
              this.numberList[2].value = Number(item.num)
            }
            if (item.customType == '技师') {
              this.numberList[3].value = Number(item.num)
            }
          })
        } else {
          this.showChart = false
          this.$refs.uToast.show({
            type: 'default',
            title: '默认主题',
            message: '查询无数据',
            iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/default.png',
          })
        }
        const chartList = this.numberList.filter((item) => item.value !== 0)

        this.chartsDataRing = {
          series: [
            {
              format: 'pieVisit',
              data: chartList,
            },
          ],
        }
        const arr1 = this.numberList.map((item) => item.value)
        this.maxNumber = Math.max(...arr1)
        //客户数量
        this.amountList.forEach((item) => {
          item.value = 0
        })
        res.quantity.forEach((item) => {
          if (item.customType == '本科') {
            this.amountList[0].value = Number(item.num)
          }
          if (item.customType == '高职') {
            this.amountList[1].value = Number(item.num)
          }
          if (item.customType == '中职') {
            this.amountList[2].value = Number(item.num)
          }
          if (item.customType == '技师') {
            this.amountList[3].value = Number(item.num)
          }
        })
        const arr2 = this.amountList.map((item) => item.value)
        this.maxAmount = Math.max(...arr2)
        console.log(this.amountList, '数量')
      })
    },
    //查询总数量
    getCustomTotal() {
      getAddSchool(this.params).then((res) => {
        if (res.length > 0) {
          const benkeList = res.filter((item) => item.typeCodeDesc === '本科')
          const gaozhiList = res.filter((item) => item.typeCodeDesc === '高职')
          const zhongzhiList = res.filter((item) => item.typeCodeDesc === '中职')
          const jishiList = res.filter((item) => item.typeCodeDesc === '技师')
          this.addSchoolList = [benkeList, gaozhiList, zhongzhiList, jishiList]
          this.amountList[0].addSchool = benkeList.length
          this.amountList[1].addSchool = gaozhiList.length
          this.amountList[2].addSchool = zhongzhiList.length
          this.amountList[3].addSchool = jishiList.length
        }
      })

      getCustomTotal(this.params).then((res) => {
        //客户数量
        this.numberList.forEach((item) => {
          item.total = 0
          item.allSchool = 0
        })
        console.log(this.numberList, '  this.numberList')
        res.forEach((item) => {
          if (item.customType == '本科') {
            this.numberList[0].total = Number(item.num)
            this.numberList[0].allSchool = Number(item.allSchool)
          }
          if (item.customType == '高职') {
            this.numberList[1].total = Number(item.num)
            this.numberList[1].allSchool = Number(item.allSchool)
          }
          if (item.customType == '中职') {
            this.numberList[2].total = Number(item.num)
            this.numberList[2].allSchool = Number(item.allSchool)
          }
          if (item.customType == '技师') {
            this.numberList[3].total = Number(item.num)
            this.numberList[3].allSchool = Number(item.allSchool)
          }
        })

        console.log(this.numberList)
        console.log(this.amountList)
      })
    },
    //按地区查看拜访
    queryLimit(param) {
      this.params.level = param.level
      this.params.centId = param.item.id
      this.getPersonVisit()
      this.getCustomTotal()
      this.selectPlace = param.item.name
    },
  },
}
</script>

<style lang="scss" scoped>
.pro-box {
  display: flex;
  justify-content: center;
  margin-top: 10rpx;
  .pro-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 40%;
    height: 100%;
    padding: 10rpx;
    border-radius: 20rpx;
    background: #f5f8ff;
    margin: 10rpx;
    .progress {
      width: 100%;
    }
  }
}
.charts-box {
  height: 500rpx;
}
</style>
