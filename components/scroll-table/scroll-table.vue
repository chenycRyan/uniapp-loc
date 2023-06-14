<template>
  <view class="scroll-table">
    <view class="uni-flex uni-column">
      <view class="wrap-title">
        <view class="th-user">
          <view style="width: 20%">排名</view>
          <view style="width: 20%">姓名</view>
          <view style="width: 60%">位置</view>
        </view>
      </view>
      <view class="wrap-item">
        <view class="lis" :animation="animationData">
          <view v-for="(item, index) in list" :key="index">
            <view class="th-user" :class="index % 2 && 'stripe'">
              <view class="rank" :class="index === 0 && 'first-Rank'">{{ item.rank }}</view>
              <view style="width: 20%">{{ item.name }}</view>
              <view style="width: 60%">{{ item.place }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
    },
  },
  data() {
    return {
      scrollHeight: 0, //向上滚动距离
      height: 0, //.lis高度（滚动框高度）
      animationData: {}, //动画对象
    }
  },
  components: {},
  mounted() {
    console.log('11')
    this.prizeScroll()
  },
  methods: {
    getHeight(Class) {
      let query = uni.createSelectorQuery().in(this)
      query
        .selectAll(Class)
        .boundingClientRect((data) => {
          this.height = data[0].height
        })
        .exec()
    },
    prizeScroll() {
      let speed = 50
      let animation = uni.createAnimation({
        duration: this.getHeight('.lis') / speed,
        timingFunction: 'linear',
        delay: 0,
      })
      this.animation = animation
      setInterval(() => {
        if (this.scrollHeight >= this.height - 150) {
          animation.translateY(0).step()
          this.scrollHeight = 0
          this.animationData = animation.export()
        } else {
          this.scrollHeight = this.scrollHeight + 1
          animation.translateY(-this.scrollHeight).step()
          this.animationData = animation.export()
        }
      }, speed)
    },
  },
}
</script>

<style lang="scss" scoped>
.scroll-table {
  width: 100%;
  padding-top: 10rpx;
  .wrap-title {
    background: #f0f9ff;
    padding: 10rpx;
  }
  .wrap-item {
    overflow: hidden;
    max-height: 350rpx;
    margin: 10rpx;
    .rank {
      background: #e3f5ff;
      border-radius: 50%;
      height: 40rpx;
      width: 40rpx;
      margin: 0 40rpx;
    }
    .first-Rank {
      background: #fed4ce;
    }
  }
  .th-user {
    width: 100%;
    display: flex;
    text-align: center;
    padding: 10rpx 0;
  }
  /* 斑马线 */
  .stripe {
    background: #fafafa;
  }
}
</style>
