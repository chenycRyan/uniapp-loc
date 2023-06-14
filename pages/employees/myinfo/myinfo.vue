<template>
  <view class="component-container">
    <view class="section-content">
      <qiun-title-bar title="完成额度(万元)" />
      <view class="panel-box">
        <view class="panel" v-for="item in 6" :key="item">
          <view class="panel-foot">{{ completedTotalArray[item] }} </view>
        </view>
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
    <qiun-title-bar title="拜访分析" />
    <view class="pro-box">
      <view class="pro-item">
        <view>拜访次数</view>
        <progress-account :chartData="numberList" :maxValue="maxNumber"></progress-account>
      </view>
      <view class="pro-item">
        <view>客户数量</view>
        <progress-account :chartData="amountList" :maxValue="maxAmount"></progress-account>
      </view>
    </view>
  </view>
</template>

<script>
import { getAssort, getCustomVisit } from '@/api/market.js'
import ChartHorizonset from '../chartHorizonset/chartHorizonset'
import progressAccount from '@/components/progress/newprogress.vue'
export default {
  components: {
    ChartHorizonset,
    progressAccount,
  },
  computed: {
    completedTotalArray() {
      var arr = []
      var olen = this.totalAmount.length
      console.log(this.totalAmount)
      var idx = 0
      for (let i = 0; i < 7; i++) {
        let item = 0
        if (olen + i < 7) {
          item = 0
        } else {
          item = Number(this.totalAmount.substr(idx, 1)) ? Number(this.totalAmount.substr(idx, 1)) : 0
          idx++
        }
        arr.push(item)
      }
      return arr
    },
  },
  data() {
    return {
      maxNumber: 0,
      maxAmount: 0,
      params: {},
      totalAmount: '0',
      completes: [
        {
          name: '本科',
          value: 0,
        },
        {
          name: '高职',
          value: 0,
        },
        {
          name: '中职',
          value: 0,
        },
        {
          name: '技师',
          value: 0,
        },
      ],
      numberList: [
        {
          name: '本科',
          value: 0,
        },
        {
          name: '高职',
          value: 0,
        },
        {
          name: '中职',
          value: 0,
        },
        {
          name: '技师',
          value: 0,
        },
      ],
      amountList: [
        {
          name: '本科',
          value: 0,
        },
        {
          name: '高职',
          value: 0,
        },
        {
          name: '中职',
          value: 0,
        },
        {
          name: '技师',
          value: 0,
        },
      ],
    }
  },
  methods: {
    initPage(params) {
      this.getAssort(params)
      this.getPersonVisit(params)
    },
    //员工完成额度
    getAssort(params) {
      const { dateFrom, dateTo } = params
      const phone = params.mobilePhone
      getAssort({
        dateFrom: dateFrom || '2010-1-1',
        dateTo: dateTo || '2022-1-1',
        level: 'PEOPLE',
        mobilePhone: phone,
      }).then((res) => {
        this.totalAmount = (res.sumTotal / 10000).toFixed(0)
        this.completes.forEach((item) => {
          item.value = 0
        })
        if (!res.assortOrderVos) {
          return
        }
        res.assortOrderVos.forEach((item) => {
          var sumTotal = (Number(item.sumTotal) / 10000).toFixed(0)
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
      })
    },
    //个人拜访分析
    getPersonVisit(params) {
      uni.showLoading({
        title: '正在查询中...',
      })
      const { dateFrom, dateTo } = params
      const phone = params.mobilePhone
      getCustomVisit({
        dateFrom: dateFrom || '2010-1-1',
        dateTo: dateTo || '2022-1-1',
        level: 'PEOPLE',
        mobilePhone: phone,
      })
        .then((res) => {
          //次数
          this.numberList.forEach((item) => {
            item.value = 0
          })

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
          const arr1 = this.numberList.map((item) => item.value)
          this.maxNumber = Math.max(...arr1)
          //数量
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
          console.log(this.maxAmount, '数量')
          // 加载完成
          uni.hideLoading()
          this.$emit('pullDownRefreshComplete')
        })
        .catch((e) => {
          uni.hideLoading()
          this.$emit('pullDownRefreshComplete')
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.component-container {
  width: 100%;
  font-size: 26rpx;

  .section-content {
    .title-line {
      line-height: 50rpx;
      color: black;
      text-indent: 30rpx;
      line-height: 80rpx;
      .unit {
        color: #b2b2b2;
        padding-left: 10rpx;
      }
    }

    .cn-content {
      padding-top: 10rpx;
      box-sizing: border-box;
      height: 500rpx;

      .amountList-box {
        padding: 0px 100rpx;
        height: 150rpx;
      }
    }
  }
}

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
.middle {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 10rpx 0;
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
    background: url(@/static/img/undergraduate.png);
    background-size: 100% 100%;
  }
  .bg1 {
    background: url(@/static/img/vocational-school.png);
    background-size: 100% 100%;
  }
  .bg2 {
    background: url(@/static/img/special-school.png);
    background-size: 100% 100%;
  }
  .bg3 {
    background: url(@/static/img/undergraduate.png);
    background-size: 100% 100%;
  }
}
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
    progress-account {
      width: 100%;
    }
  }
}
</style>
