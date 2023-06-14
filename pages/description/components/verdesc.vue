<template>
  <view class="page-container">
    <view class="card-box" v-for="item in versionList" :key="item.title">
      <view class="card-title">
        <view class="title">{{ item.title }}</view>
        <view class="date">{{ item.date }}</view>
      </view>

      <u-divider></u-divider>
      <view v-for="dto in item.dto" :key="dto">{{ dto }}</view>
    </view>
  </view>
</template>
<script>
import { versionList } from '@/config/version.js'
export default {
  data() {
    return {
      versionList: versionList,
    }
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
