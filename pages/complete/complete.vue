<template>
  <view>
    <cell-bar @queryLimit="queryLimit"></cell-bar>
    <u-cell title="选择日期" :isLink="true" arrow-direction="right" isLink :url="'../conditions/conditions?path=' + $mp.page.route">
      <view slot="value">{{ selectTime }}</view>
    </u-cell>
    <qiun-title-bar :title="year + '年目标额(万元)'" />

    <view class="panel-box">
      <view class="panel" v-for="item in 6" :key="item">
        <view class="panel-foot">{{ totalTarget[item] }} </view>
      </view>
    </view>
    <view class="target-rate"> 完成率：{{ ratePercent }}% </view>
    <qiun-title-bar title="完成额度(万元)" />
    <view class="range" style="margin: 10px"> 查询范围: {{ selectTime }}</view>
    <view class="panel-box">
      <view class="panel" v-for="item in 6" :key="item">
        <view class="panel-foot">{{ totalAmount[item] }} </view>
      </view>
    </view>
    <view class="middle">
      <view class="card-box" v-for="(item, index) in completes" :key="index" :class="'bg' + index">
        <view class="title">
          <view class="title-l">{{ item.name }}</view>
          <view class="title-r">完成额度</view>
        </view>
        <view class="content">{{ item.value }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { getAssort, getRank } from '@/api/market.js'
import cellBar from '@/components/cell-bar/cell-bar.vue'
import chartProcess from '@/components/chart-process.vue'
export default {
  components: { chartProcess, cellBar },

  data() {
    return {
      year: '',
      totalTarget: [],
      ratePercent: 0,

      selectTime: '',

      params: {
        level: this.$companyLevel,
        dateFrom: this.$defalutFrom,
        dateTo: this.$defalutTo,
      },
      totalAmount: [],
      completes: [
        {
          name: '本科',
          value: '',
        },
        {
          name: '高职',
          value: '',
        },
        {
          name: '中职',
          value: '',
        },
        {
          name: '技师',
          value: '',
        },
      ],
      chartsDataRing1: {},
      opts: {
        title: { name: '' },
        subtitle: { name: '' },
        legend: { position: 'bottom' },
        extra: { ring: { ringWidth: 30, linearType: 'custom' } },
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
    this.getAssort()
    this.getCompanyTarget()
  },
  methods: {
    completedTotalArray(total) {
      var arr = []
      var olen = total.length
      var idx = 0
      for (let i = 0; i < 7; i++) {
        let item = 0
        if (olen + i < 7) {
          item = 0
        } else {
          item = Number(total.substr(idx, 1)) ? Number(total.substr(idx, 1)) : 0
          idx++
        }
        arr.push(item)
      }

      return arr
    },
    //今年目标额
    getCompanyTarget() {
      this.year = new Date(this.params.dateTo).getFullYear()
      const params = {
        centId: this.params.centId,
        level: this.params.level || this.$companyLevel,
        dateFrom: new Date(this.params.dateFrom).getFullYear() + '-01-01',
        dateTo: new Date(this.params.dateTo).getFullYear() + '-12-31',
      }
      getRank(params).then((res) => {
        const total = (res.completeRateVoList[0].targetAmount / 10000).toFixed(0) || 0
        this.totalTarget = this.completedTotalArray(total)
        this.ratePercent = (res.completeRateVoList[0].rate * 100).toFixed(2) || 0
      })
    },
    //获取本科高职中职技师完成额
    getAssort() {
      uni.showLoading({
        title: '正在查询中...',
      })
      getAssort(this.params).then((res) => {
        uni.hideLoading()
        const total = (res.sumTotal / 10000).toFixed(0)
        this.totalAmount = this.completedTotalArray(total)
        this.completes.forEach((item) => {
          item.value = 0
        })
        if (res.assortOrderVos && res.assortOrderVos.length > 0) {
          res.assortOrderVos.forEach((item) => {
            var sumTotal = (Number(item.sumTotal) / 10000).toFixed(2)
            if (item.typeCodeDesc == '本科') {
              this.completes[0].value = Number(sumTotal)
            }
            if (item.typeCodeDesc == '高职') {
              this.completes[1].value = Number(sumTotal)
            }
            if (item.typeCodeDesc == '中职') {
              this.completes[2].value = Number(sumTotal)
            }
            if (item.typeCodeDesc == '技师') {
              this.completes[3].value = Number(sumTotal)
            }
          })
        }
      })
    },

    //按地区查看完成额
    queryLimit(param) {
      this.params.level = param.level
      this.params.centId = param.item.id
      this.getAssort()
      this.getCompanyTarget()
    },
  },
}
</script>

<style lang="scss" scoped>
.panel-box {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  margin-bottom: 20rpx;
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
.target-rate {
  padding-left: 50rpx;

  font-size: 32rpx;
}
.middle {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 20rpx 0;
  .card-box {
    width: 40%;
    height: 150rpx;
    border-radius: 20rpx;
    margin: 10rpx;
    font-size: 28rpx;
    padding: 10rpx;
    .title {
      display: flex;
      align-items: center;
      .title-l {
        flex: 1;
        color: #fff;
        font-size: 22rpx;
      }
      .title-r {
        flex: 3;
      }
    }
    .content {
      text-align: center;
      color: #fff;
      padding-top: 20rpx;
      font-size: 50rpx;
    }
  }
  .bg0 {
    background: url(../../static/img/undergraduate.png);
    background-size: 100% 100%;
  }
  .bg1 {
    background: url(../../static/img/vocational-school.png);
    background-size: 100% 100%;
  }
  .bg2 {
    background: url(../../static/img/special-school.png);
    background-size: 100% 100%;
  }
  .bg3 {
    background: url(../../static/img/undergraduate.png);
    background-size: 100% 100%;
  }
}
</style>
