<template>
  <view>
    <!-- 展示界面 -->
    <view class="page-container" v-if="showPage">
      <view class="top-info">
        <!-- <text class="top-time">今天8.30发布更新</text> -->
        <view class="top-box">
          <view class="job-box">
            <view class="item-addr">
              <text class="username">{{ userInfo.userName }}</text>
              <text class="userlocation" @click="openPhone(userInfo.mobilePhone)">{{ userInfo.mobilePhone }}</text>
            </view>
            <view class="item-job">
              <text class="job-name">{{ userInfo.operation }}/{{ userInfo.jobTitle }}</text>
              <text class="change-rate">
                <!-- <text>环比</text> -->
                <text class="rate-text">{{ achievementPer }}</text></text
              >
            </view>
            <view class="bottom-box" @click="refreshMyPage()">
              <view class="btime">{{ selectTime }}</view>
              <u-icon name="reload" color="#f7df4d" size="40rpx"></u-icon>
            </view>
          </view>
          <view class="btn-group">
            <u-button
              v-if="isProvManager"
              color="linear-gradient(to right,#709AEF,#90A6E4 )"
              size="small"
              class="btn-item"
              shape="circle"
              text="省区员工"
              :customStyle="{ border: '1px solid #ffffff', marginTop: '20rpx ' }"
              @click="openProvPicker"
            ></u-button>
            <u-button
              v-if="isAdmin && !isProvManager"
              color="linear-gradient(to right,#709AEF,#90A6E4 )"
              size="small"
              class="btn-item"
              shape="circle"
              text="切换员工"
              :customStyle="{ border: '1px solid #ffffff', marginTop: '20rpx ' }"
              @click="openPicker"
            ></u-button>
            <u-button
              v-if="isAdmin"
              type="primary"
              color="linear-gradient(to right,#709AEF,#90A6E4 )"
              size="small"
              class="btn-item"
              shape="circle"
              text="搜索员工"
              @click="showPage = false"
              :customStyle="{ border: '1px solid #ffffff', marginTop: '20rpx ' }"
            ></u-button>

            <u-button
              color="linear-gradient(to right,#709AEF,#90A6E4 )"
              size="small"
              class="btn-item"
              shape="circle"
              @click="jumpTo"
              :customStyle="{ border: '1px solid #ffffff', marginTop: '20rpx ' }"
              text="选择日期"
            ></u-button>
          </view>
        </view>
      </view>
      <u-picker
        :show="showPicker"
        ref="uPicker"
        keyName="name"
        :columns="pickColumn"
        @confirm="confirmPerson"
        @cancel="showPicker = false"
        @change="changeHandler"
      ></u-picker>
      <u-picker
        :show="showProvPicker"
        :columns="provColumns"
        keyName="label"
        @confirm="confirmProvPerson"
        @cancel="showProvPicker = false"
      ></u-picker>
      <view class="tab-swapper">
        <u-tabs
          :list="tablist"
          @click="clickTab"
          :current="employeesTabIndex"
          :activeStyle="{
            color: '#3d9cff',
            fontWeight: 'bold',
            transform: 'scale(1.02)',
          }"
          itemStyle="width:33%; height: 80rpx;box-sizing: border-box;"
        ></u-tabs>
      </view>
      <view class="pageinfo-swapper">
        <view class="swiper-item" v-show="employeesTabIndex == 0">
          <Events ref="events" @pullDownRefreshComplete="pullDownRefreshComplete" :userName="userInfo.userName"></Events>
        </view>
        <view class="swiper-item" v-show="employeesTabIndex == 1">
          <Myinfo ref="myinfo" @pullDownRefreshComplete="pullDownRefreshComplete"></Myinfo>
        </view>

        <view class="swiper-item" v-show="employeesTabIndex == 2">
          <Project ref="project" @pullDownRefreshComplete="pullDownRefreshComplete"></Project>
        </view>
      </view>
      <!-- <swiper class="swiper" :indicator-dots="indicatorDots" :autoplay="autoplay"
					:duration="duration" :current="employeesTabIndex">
					<swiper-item>
						<view class="swiper-item">
							<Myinfo></Myinfo>
						</view>
					</swiper-item>
					<swiper-item>
						<view class="swiper-item">
							<Events></Events>
						</view>
					</swiper-item>
					<swiper-item>
						<view class="swiper-item">
							<Project></Project>
						</view>
					</swiper-item>
				</swiper> -->
    </view>

    <!-- 搜索员工 -->
    <view class="search-box" v-else>
      <u-search placeholder="请输入关键字" :clearabled="true" @custom="searchByName" @search="searchByName"></u-search>
      <view>
        <!-- <view> 搜索历史</view>
      <u-button type="info" text="确定"></u-button> -->
      </view>
      <u-list class="mt-10">
        <u-list-item v-for="(item, index) in dataList" :key="index">
          <u-cell @click="selectPerson(item)">
            <text slot="value" style="flex: 2"> {{ item.userName }}</text>
            <text slot="value" style="flex: 3"> {{ item.operation }}</text>
            <text slot="value" style="flex: 3"> {{ item.mobilePhone }}</text>
          </u-cell>
        </u-list-item>
      </u-list>
    </view>
    <u-back-top :scrollTop="scrollTop" :top="800"></u-back-top>
  </view>
</template>
<script>
import { getAllCity, addActionLog, getAchievement, getUserInfo, getUserByName, getProvPeople } from '@/api/market.js'
import Project from './project/project'
import Myinfo from './myinfo/myinfo'
import Events from './events/events'
import { mapState, mapMutations } from 'vuex'
export default {
  components: {
    Project,
    Myinfo,
    Events,
  },
  data() {
    return {
      showProvPicker: false,
      provColumns: [
        [
          {
            label: '雪月夜',
            // 其他属性值
            id: 2021,
            // ...
          },
          {
            label: '冷夜雨',
            id: 804,
          },
        ],
      ],
      multiIndex: [0, 0, 0],
      iconStyle: {
        fontSize: '32rpx',
        color: '#2979ff',
      },
      showPage: true,
      dataList: [], //查询人员
      showPicker: false,
      pickColumn: [],
      provinceData: [],
      personData: [],
      tablist: [
        {
          name: '考勤打卡',
        },
        {
          name: '个人情况',
        },
        {
          name: '参与项目',
        },
      ],

      duration: 500,
      autoplay: false,
      params: {},
      achievementGrow: true,
      achievementPer: 0,
      userInfo: {},
      tabCurrent: 0,
      userPhone: '',
      isAdmin: false,
      selectTime: '',
      scrollTop: 0,
      startY: 0,
      endY: 0,
      isProvManager: false,
    }
  },
  computed: {
    ...mapState(['employeesTabIndex', 'orionUserInfo']),
  },
  onPageScroll(e) {
    this.scrollTop = e.scrollTop
  },
  onPullDownRefresh() {
    console.log('我刷新了')
    this.reloadPage()
  },
  //自定义返回逻辑
  onBackPress() {
    uni.switchTab({
      url: '../home/home',
    })
    return true
  },
  onReachBottom() {
    console.log('我到底了' + this.employeesTabIndex)
    if (this.employeesTabIndex == 0) {
      this.$refs['events'].nextPage()
    }
  },
  onLoad(options) {
    //角色判断，区分管理端和员工端,员工端不可以切换查看别的员工
    const { roles } = this.orionUserInfo
    this.isAdmin = roles.includes('SaleManage')
    //判断当前查询的角色
    if (options.phone && this.isAdmin) {
      this.userPhone = options.phone
    } else {
      this.userPhone = this.orionUserInfo.phone
    }
    addActionLog({
      phone: this.orionUserInfo.phone,
      action: '应用回到个人页面',
    })

    this.getCity()
  },
  onReady() {
    //获取由条件页面传递的参数
    const pages = getCurrentPages()
    const options = pages[pages.length - 1].options

    let params = {}
    if (options.params) {
      params = JSON.parse(options.params)
      params.level = 'PEOPLE'
      params.mobilePhone = this.userPhone
    } else {
      params = {
        dateFrom: this.$monthFrom,
        dateTo: this.$monthTo,
        level: 'PEOPLE',
        mobilePhone: this.userPhone,
      }
    }
    console.log(params, 'params', this.$refs.events, this.$refs['myinfo'])
    this.params = params
    this.selectTime = `(${this.params.dateFrom} 至 ${this.params.dateTo})`
    this.changeUser(this.userPhone)
  },
  methods: {
    ...mapMutations(['setEmployeesTabIndex']),
    reloadPage() {
      switch (this.employeesTabIndex) {
        case 0:
          this.$refs['events'].initPage(this.params)
          break
        case 1:
          this.$refs['myinfo'].initPage(this.params)
          break
        case 2:
          this.$refs['project'].initPage(this.params)
          break
      }
    },
    openPicker() {
      this.showPicker = true
      this.setEmployeesTabIndex(1)
    },
    openProvPicker() {
      this.showProvPicker = true
      this.setEmployeesTabIndex(1)
    },
    pullDownRefreshComplete() {
      // uni.stopPullDownRefresh()
      uni.hideLoading()
    },
    refreshMyPage() {
      uni.showLoading({
        title: '正在刷新',
      })
      setTimeout(() => {
        uni.hideLoading()
      }, 1000)
      // 重载页面
      this.reloadPage()
    },
    //查询省区经理下的销售
    getProvPeople() {
      getProvPeople({
        phone: this.orionUserInfo.phone,
        years: new Date().getFullYear(),
      }).then((res) => {
        this.provColumns = res.map((item) => {
          return {
            label: item.name,
            phone: item.phone,
          }
        })
        this.provColumns = [this.provColumns]

        console.log(this.provColumns, 'provColumns')
      })
    },
    //获取所有运营中心及省份
    getCity() {
      getAllCity({ level: 'OPERATION', dateFrom: uni.$u.timeFormat(new Date(), 'yyyy-mm-dd') }).then((res) => {
        this.provinceData = []
        let arr = []
        res.forEach((item, index) => {
          this.provinceData.push(
            item.subProvinceVoList.map((sub) => {
              return {
                id: sub.provinceId,
                name: sub.provinceName,
              }
            })
          )
          item.subProvinceVoList.forEach((prov) => {
            let itemArr = prov.personBaseInfoVoList.map((per) => {
              return {
                parentId: item.id,
                provinceId: prov.provinceId,
                id: per.userId,
                name: per.userName,
                phone: per.phone,
              }
            })
            if (itemArr.length > 0) {
              this.personData.push(itemArr)
            }
          })
        })
        this.pickColumn = [...[res], this.provinceData[0], this.personData[0]]
        console.log(this.personData, 'this.personData')
        console.log(this.pickColumn, 'pickColumn')
        console.log(this.provinceData, 'provinceData')
      })
    },
    openPhone(phone) {
      //#ifdef MP-WEIXIN
      uni.makePhoneCall({
        phoneNumber: phone,
      })
      //#endif
      //#ifdef APP-PLUS
      plus.device.dial(phone, true)
      //#endif
    },
    changeHandler(e) {
      const {
        columnIndex,
        value,
        values, // values为当前变化列的数组内容
        index,
        // 微信小程序无法将picker实例传出来，只能通过ref操作
        picker = this.$refs.uPicker,
      } = e
      console.log(value, 'value', values)
      console.log(value[0].id, value[1].id)
      console.log(this.personData)

      // 当第一列值发生变化时，变化第二列(后一列)对应的选项
      if (columnIndex === 0) {
        // picker为选择器this实例，变化第二列对应的选项
        picker.setColumnValues(1, this.provinceData[index])
        const person = this.personData.filter(
          (item) => item[0].parentId === value[0].id && item[0].provinceId === this.provinceData[index][0].id
        )

        console.log(person, '人员')
        if (person.length > 0) {
          picker.setColumnValues(2, person[0])
        } else {
          picker.setColumnValues(2, {})
        }
      }
      // 当第一列值发生变化时，变化第二列(后一列)对应的选项
      else if (columnIndex === 1) {
        const person = this.personData.filter((item) => item[0].parentId === value[0].id && item[0].provinceId === value[1].id)
        // picker为选择器this实例，变化第二列对应的选项
        if (person.length > 0) {
          picker.setColumnValues(2, person[0])
        } else {
          picker.setColumnValues(2, {})
        }
      }
    },
    confirmProvPerson(e) {
      console.log(e, 'e')
      const { value } = e
      this.showProvPicker = false
      const { phone } = value[0]
      this.changeUser(phone)
    },
    confirmPerson(e) {
      const { value } = e
      this.showPicker = false
      //选中员工的手机号
      console.log(value[2].name, value[2].phone)
      const { phone } = value[2]
      this.changeUser(phone)
    },
    changeUser(phone) {
      getUserInfo(phone).then((res) => {
        console.log('getUserInfo', res)
        if (!res) {
          res = {
            jobTitle: '未知',
            locationInfoVo: null,
            mobilePhone: phone,
            operation: '未知',
            parentUserName: '未知',
            province: '未知',
            userId: 0,
            userName: '未知',
          }
        }
        if (phone == this.orionUserInfo.phone) {
          this.isProvManager = res.jobTitle === '省区经理' || res.jobTitle === '销售副总监' || res.jobTitle === '销售总监'
        }
        if (this.isProvManager) {
          this.getProvPeople()
        }
        this.userInfo = res
        this.params.mobilePhone = phone

        this.reloadPage()
      })

      var params = Object.assign({}, this.params, {
        mobilePhone: phone,
      })
      console.log(params)

      this.getAchieve(params)
    },
    clickTab(item) {
      const { index } = item
      //记录当前点击的tab
      this.setEmployeesTabIndex(index)
      this.reloadPage()
    },

    searchByName(val) {
      if (!val) {
        uni.showToast({
          icon: 'none',
          title: '请输入查询条件',
        })
        return
      }
      uni.showLoading({
        title: '正在查询中...',
      })
      getUserByName(val).then((res) => {
        uni.hideLoading()
        this.dataList = res
      })
    },
    selectPerson(item) {
      this.showPage = true
      this.userPhone = item.mobilePhone
      this.changeUser(this.userPhone)
    },
    jumpTo() {
      uni.navigateTo({
        url: '../conditions/conditions?path=' + this.$mp.page.route + '&phone=' + this.userPhone,
      })
    },
    getAchieve(params) {
      getAchievement(params).then((res) => {
        console.log('getAchievement Res', res)
        if (res.length > 0) {
          var data = res[0]
          var per = Math.floor(data.grow * 100)
          if (data.grow > 0) {
            this.achievementGrow = true
            this.achievementPer = '+' + per + '%'
          } else if (data.grow == 0) {
            this.achievementGrow = true
            this.achievementPer = '0%'
          } else {
            this.achievementGrow = false
            this.achievementPer = per + '%'
          }
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
/deep/.u-cell__body__content {
  flex-grow: 0;
}

.search-box {
  padding: 20px;
}

.user {
  width: 92%;
  padding: 0 4%;
  display: flex;
  align-items: center;
  // position: relative;
  background-color: #246ded;
  padding-bottom: 120rpx;

  .content {
    margin: 20rpx;
    width: 100%;

    .username {
      font-size: 36rpx;
      color: #fff;
    }

    .signature {
      color: #eee;
      font-size: 28rpx;
    }
  }
}

view,
scroll-view,
swiper,
button,
input,
textarea,
label,
navigator,
image {
  box-sizing: border-box;
}

.page-container {
  min-height: 100vh;
  background-color: #ffffff;
}

.top-info {
  margin: 10rpx auto;
  padding: 30rpx;
  box-shadow: 0px 0px 24rpx rgba(0, 0, 0, 0.1);
  background: url(../../static/img/em-bg.png);
  background-size: 100% 100%;
  color: #ffffff;

  .job-box {
    width: 480rpx;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
    justify-content: center;
    // flex-wrap: wrap;
    // justify-content: end;
    // align-items: end;
    width: 260rpx;

    // height: 160rpx;
    // .btnbox {
    //   box-sizing: border-box;
    //   border: 1px solid #ffffff;
    //   border-radius: 200rpx;
    //   margin-top: 14rpx;
    // }
    // .btnmg {
    // 	margin-top: 10rpx;
    // }
    .btn-item {
      width: 160rpx;
      border: 2rpx solid #eeeeee;
      height: 50rpx;
      line-height: 80rpx;
    }
  }
}

.top-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  height: 220rpx;
  margin-top: 10rpx;
  width: 710rpx;
}

.top-box .job-box .item-addr {
  font-size: 45rpx;

  .userlocation {
    font-size: 30rpx;
    padding-left: 20rpx;
    text-decoration: underline;
  }

  line-height: 90rpx;
}

.top-box .job-box .item-job {
  font-size: 30rpx;
  line-height: 60rpx;
  display: flex;
  align-items: center;
}

.top-box .job-box .job-name {
  text-align: left;
  width: 360rpx;
  display: inline-block;
}

.top-box .job-box .change-rate {
  text-align: right;
  width: 210rpx;
  display: inline-block;
  font-size: 30rpx;

  .rate-text {
    font-size: 32rpx;
    padding-left: 12rpx;
    color: #f7df4d;
  }
}

.top-box .arrow-box {
  width: 15%;
  margin-left: 10rpx;
  height: 120rpx;
  font-size: 36rpx;
  text-align: center;
}

.arrowimg {
  width: 100rpx;
  height: 100rpx;
}

.top-box .user-box {
  width: 25%;
  margin-left: 10rpx;
  height: 160rpx;
  line-height: 160rpx;
}

.top-box .user-box .username {
  width: 110rpx;
  display: inline-block;
}

.top-box .user-box .avator {
  width: 150rpx;
  height: 150rpx;
  vertical-align: middle;
}

.top-time {
  font-size: 24rpx;
}

.pageinfo-swapper {
  width: 100%;
  height: 1000rpx;
  padding: 10rpx 20rpx;

  .swiper {
    width: 100%;
    height: 100%;
  }
}

.tab-swapper {
  width: 100%;
}

.bottom-box {
  width: 100%;
  margin-top: 10rpx;
  line-height: 1.5;
  font-size: 26rpx;
  display: flex;
  flex-direction: row;

  .btime {
    width: calc(100% - 90rpx);
  }
}
</style>
