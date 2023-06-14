<template>
  <view class="cn-component-container" ref="cnContainer" v-bind:style="{ fontSize: cnFontSize }">
    <view class="cn-item-list">
			<view class="cn-item cn-item-first" :style="{height: itemHeadHeight}">
			  <view class="index">
					序号
				</view>
				<view class="info">
					实时位置
				</view>
				<view class="time">
					时间 ({{listData.length}}条)
					<!-- <u-icon name="reload" label="时间" labelColor="#000000" color="#000000"></u-icon> -->
				</view>
			</view>
			<!-- v-bind:class="{ cnuphide: index == 0 && isuphide }" -->
      <view class="cn-item" :style="{height: index == 0 && isuphide ? 0 : itemHeight}" v-for="(item,index) in chartList" :key="item.id" @click="itemClick(item.id)">
        <view class="index">
					{{ item.rank }}
				</view>
				<view class="info">
					{{item.name}}
				</view>
				<view class="time">
					{{item.time}}
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
      default: ''
    },
    isScroll: {
      type: Boolean,
      default: false
    },
    isIndex: {
      type: Boolean,
      default: false
    },
    isValueColor: {
      type: Boolean,
      default: false
    },
    max: {
      type: Number,
      default: 0
    },
		pageSize: {
		  type: Number,
		  default: 5
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
      // console.log('Math.floor(this.cnHeight / 172 * 32) height:' + this.cnHeight, Math.floor(this.cnHeight / 172 * 32))
      return '26rpx'
    },
		itemHeight() {
			// 20*1 16*5 
			// 20*1 + n*16
			// 如果数量不足一页 就直接取数量进行分配高度
			var size = this.listData.length < this.pageSize ? this.listData.length : this.pageSize
		  return Math.floor(100 / (20 + 16*size) * 16 * 100) / 100 + '%'
		},
		itemHeadHeight() {
			var size = this.listData.length < this.pageSize ? this.listData.length : this.pageSize
			return Math.floor(100 / (20 + 16*size) * 20 * 100) / 100 + '%'
		}
  },
	watch: {
		listData(newVal, oldVal) {
			this.init()
		}
	},
  mounted() {
    this.init()
		var _this = this
		uni.$on('updateListscroll',function(data){
				console.log('监听到事件来自 update ，携带参数 为：' + data);
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
      const pageSize = this.listData.length > (this.pageSize+1) ? (this.pageSize+1) : this.listData.length
      this.chartList = this.listData.slice(0, pageSize)
      console.log('this.chartList', this.chartList)
      console.log(this.listData, 'isScroll', this.isScroll,'this.listDataIndex', this.isIndex)
      if (this.isScroll === true) this.startScroll()
      setTimeout(() => {
        this.cnAnimate = false
      }, 3000)
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
			if (this.chartData.length <= this.pageSize) return
      const chartData = this.chartData
      const first = chartData[0]
      const next = chartData.slice(1)
      next.push(first)
      this.isuphide = true
      setTimeout(() => {
        this.isuphide = false
        this.chartList = next.slice(0, this.pageSize + 1)
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
    },
		itemClick(id) {
			this.$emit('mapItemClick', id) 
		}
  }
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
			flex-grow: 0;
			flex-shrink: 0;
			background-color: #EBEEF5;
			border: 1px solid #DCDFE6;
			.info {
				color: black;
			}
		}
    .cn-item {
      width: inherit;
      height: 16%;
      flex-shrink: 0;
			flex-grow: 1;
      display: flex;
      flex-direction: row;
      align-items: center;
      text-align: center;
      transition: all .3s;
      overflow: hidden;
      position: relative;
			color: black;
			flex-grow: 0;
      &.cnuphide {
        height: 0px;
      }
      .index {
				width: 80rpx;
				text-align: center;
			}
			.info {
				width: 50%;
				text-align: center;
				color: #4D61B3;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
			}
			.time {
				width: calc(50% - 80rpx);
				text-align: center;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
			}
			.triangle {
				width: 0rpx;
				height: 0rpx;
				border: 20rpx solid;
				border-color: black transparent transparent transparent;
				display: inline-block;
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
	/deep/ .u-icon {
		display: inline-block;
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
.u-icon {
	display: inline-block;
}
</style>
