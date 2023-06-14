<template>
  <view class="cn-component-container">
    <ul class="cn-item-list" @mouseover="stopScroll" @mouseout="startScroll">
      <li class="cn-item" v-bind:class="{ cnuphide: index == 0 && isuphide }" v-for="(item, index) in chartList" :key="index">
        <view class="cn-content">
          <view class="cn-title">
            <view class="cn-tleft" style="display: flex">
              <text>{{ item.name }}</text>
              <text v-if="item.total">({{ item.total }}/{{ item.allSchool }})</text>
              <u-icon v-if="item.addSchool" @click="viewDetail(index)" name="arrow-upward" color="#18b566" size="16"></u-icon>
              <text v-if="item.addSchool" style="color: #18b566">({{ item.addSchool }})</text>
            </view>

            <view class="cn-tright">
              <text>{{ item.value }}</text>
            </view>
          </view>
          <view class="cn-line-box">
            <view
              class="cn-line cn-shadow-blur"
              v-bind:style="{
                width: getWidth(item.value),
                backgroundColor: bgcolorList[index],
                backgroundImage: 'linear-gradient(to right, ' + colorStart[index] + ', ' + colorStop[index] + ')',
              }"
            ></view>
          </view>
        </view>
      </li>
    </ul>
    <u-modal :show="showMessage" title="客户新增详情" :content="message" @confirm="showMessage = false">
      <view class="slot-content">
        <u-list v-if="tableData.length > 0" class="ulist">
          <u-list-item v-for="(item, index) in tableData" :key="index">
            <u-cell class="group" style="margin-top: 0">
              <text slot="value" class="item0" style="font-size: 26rpx"> {{ item.schoolName }}</text>
              <text slot="value" class="item1" style="font-size: 26rpx">
                {{ item.userName }}
              </text>
            </u-cell>
          </u-list-item>
        </u-list>
        <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
      </view>
    </u-modal>
  </view>
</template>

<script>
export default {
  props: {
    chartData: {
      type: Array,
      default: function () {
        return [
          {
            name: '本科',
            value: '400',
          },
          {
            name: '高职',
            value: '200',
          },
          {
            name: '中职',
            value: '190',
          },
          {
            name: '技师',
            value: '150',
          },
        ]
      },
    },
    addSchoolList: {
      type: Array,
      default: function () {
        return []
      },
    },
    maxValue: {
      type: Number,
      default: () => 500,
    },
  },
  data() {
    return {
      tableData: [],
      showMessage: false,
      message: '',
      unit: '万',
      colorStart: ['#B1EEFE', '#FED3A5', '#B0FEFF', '#cee8d7'],
      colorStop: ['#216CEF', '#EA7040', '#0ecef9', '#3DBC6B'],
      bgcolorList: ['#4FE9F4', '#E7B409', '#5D61ED', '#2FD881', '#E67209', '#4FE9F4', '#E7B409', '#5D61ED', '#2FD881', '#E67209'],
      chartList: [],
      scrollTimer: null,
      isuphide: false,
      intervalTime: 3000,
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
    viewDetail(index) {
      console.log(index)
      console.log(this.addSchoolList)
      this.tableData = this.addSchoolList[index]
      this.showMessage = true
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
      const perc = Math.round((val / this.maxValue) * 100) || 0

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
/deep/.slot-content {
  width: 90%;
}
/deep/.u-modal__content {
  padding: 10px;
}
.cn-component-container {
  width: 100%;
  height: 100%;
  .cn-item-list {
    width: 100%;
    height: 100%;
    padding: 0 10px;
    box-sizing: border-box;
    overflow: hidden;
    .cn-item {
      &:first-child {
        margin: 10px 0px;
      }
      margin: 20px 0px;
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
          font-size: 28rpx;
          display: flex;
          line-height: 46rpx;
          display: flex;
          justify-content: space-between;
          .cn-tleft {
            font-size: 24rpx;
            text-align: left;
          }
          .sum {
            font-size: 24rpx;
            text-align: center;
          }

          .cn-tright {
            font-size: 24rpx;
            text-align: right;
          }
        }
        .cn-line-box {
          background-color: #efefef;
          border-radius: 10rpx;
          .cn-line {
            width: 0px;
            height: 8rpx;
            transition: width 1s linear;
            border-radius: 10rpx;
          }
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
.ulist {
  height: 200px !important;
  display: flex;
  /deep/.u-cell__body__content {
    flex-grow: 0;
  }
  /deep/.u-cell__body {
    font-size: 28rpx;
  }
  .item0 {
    flex: 2;
  }
  .item1 {
    flex: 1;
  }
  uni-view {
    padding-top: 0 !important;
  }
}
</style>
