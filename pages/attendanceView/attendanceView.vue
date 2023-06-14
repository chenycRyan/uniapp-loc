<template>
  <view class="page-container">
    <!-- 搜索员工 -->
    <view class="search-box" v-if="isManage">
      <u-search placeholder="请输入关键字" :clearabled="true" @custom="searchByName" v-model="selectName" @search="searchByName"></u-search>
      <u-list class="mt-10" v-show="showPersonList">
        <u-list-item v-for="(item, index) in personList" :key="index">
          <u-cell @click="selectPerson(item)">
            <text slot="value" style="flex: 2"> {{ item.userName }}</text>
            <text slot="value" style="flex: 3"> {{ item.operation }}</text>
            <text slot="value" style="flex: 3"> {{ item.mobilePhone }}</text>
          </u-cell>
        </u-list-item>
      </u-list>
    </view>
    <view v-show="!showPersonList">
      <imt-calendar :selected="defaultDay" :successList="successList" @changeMonth="changeMonth" @changeDate="changeDate"></imt-calendar>

      <view class="card-box" v-if="attendance.dutyWorkStatus">
        <view class="title"> 上班打卡</view>
        <u-divider></u-divider>
        <view> 状态：{{ attendance.dutyWorkStatus }} </view>
        <view> 时间：{{ attendance.dutyWorkTime }}</view>
        <view> 地点：{{ attendance.dutyWorkPlace }} </view>
      </view>

      <view class="card-box" v-if="attendance.getOffWorkStatus">
        <view class="title"> 下班打卡</view>
        <u-divider></u-divider>
        <view> 状态：{{ attendance.getOffWorkStatus }} </view>
        <view> 时间：{{ attendance.getOffWorkTime }}</view>
        <view> 地点：{{ attendance.getOffWorkPlace }} </view>
      </view>
    </view>
    <u-button size="default" type="primary" class="mt-10" @click="toEmployees">去打卡</u-button>
  </view>
</template>

<script>
import { getPersonAttendance, getUserByName } from '@/api/market'
import imtCalendar from 'components/imt-calendar/imt-calendar'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      personList: [],
      isManage: false,
      selectName: '',
      params: {
        dateFrom: this.$monthFrom,
        dateTo: this.$personTo,
        mobilePhone: '',
        level: 'PEOPLE',
      },
      showPersonList: false,
      attendance: {},
      attendanceSet: {},
      //第一个是起始时间，第二个是默认时间
      defaultDay: [this.$personFrom],
      successList: [],
    }
  },
  components: {
    imtCalendar,
  },
  computed: {
    ...mapState(['orionUserInfo']),
  },
  onLoad() {
    this.selectName = this.orionUserInfo.realName
    //角色判断
    if (this.orionUserInfo) {
      const { roles } = this.orionUserInfo
      this.isManage = roles.includes('SaleManage')
      this.params.mobilePhone = this.orionUserInfo.phone
    }
    this.getAttendance()
  },
  methods: {
    toEmployees() {
      uni.navigateTo({
        url: '../employees/employees',
      })
    },
    getAttendance() {
      getPersonAttendance(this.params).then((res) => {
        if (res.length > 0) {
          const successList = res.filter((item) => item.dutyWorkStatus === '正常' && item.getOffWorkStatus === '正常下班')
          this.successList = successList.map((item) => item.checkDate)
          this.attendanceSet = {}
          res.forEach((item) => {
            this.attendanceSet[item.checkDate] = item
          })
          this.changeDate(this.$personFrom)
          console.log(this.$personFrom)
          console.log(this.attendanceSet)
        } else {
          this.attendance = {}
        }
      })
    },
    changeMonth(val) {
      this.params.dateFrom = val + '-01'
      this.params.dateTo = val + '-31'
      this.getAttendance()
    },
    changeDate(val) {
      console.log(val)
      console.log(uni.$u.timeFormat(new Date(val).getTime(), 'yyyy-mm-dd'))
      this.attendance = this.attendanceSet[uni.$u.timeFormat(new Date(val).getTime(), 'yyyy-mm-dd')] || {}
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
        this.personList = res
        this.showPersonList = true
      })
    },
    selectPerson(item) {
      this.showPersonList = false
      this.selectName = item.userName
      this.params.mobilePhone = item.mobilePhone

      this.getAttendance()
    },
  },
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 30rpx;
  .card-box {
    box-shadow: 0 2px 12px 0 #eeeeee;
    border-radius: 10px;
    border: 1px solid #ebeef5;
    background-color: #fff;
    overflow: hidden;
    color: #303133;
    transition: 0.3s;
    padding: 20rpx 40rpx 10rpx;
    margin-bottom: 20rpx;
    line-height: 60rpx;

    .title {
      font-size: 40rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }
    /deep/ .u-divider {
      margin: 5rpx 0 !important;
    }
  }
}
</style>
