<template>
  <view class="cn-component-container">
    <ul class="cn-item-list" @mouseover="stopScroll" @mouseout="startScroll">
      <li class="cn-item" v-bind:class="{ cnuphide: index == 0 && isuphide }" v-for="(item, index) in chartList" :key="item.id">
        <view class="cn-content">
          <view class="cn-title">
            <view class="cn-tleft">{{ item.name }} {{ item.value }}</view>
          </view>
          <view class="cn-line cn-shadow-blur" v-bind:style="{ width: getWidth(item.value), backgroundColor: item.color }"></view>
        </view>
      </li>
    </ul>
  </view>
</template>

<script>
export default {
  data() {
    return {
      maxValue: 500,
      unit: '万',
      bgcolorList: ['#4FE9F4', '#E7B409', '#5D61ED', '#2FD881', '#E67209', '#4FE9F4', '#E7B409', '#5D61ED', '#2FD881', '#E67209'],
      chartList: [],
      chartData: [
        {
          id: '101',
          rank: 1,
          name: '本科',
          value: '400',
          color: '#4FE9F4'
        },
        {
          id: '102',
          rank: 2,
          name: '高职',
          value: '200',
          color: '#E7B409'
        },
        {
          id: '103',
          rank: 3,
          name: '中职',
          value: '190',
          color: '#5D61ED'
        },
        {
          id: '104',
          rank: 4,
          name: '技师',
          value: '150',
          color: '#2FD881'
        }
      ],
      scrollTimer: null,
      isuphide: false,
      intervalTime: 3000
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.chartList = this.chartData.slice(0, 4)
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
        this.chartList = next.slice(0, 4)
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
    }
  }
}
</script>

<style lang="scss" scoped>
.cn-component-container {
  width: 90%;
  height: 100%;

  .cn-item-list {
    width: 100%;
    height: 100%;
    padding: 10px;
    overflow: hidden;
    .cn-item {
		&:first-child{
		  margin-top: 20rpx;
		}
		margin-top: 30rpx;
	
  
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

      .cn-content {
        width: 100%;
        .cn-title {
          display: flex;
          .cn-tleft {
            width: 100%;
            text-align: left;
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
