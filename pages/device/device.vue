<template>
  <view>
    <cell-bar @queryLimit="queryLimit"></cell-bar>

    <u-cell title="选择日期" :isLink="true" arrow-direction="right" isLink :url="'../conditions/conditions?path=' + $mp.page.route">
      <view slot="value">{{ selectTime }}</view>
    </u-cell>
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
    <qiun-title-bar title="设备统计" />
    <!-- <view class="range">统计范围：{{ selectPlace }} {{ selectTime }}</view> -->
    <view class="range" v-if="activeName == '金额统计'">单位：万元</view>
    <view class="range" v-else>单位：套数</view>
    <view v-if="showChart">
      <view class="charts-box" :style="{ height: 300 + chartlength * 100 + 'rpx' }">
        <qiun-data-charts type="bar" :opts="optsBar" :chartData="chartsDataColumn" />
      </view>
      <!-- <qiun-data-charts type="column" :opts="optsColumn" :chartData="chartsDataColumn" /> -->
    </view>
    <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    <qiun-title-bar title="统计占比" />
    <view class="charts-box" v-if="showChart">
      <qiun-data-charts type="ring" :opts="optsRing" :chartData="chartsDataRing" />
    </view>
    <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
    <u-toast ref="uToast"></u-toast>
  </view>
</template>

<script>
import { getEquipment } from '@/api/market.js'
import progressAccount from '@/components/progress/progress.vue'
import cellBar from '@/components/cell-bar/cell-bar.vue'
export default {
  components: { progressAccount, cellBar },
  data() {
    return {
      chartlength: 0,
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
      resData: [],
      showChart: true,
      selectPlace: '全国', //选中的区域
      selectTime: '',
      deviceName: {
        '1+X设备': '1+X',
        工业机器人技术应用国赛设备: '机器人赛',
        智能制造单元生产与管控国赛设备: '管控国赛',
        精密模具国赛设备: '模具国赛',
        智能传感器国赛设备: '传感国赛',
      },
      params: {
        level: this.$companyLevel,
        dateFrom: this.$defalutFrom,
        dateTo: this.$defalutTo,
      },
      activeName: '金额统计',
      typeList: [
        {
          name: '金额统计',
        },
        {
          name: '套数统计',
        },
      ],
      chartsDataColumn: {},
      optsColumn: {
        fontSize: 11,
        color: ['#A3DFFC'],
        xAxis: {
          fontSize: 12,
        },
        extra: {
          column: {
            width: 10,
            linearType: 'custom',
            seriesGap: 2,
            linearOpacity: 0.5,
            barBorderCircle: true,
            customColor: ['#1965F1'],
          },
        },
      },
      chartsDataRing: {},
      optsRing: {
        legend: { position: 'bottom' },
        extra: { ring: { ringWidth: 20, linearType: 'custom' } },
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
    this.selectTime = `${this.params.dateFrom} 至 ${this.params.dateTo}`
    this.getDeviceData()
  },
  methods: {
    getDeviceData() {
      uni.showLoading({
        title: '正在查询中...',
      })
      getEquipment(this.params).then((res) => {
        uni.hideLoading()
        if (res.length === 0) {
          this.$refs.uToast.show({
            type: 'default',
            title: '默认主题',
            message: '设备查询数据为空',
          })
          this.showChart = false
          return
        }
        this.showChart = true
        this.resData = res
        this.classify()
      })
    },
    changeTabs(item) {
      console.log(item)
      this.activeName = item.name
      this.classify()
    },
    //处理设备统计
    classify() {
      const res = this.resData
      var subjectType = ['本科', '高职', '中职', '技师']
      var subjects = {}
      res.forEach((item) => {
        var subjectName = item.subjectName
        if (!subjects[subjectName])
          subjects[subjectName] = {
            num: [0, 0, 0, 0],
            totalAmount: [0, 0, 0, 0],
          }

        if (subjectType.indexOf(item.customType) >= 0) {
          subjects[subjectName].num.splice(subjectType.indexOf(item.customType), 1, Number(item.amount))

          subjects[subjectName].totalAmount.splice(
            subjectType.indexOf(item.customType),
            1,
            Number((Number(item.totalAmount) / 10000).toFixed(0))
          )
        }
      })
      // this.activeName === '金额统计' ? subjects : Number(item.amount)
      console.log(subjects, 'subjects')

      const sumToltal = Object.values(subjects).map((item) => {
        return item.totalAmount.reduce((sum, number) => {
          return sum + number
        }, 0)
      })
      const sumNum = Object.values(subjects).map((item) => {
        return item.num.reduce((sum, number) => {
          return sum + number
        }, 0)
      })

      let chartData = Object.keys(subjects).map((item, index) => {
        const total = this.activeName === '金额统计' ? sumToltal[index] : sumNum[index]
        return {
          name: item,
          value: total,
          totalAmount: sumToltal[index],
        }
      })

      //按总和排序
      chartData = chartData.sort((a, b) => {
        return b.totalAmount - a.totalAmount
      })
      console.log(chartData)

      this.chartlength = chartData.length
      console.log(chartData)
      //求和占比圆环图
      this.chartsDataRing = {
        series: [
          {
            data: chartData,
          },
        ],
      }
      let sumData = []
      chartData.forEach((item) => {
        Object.keys(subjects).forEach((key) => {
          const val = this.activeName === '金额统计' ? subjects[key].totalAmount : subjects[key].num
          if (item.name == key) {
            sumData.push({
              key: key,
              value: val,
            })
          }
        })
      })
      //超过三条截取显示前5个字
      const subjectNameList = sumData.map((item) => {
        return item.key
      })

      //处理设备统计
      let seriesData = [
        {
          name: '本科',
          data: [],
        },
        {
          name: '高职',
          data: [],
        },
        {
          name: '中职',
          data: [],
        },
        {
          name: '技师',
          data: [],
        },
      ]
      sumData.forEach((item) => {
        seriesData[0].data.push(item.value[0])
        seriesData[1].data.push(item.value[1])
        seriesData[2].data.push(item.value[2])
        seriesData[3].data.push(item.value[3])
      })
      this.$nextTick(() => {
        //折线图
        this.chartsDataColumn = {
          categories: subjectNameList,
          series: seriesData,
        }
      })
      //解决只在移动端复现的图表压缩的Bug
      setTimeout(() => {
        //折线图
        this.chartsDataColumn = {
          categories: subjectNameList,
          series: seriesData,
        }
      }, 500)

      console.log(seriesData, 'seriesData')

      console.log(sumData, 'sumData')
      console.log(subjectNameList, 'subjectNameList')
    },
    //按地区查看
    queryLimit(param) {
      this.params.level = param.level
      this.params.centId = param.item.id
      this.getDeviceData()
      this.selectPlace = param.item.name
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
