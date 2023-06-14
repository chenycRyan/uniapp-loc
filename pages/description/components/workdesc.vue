<template>
  <view class="page-container">
    <view class="card-box">
      <view class="card-title">
        <view class="title">{{ workdesc.title }} </view>
      </view>

      <u-divider></u-divider>
      <view v-for="item in workdesc.dto" :key="item">
        {{ item }}
      </view>
    </view>
  </view>
</template>
<script>
import { getParamConfig } from '@/api/market.js'
export default {
  data() {
    return {
      workdesc: {
        title: '考勤计入时间',
        dto: [],
      },
    }
  },
  mounted() {
    getParamConfig().then((res) => {
      const from = '开始时间：' + res.filter((item) => item.name === 'T_QUERYCHECKFROM')[0].value
      const to = '截止时间：' + res.filter((item) => item.name === 'T_QUERYCHECKTO')[0].value
      const desc1 = '其余时间为非工作时间'
      const desc2 = '非工作时间打卡无效！！！'
      this.workdesc.dto = [from, to, desc1, desc2]
    })
  },
}
</script>
<style lang="scss" scoped>
.page-container {
  padding: 30rpx;
  .card-box {
    box-shadow: 0 2px 12px 0 #eeeeee;
    border-radius: 10px;
    border: 1px solid #ebeef5;
    background-color: #fff;
    overflow: hidden;
    color: #303133;
    transition: 0.3s;
    padding: 20rpx 40rpx 10rpx;
    margin-bottom: 20rpx;
    line-height: 60rpx;
    .card-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        font-size: 40rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
      }
      .date {
        font-size: 26rpx;
      }
    }

    /deep/ .u-divider {
      margin: 5rpx 0 !important;
    }
  }
}
</style>
