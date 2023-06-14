<template>
  <view>
    <view class="uni-margin-wrap">
      <swiper
        class="swiper"
        circular
        :indicator-dots="indicatorDots"
        :autoplay="autoplay"
        :interval="interval"
        :duration="duration"
        v-if="showImg"
      >
        <swiper-item v-for="item in list" :key="item">
          <!-- <u--image :src="item" width="100%" height="300rpx"></u--image> -->
          <image style="height: 300rpx; width: 100%" mode="widthFix" :src="item"></image>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => [require('@/static/img/banner1.png'), require('@/static/img/banner.png')],
    },
  },
  watch: {
    list() {
      this.showImg = false
      setTimeout(() => {
        this.showImg = true
      }, 200)
    },
  },
  data() {
    return {
      showImg: true,
      background: ['color1', 'color2', 'color3'],
      indicatorDots: true,
      autoplay: true,
      interval: 3000,
      duration: 500,
    }
  },
}
</script>

<style lang="scss">
/deep/.uni-swiper-dot-active {
  background-color: #fff !important;
}
/deep/.uni-swiper-dots-horizontal {
  bottom: 20px;
}
.uni-margin-wrap {
  width: 690rpx;
  width: 100%;
}
.swiper {
  height: 320rpx;
}
</style>
