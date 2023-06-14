<template>
  <view>
    <view class="mask"></view>

    <view>
      <view class="updateBox">
        <image src="https://www.huiborobot.com.cn:3183/static/hbcloud/popup/update_bg.png"></image>
        <view class="wrapBox">
          <view class="version">
            发现新版本
            <!-- <view>v{{ $appVersion }}</view> -->
          </view>
          <view class="desc-t">更新内容：</view>
          <view class="desc">
            <rich-text :nodes="content"></rich-text>
          </view>
          <view class="btnbox">
            <!-- <view class="btnno" @click="close">暂不升级</view> -->
            <view class="btnUp" @click="eventClick">立即升级</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    content: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  methods: {
    close() {
      this.$emit('close')
    },
    eventClick() {
      this.$emit('eventClick')
    },
  },
}
</script>

<style lang="scss">
.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 888;
  background-color: rgba(0, 0, 0, 0.6);
}
.btn {
  width: 70%;
  margin: 20rpx auto;
  margin-top: 40rpx;
  padding: 20rpx 0px;
  text-align: center;
  background: #4884ff;
  border-radius: 34px;
  font-size: 30rpx;
  color: #fff;
}

.updateBox {
  position: absolute;
  top: 30%;
  z-index: 998;
  width: 80%;
  left: 10%;
  padding: 10rpx;
  height: 700rpx;
  image {
    width: 100%;
    height: 100%;
  }
  .wrapBox {
    position: absolute;
    width: 85%;
    left: 50rpx;
    top: 40rpx;
    padding: 10rpx 20rpx;
    .version {
      font-size: 35rpx;
      color: #fff;
    }
    .desc-t {
      margin-top: 120rpx;
      font-size: 36rpx;
      font-weight: bold;
    }
  }
}
.desc {
  height: 180rpx;
  overflow: scroll;
  padding-top: 60rpx;
  font-size: 30rpx;
  color: #666;
  line-height: 50rpx;
}
.btnbox {
  display: flex;
  justify-content: space-around;
  margin: 40rpx 0rpx 20rpx 0rpx;
  margin-top: 50rpx;
  .btnno {
    padding: 10rpx 30rpx;
    background-color: #f8f8f8;
    border-radius: 10rpx;
    font-size: 30rpx;
    color: #666;
  }
  .btnUp {
    padding: 10rpx 30rpx;
    background-color: #4884ff;
    border-radius: 10rpx;
    font-size: 30rpx;
    color: #fff;
  }
}
</style>
