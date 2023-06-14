<template>
  <view class="cn-component-container">
    <ul class="cn-item-list" @mouseover="stopScroll" @mouseout="startScroll">
      <li class="cn-item" v-bind:class="{ cnuphide: index == 0 && isuphide }" v-for="(item, index) in chartData" :key="item.id">
        <view class="rank">
          <u--image src="../../static/img/no1.png" width="32rpx" height="46rpx" v-if="item.rank === 1"></u--image>
          <u--image src="../../static/img/no2.png" width="32rpx" height="46rpx" v-else-if="item.rank === 2"></u--image>
          <u--image src="../../static/img/no3.png" width="32rpx" height="46rpx" v-else-if="item.rank === 3"></u--image>
          <view v-else> {{ item.rank }}</view>
        </view>

        <view class="cn-content">
          <view class="cn-title">
            <view class="cn-tleft">{{ item.name }} </view>
            <view class="cn-tright" v-if="showPercent">{{ item.value }}%</view>
            <view class="cn-tright" v-else>{{ item.value }}{{ unit }}</view>
          </view>
          <view
            class="cn-line cn-shadow-blur"
            v-bind:style="{ width: getWidth(item.value), backgroundColor: bgcolorList[index % 10] }"
          ></view>
        </view>
      </li>
    </ul>
  </view>
</template>

<script>
export default {
  props: {
    showPercent: {
      type: Boolean,
      default: false,
    },
    unit: {
      type: String,
      default: () => '万',
    },
    max: {
      type: Number,
      default: () => 100,
    },
    chartData: {
      type: Array,
      default: function () {
        return [
          {
            id: '101',
            rank: 1,
            name: '济南',
            value: '300',
            color: '#4FE9F4',
          },
          {
            id: '102',
            rank: 2,
            name: '江苏',
            value: '200',
            color: '#E7B409',
          },
          {
            id: '103',
            rank: 3,
            name: '浙江',
            value: '190',
            color: '#5D61ED',
          },
          {
            id: '104',
            rank: 4,
            name: '西安',
            value: '150',
            color: '#2FD881',
          },
          {
            id: '105',
            rank: 5,
            name: '广州',
            value: '100',
            color: '#E67209',
          },
        ]
      },
    },
  },
  data() {
    return {
      bgcolorList: ['#4FE9F4', '#E7B409', '#5D61ED', '#2FD881', '#E67209', '#4FE9F4', '#E7B409', '#5D61ED', '#2FD881', '#E67209'],
      scrollTimer: null,
      isuphide: false,
      intervalTime: 3000,
    }
  },
  computed: {
    maxValue() {
      if (this.max) {
        return this.max
      }
      const arr = this.chartData.map((item) => item.value)
      console.log(Math.max(...arr))
      return Math.max(...arr)
    },
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.startScroll()
    },
    scroll() {
      const chartData = this.chartData
      const first = chartData[0]
      const next = chartData.slice(1)
      next.push(first)
      this.isuphide = true
      setTimeout(() => {
        this.isuphide = false
        this.chartList = next.slice(0, 5)
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
      // this.scrollTimer = setInterval(this.scroll, this.intervalTime)
    },
  },
}
</script>

<style lang="scss" scoped>
.cn-component-container {
  width: 90%;
  padding-left: 10px;
  .cn-item-list {
    width: 100%;
    height: 100%;
    overflow: auto;
    max-height: 450rpx;
    padding: 0;
    .cn-item {
      &:first-child {
        margin-top: 20rpx;
      }
      margin: 40rpx 0;
      width: inherit;
      height: 20%;
      display: flex;
      flex-direction: row;
      align-items: center;
      text-align: center;
      transition: all 0.3s;
      overflow: hidden;
      &.cnuphide {
        height: 0px;
      }
      .rank {
        // background: #e3f5ff;
        // border-radius: 50%;
        height: 46rpx;
        width: 32rpx;
        margin: 0 40rpx;
        // color: #2a7aef;
      }
      .first-Rank {
        // color: #db8b5a;
        // background: #fed4ce;
      }
      .cn-content {
        width: 85%;
        .cn-title {
          display: flex;
          .cn-tleft {
            width: 50%;

            text-align: left;
          }
          .cn-tright {
            width: 50%;
            text-align: right;
            color: #04d2e9;
          }
        }
        .cn-line {
          width: 0px;
          height: 8rpx;
          transition: width 1s linear;
        }
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
</style>
