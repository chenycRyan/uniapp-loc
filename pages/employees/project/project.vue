<template>
  <view class="component-container">
    <view class="panel-project">
      <view class="title">
        <view class="title-bar"></view>
        <!-- <view class="title-line">参与项目完成率</view> -->
        <qiun-title-bar title="参与项目完成率" />
      </view>
      <view class="content" :style="{ height: projects.length < 4 ? projects.length * 100 + 60 + 'rpx' : '380rpx' }">
        <view class="project-top" v-if="projectSwiperList.length > 0">
          <view class="step-wrapper">
            <view class="step" v-for="item in projectSteps" :key="item.name">
              <text
                class="color-block"
                v-bind:style="{ backgroundImage: 'linear-gradient(to right, ' + item.colors[0] + ', ' + item.colors[1] + ')' }"
              ></text>
              {{ item.name }}
            </view>
          </view>
        </view>
        <view class="project-bottom">
          <swiper
            class="swiper mt-10"
            :indicator-dots="indicatorDots"
            :autoplay="autoplay"
            :interval="interval"
            :duration="duration"
            @change="swiperChange"
            v-if="projectSwiperList.length > 0"
          >
            <swiper-item class="project-item-wrapper" v-for="(projectSwiper, index) in projectSwiperList" :key="index">
              <view
                class="project-item"
                v-for="item in projectSwiper"
                :key="item.code"
                :style="{ height: (projects.length < 4 && projects.length * 20) + 'rpx' }"
              >
                <view class="item-title"> {{ item.code }}</view>
                <view class="item-content">
                  <view
                    class="item-step"
                    v-for="citem in item.steps"
                    v-bind:key="citem.name"
                    :title="citem.name"
                    v-bind:style="{ backgroundImage: 'linear-gradient(to right, ' + citem.colors[0] + ', ' + citem.colors[1] + ')' }"
                  ></view>
                </view>
              </view>
            </swiper-item>
          </swiper>
          <view class="swiper-page" v-if="projectSwiperList.length > 0">{{ swiperPage }}/{{ swiperTotal }}</view>
          <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
        </view>
        <!-- <view class="project-bottom">
         <view class="project-item" v-for="item in projects" :key="item.code">
            <view class="item-title">汇博单号 {{ item.code }}</view>
            <view class="item-content">
              <view
                class="item-step"
                v-for="citem in item.steps"
                v-bind:key="citem.name"
                :title="citem.name"
                v-bind:style="{ backgroundImage: 'linear-gradient(to right, ' + citem.colors[0] + ', ' + citem.colors[1] + ')' }"
              ></view>
            </view>
          </view>
        </view> -->
        <!-- <view ref="projectFinishChart" class="project-finish-chart"></view> -->
      </view>
    </view>
    <!-- :style="{ height: chartHeight + 'rpx' }" -->

    <view class="pannel-chart">
      <qiun-title-bar title="销售产品数量占比" />
      <view v-if="currentProduct.name" class="range">{{ currentProduct.name }}:{{ currentProduct.sumTotal }}(万元)</view>
      <view class="chartbox" :style="{ height: chartHeight + 'rpx' }">
        <qiun-data-charts type="ring" :chartData="chartData" :opts="optsRing" v-if="chartHeight > 400" @getIndex="ontap" />
        <u-empty v-else mode="data" icon="http://cdn.uviewui.com/uview/empty/data.png"> </u-empty>
      </view>
    </view>
  </view>
</template>

<script>
import { getPersonProjects, getProjectStatus, getProjectComposition } from '@/api/market'

export default {
  computed: {
    projectSwiperList() {
      // var projectSwiperList = []
      // var list = []
      // var page = 4
      // var listIndex = 0
      // if (list.length < page) {
      //   projectSwiperList[listIndex] = this.projects
      // }
      // this.projects.forEach((item, index) => {
      //   list.push(item)
      //   if (list.length == page) {
      //     projectSwiperList[listIndex] = list
      //     listIndex++
      //     list = []
      //   }
      // })
      let projectSwiperList = []
      for (let index = 0; index < this.projects.length; index += 4) {
        projectSwiperList.push(this.projects.slice(index, index + 4))
      }

      console.log(this.projects, 'this.projects')
      console.log(projectSwiperList, 'projectSwiperList')

      return projectSwiperList
    },
  },
  data() {
    return {
      currentProduct: {},
      chartHeight: 520,
      indicatorDots: false,
      autoplay: false,
      interval: 2000,
      duration: 500,
      projectSteps: [
        {
          name: '中标',
          color: '#0BABFD',
          colors: ['#266EEF', '#5D9FF5'],
        },
        {
          name: '生产',
          color: '#E7EA0C',
          colors: ['#EE6225', '#FCC090'],
        },
        {
          name: '交付',
          color: '#80FFFF',
          colors: ['#23D7FF', '#88ECFF'],
        },
        {
          name: '验收',
          color: '#F59A23',
          colors: ['#1E1EFF', '#C8CAFF'],
        },
        {
          name: '回款',
          color: '#95F204',
          colors: ['#3DBC6B', '#A4E1B9'],
        },
      ],
      // code: '190700472',
      // status: '2',
      // steps
      projects: [],
      chartData: {},

      optsRing: {
        legend: { position: 'bottom' },
        extra: {
          ring: { ringWidth: 20, linearType: 'custom' },
        },
      },
      swiperPage: 1,
      swiperTotal: 1,
    }
  },
  methods: {
    ontap(index) {
      console.log(index)
      const { currentIndex } = index
      this.currentProduct = this.chartData.series[0].data[currentIndex]
    },
    initPage(params) {
      this.initProject(params)
      this.initComposition(params)
    },
    initProject(params) {
      uni.showLoading({
        title: '正在查询中...',
      })

      getPersonProjects(params)
        .then((res) => {
          if (res.length > 0) {
            var projects = []
            res.forEach((item, index) => {
              var state = item.states
              var steps = this.getSteps(state)
              var code = item.orderName || '未知'
              var status = steps.length
              var pitem = {
                code,
                status,
                steps,
              }
              projects.push(pitem)
            })
            this.projects = projects
            console.log(this.projects)
            console.log('project', this.projects)

            this.swiperTotal = Math.ceil(this.projects.length / 4)
          }
          uni.hideLoading()
          this.$emit('pullDownRefreshComplete')
        })
        .catch((e) => {
          uni.hideLoading()
          this.$emit('pullDownRefreshComplete')
        })
    },
    getSteps(state) {
      var steps = []
      var stepsEnd = false
      this.projectSteps.forEach((item) => {
        if (stepsEnd === false) steps.push(item)
        if (item.name == state) stepsEnd = true
      })
      return steps
    },

    initComposition(params) {
      getProjectComposition(params).then((res) => {
        // console.log('getProjectComposition', res)
        var chartList = []
        if (res.length > 0) {
          res.forEach((item) => {
            var chartItem = {
              name: item.name,
              value: Number(item.num),
              sumTotal: (Number(item.sumTotal) / 10000).toFixed(2),
            }
            chartList.push(chartItem)
          })
        }
        // 只显示前六条
        var chartData = chartList.slice(0, 6)
        //按总和排序
        chartData = chartData.sort((a, b) => {
          return b.value - a.value
        })
        this.chartHeight = 300 + 50 * chartData.length
        console.log('chartData1', chartData)

        this.chartData = {
          series: [
            {
              data: chartData,
            },
          ],
        }
      })
    },
    swiperChange(event) {
      var current = event.detail.current
      this.swiperPage = current + 1
      console.log(current)
    },
  },
}
</script>

<style lang="scss" scoped>
$textColorP: #ec808d;
$textColorR: #e7ab10;
$textColorB: #2899f1;
$textColorG: #40b480;
$topTitleColor: #333333;
$textColorW: #f0f0f0;

.component-container {
  width: 100%;
}
.pageinfo-swapper {
  width: 100%;
  height: 1000rpx;
  .swiper {
    width: 100%;
    height: 100%;
  }
}
.panel-project {
  min-height: 450rpx;
  @mixin colorblock {
    width: 32rpx;
    height: 32rpx;
    display: inline-block;
    vertical-align: middle;
  }
  .title-line {
    line-height: 50rpx;
    color: black;
  }
  .content {
    padding-top: 10rpx;
    height: 380rpx;

    box-sizing: border-box;
    .project-top {
      width: 100%;
      height: 15%;
      .step-wrapper {
        display: flex;
        flex-direction: row;
        .step {
          width: 20%;
          font-size: 32rpx;
          line-height: 40rpx;
          text-align: center;
          color: black;

          .color-block {
            @include colorblock;
            margin-right: 6rpx;
          }
        }
      }
    }

    .project-bottom {
      width: 100%;
      height: 85%;
      padding-bottom: 30rpx;
      position: relative;
      // display: flex;
      // flex-direction: column;
      // justify-content: space-between;
      // align-items: center;
      .swiper-page {
        font-size: 24rpx;
        position: absolute;
        bottom: -10rpx;
        right: 0rpx;
        line-height: 30rpx;
      }
      .swiper {
        width: 100%;
        height: 100%;
      }
      .project-item-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .project-item {
        width: 85%;
        padding: 0 24rpx;
        height: 18%;
        margin: 1% 0;
        border-radius: 32rpx;
        display: flex;
        align-items: center;
        background-color: #ebeef5;
        .item-title {
          width: 40%;
          line-height: 1.2;
          color: $topTitleColor;
          font-size: 24rpx;
        }

        .item-content {
          width: 60%;
          height: 80%;
          display: flex;

          .item-step {
            width: 18%;
            height: 100%;
            background-color: $textColorB;
            transition: all 0.3s linear;
          }
        }
      }
    }
  }
}

.pannel-chart {
  width: 100%;
  height: 520rpx;
  margin-top: 80rpx;
  .chartbox {
    width: 100%;
    height: 520rpx;
  }
}
</style>
