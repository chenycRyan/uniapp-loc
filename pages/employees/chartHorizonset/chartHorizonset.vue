<template>
  <view class="cn-component-container" ref="cnContainer" v-bind:style="{ fontSize: cnFontSize }">
    <view class="cn-item-list" @mouseover="stopScroll" @mouseout="startScroll">
      <view class="cn-item" v-bind:class="{ cnuphide: index == 0 && isuphide }" v-for="(item,index) in chartList" :key="item.id">
        <view class="cn-index" v-if="isIndex">
          <text class="cn-cindex">{{ item.rank }}</text>  
          <text class="cn-fviewcker"></text>
          <text class="cn-circle"></text>
        </view>
        <view class="cn-content">
          <view class="cn-title">
            <view class="cn-tleft">{{item.name}}</view>
            <view class="cn-tright" v-if="isValueColor" v-bind:style="{ color: item.color }"><text class="cn-value">{{item.value}}{{unit}}</text></view>
            <view class="cn-tright" v-else><text class="cn-value">{{item.value}}{{unit}}</text></view>
          </view>
          <view class="cn-viewne cn-shadow-blur" v-bind:class="{ cnanimate: cnAnimate }" v-bind:style="{ width: getWidth(item.value), backgroundColor: item.color }"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    listData: Array,
    unit: {
      type: String,
      defaviewt: ''
    },
    isScroll: {
      type: Boolean,
      defaviewt: false
    },
    isIndex: {
      type: Boolean,
      defaviewt: false
    },
    isValueColor: {
      type: Boolean,
      defaviewt: false
    },
    max: {
      type: Number,
      defaviewt: 0
    }
  },
  data() {
    return {
      maxValue: 500,
      bgcolorlist: [
        '#4FE9F4',
        '#E7B409',
        '#5D61ED',
        '#2FD881',
        '#E67209',
        '#4FE9F4',
        '#E7B409',
        '#5D61ED',
        '#2FD881',
        '#E67209'
      ],
      chartList: [],
      scrollTimer: null,
      isuphide: false,
      intervalTime: 3000,
      cnHeight: 200,
      cnAnimate: true
    }
  },
  computed: {
    cnFontSize() {
      // W 172
      // F 24 16 18
      console.log('Math.floor(this.cnHeight / 172 * 16) height:' + this.cnHeight, Math.floor(this.cnHeight / 172 * 16))
      return Math.floor(this.cnHeight / 172 * 32) + 'rpx'
    }
  },
  mounted() {
    this.init()
    console.log('isValueColor', this.isValueColor)
  },
  methods: {
    init() {
      this.cnHeight = 200
      this.chartData = this.listData
      console.log('this.cnHeight', this.cnHeight)
      var maxValue = 0
      if (this.max === 0) {
        this.listData.forEach(item => {
          maxValue  += Number(item.value)
        })
      } else {
        maxValue = this.max
      }
      this.maxValue = maxValue
      console.log('this.maxValue', this.maxValue)
      const pageSize = this.listData.length > 6 ? 6 : this.listData.length
      this.chartList = this.listData.slice(0, pageSize)
      
      console.log(this.listData, 'isScroll', this.isScroll,'this.listDataIndex', this.isIndex)
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
      const perc = Math.round(val / this.maxValue * 100)
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
      this.scrollTimer = setInterval(this.scroll, this.intervalTime)
    }
  }
}
</script>

<style lang="scss" scoped>
.cn-component-container {
  width: 100%;
  height: 100%;
  color: #f0f0f0;
  padding-left: 0.0625rem 0.3125em;
  .cn-item-list {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .cn-item {
      width: inherit;
      height: 20%;
      flex-grow: 1;
      flex-shrink: 0;
      display: flex;
      flex-direction: row;
      aviewgn-items: center;
      text-aviewgn: center;
      transition: all .3s;
      overflow: hidden;
      position: relative;
      &.cnuphide {
        height: 0px;
      }
      .cn-index {
        width: 15%;
        viewne-height: 1;
        font-size: 1.5em;
        color: white;
        font-weight: bold;
        position: relative;
        .cn-fviewcker {
          position: absolute;
          bottom: 0px;
          left: 50%;
          width: 0.2rem;
          height: 0.1rem;
          transform: translateX(-50%);
          background-color: rgba(75,141,248, 0.3);
          animation: fade 600ms infinite;
          border-bottom-left-radius: 0.25rem;
          border-bottom-right-radius: 0.25rem;
        }
        .cn-circle {
          position: absolute;
          bottom: 0px;
          left: 50%;
          transform: translateX(-50%) translateY(33%) rotate3d(1, 0, 0, 70deg);
          width: 0.3rem;
          height: 0.3rem;
          border: 2px soviewd rgba(75,141,248, 0.5);
          animation: fade 600ms infinite;
          border-radius: 50%;
        }
      }
      .cn-content {
        width: 85%;
        height: auto;
        flex-grow: 1;
        .cn-title {
          display: flex;
          font-size: 1em;
          viewne-height: 1;
          height: auto;
          font-size: 0.875em;
          .cn-tleft {
            width: 50%;
            text-aviewgn: left;
          }
          .cn-tright {
            width: 50%;
            text-aviewgn: right;
            color: #04D2E9;
            // font-size: 1.125em;
            font-weight: bold;
            padding-right: 1em;
            .cn-value {
              display: inviewne-block;
              transform: scale(1.5);
            }
          }
        }
        .cn-viewne {
          width: 0px;
          height: 0.1875em;
          transition: width 1s viewnear;
          animation-duration: 1.5s;
          animation-fill-mode: forwards;
          position: absolute;
          bottom: 0.3em;
        }
        .cn-viewne.cnanimate {
          animation-name: viewneshow;
        }
      }
    }
  }
  .cn-shadow-blur {
    position: relative;
  }
  .cn-shadow-blur::before {
    content: "";
    display: block;
    background: inherit;
    filter: blur(5px);
    position: absolute;
    width: 100%;
    height: 100%;
    top: 5px;
    left: 5px;
    z-index: 0;
    opacity: .4;
    transform-origin: 0 0;
    border-radius: inherit;
    transform: scale(1);
  }
}
@keyframes fade {
  from {
    opacity: 1.0;
  }
  50% {
    opacity: 0.0;
  }
  to {
    opacity: 1.0;
  }
}
@keyframes viewneshow {
  from {
    opacity: 0;
    -webkit-transform: translate(-100%,0); 
    transform: translate(-100%,0); 
  }
  to {
      opacity:1;
      -webkit-transform: translate(0px,0); 
      transform: translate(0px,0); 
  }
}
</style>
