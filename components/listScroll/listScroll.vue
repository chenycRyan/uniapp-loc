<template>
  <view class="cn-component-container" ref="cnContainer" v-bind:style="{ fontSize: cnFontSize }">
    <view class="cn-item-list">
      <view class="cn-item cn-item-first">
        <view v-for="(item, index) in columns" :key="index" :style="{ width: item.width || 'auto' }">
          {{ item.title }}
        </view>
      </view>
      <view class="cn-item" v-bind:class="{ cnuphide: index == 0 && isuphide }" v-for="(item, index) in chartList" :key="item.id">
        <view v-for="(col, i) in columns" :key="i" :style="{ width: col.width || 'auto', color: col.color }">
          {{ item[col.key] }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    columns: Array,
    listData: Array,
    unit: {
      type: String,
      default: '',
    },
    isScroll: {
      type: Boolean,
      default: false,
    },
    isIndex: {
      type: Boolean,
      default: false,
    },
    isValueColor: {
      type: Boolean,
      default: false,
    },
    max: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      maxValue: 500,
      bgcolorlist: ['#4FE9F4', '#E7B409', '#5D61ED', '#2FD881', '#E67209', '#4FE9F4', '#E7B409', '#5D61ED', '#2FD881', '#E67209'],
      chartList: [],
      scrollTimer: null,
      isuphide: false,
      intervalTime: 3000,
      cnHeight: 200,
      cnAnimate: true,
      listData: [],
    }
  },
  computed: {
    cnFontSize() {
      // W 172
      // F 24 16 18
      // console.log('Math.floor(this.cnHeight / 172 * 32) height:' + this.cnHeight, Math.floor(this.cnHeight / 172 * 32))
      return '26rpx'
    },
  },
  mounted() {
    var _this = this
    uni.$on('updateListscroll', function (data) {
      console.log('监听到事件来自 update ，携带参数 为：' + data)
      _this.reinit()
      console.log(_this.listData)
    })
    console.log('isValueColor', this.isValueColor)
  },
  destroyed() {
    this.stopScroll()
  },
  methods: {
    init() {
      this.$nextTick(() => {
        this.cnHeight = 200
        this.chartData = this.listData
        console.log('this.cnHeight', this.cnHeight)
        var maxValue = 0
        if (this.max === 0) {
          this.listData.forEach((item, index) => {
            maxValue += Number(item.value)
            item.id = index
          })
        } else {
          maxValue = this.max
        }
        this.listData.forEach((item, index) => {
          item.id = index
        })
        this.maxValue = maxValue
        console.log('this.maxValue', this.maxValue)
        console.log(this.listData)
        const pageSize = this.listData.length > 6 ? 6 : this.listData.length
        this.chartList = this.listData.slice(0, pageSize)
        console.log(this.chartList, 'chartList')
        console.log(this.listData, 'isScroll', this.isScroll, 'this.listDataIndex', this.isIndex)
        if (this.isScroll === true) this.startScroll()
        setTimeout(() => {
          this.cnAnimate = false
        }, 3000)
      })
    },
    reinit() {
      this.stopScroll()
      this.chartList = []
      this.scrollTimer = null
      this.isuphide = false
      this.cnAnimate = true
      this.chartData = this.listData
      const pageSize = this.listData.length > 6 ? 6 : this.listData.length
      this.chartList = this.listData.slice(0, pageSize)
      console.log('this.listData', this.listData)
      if (this.isScroll === true) this.startScroll()
      setTimeout(() => {
        this.cnAnimate = false
      }, 3000)
    },
    scroll() {
      // console.log('this.chartData', this.chartData)
      const chartData = this.chartData
      const first = chartData[0]
      const next = chartData.slice(1)
      next.push(first)
      this.isuphide = true
      setTimeout(() => {
        this.isuphide = false
        this.chartList = next.slice(0, 6)
        this.chartData = next
      }, 300)
    },
    getWidth(val) {
      const perc = Math.round((val / this.maxValue) * 100)
      return perc + '%'
    },
    clearTimer() {
      if (this.scrollTimer) {
        clearInterval(this.scrollTimer)
        this.scrollTimer = null
      }
    },
    stopScroll() {
      this.clearTimer()
    },
    startScroll() {
      this.clearTimer()
      if (this.listData.length > 5) {
        this.scrollTimer = setInterval(this.scroll, this.intervalTime)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.cn-component-container {
  width: 100%;
  height: 100%;
  color: #f0f0f0;
  font-size: 26rpx;
  .cn-item-list {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .cn-item.cn-item-first {
      height: 20%;
      min-height: 80rpx;
      flex-grow: 0;
      background-color: #ebeef5;
      border: 1px solid #dcdfe6;
      .info {
        color: black;
      }
    }
    .cn-item {
      width: inherit;
      height: 16%;
      min-height: 64rpx;
      flex-grow: 0;
      flex-shrink: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      text-align: center;
      transition: all 0.3s;
      overflow: hidden;
      position: relative;
      color: black;
      &.cnuphide {
        height: 0px;
      }
    }
  }
  .cn-shadow-blur {
    position: relative;
  }
  .cn-shadow-blur::before {
    content: '';
    display: block;
    background: inherit;
    filter: blur(5px);
    position: absolute;
    width: 100%;
    height: 100%;
    top: 5px;
    left: 5px;
    z-index: 0;
    opacity: 0.4;
    transform-origin: 0 0;
    border-radius: inherit;
    transform: scale(1);
  }
}
@keyframes fade {
  from {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes viewneshow {
  from {
    opacity: 0;
    -webkit-transform: translate(-100%, 0);
    transform: translate(-100%, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: translate(0px, 0);
    transform: translate(0px, 0);
  }
}
</style>
