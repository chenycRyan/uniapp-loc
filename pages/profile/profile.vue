<template>
  <view class="page-container">
    <!-- <view class="nav-bar"></view> -->
    <view class="header">
      <view class="bg-header">
        <view class="userInfo">
          <view class="line">
            <view class="user">
              <view> {{ userInfo.userName }} </view>
              <view class="job" v-if="userInfo.jobTitle"> /{{ userInfo.jobTitle }}</view>
            </view>
            <view class="state" v-if="currentState == '在线'">
              <view class="dot ondot"></view>
              <text class="online">{{ currentState }}</text>
            </view>
            <view class="state" v-if="currentState == '离线'">
              <view class="dot offdot"></view>
              <text class="offline">{{ currentState }}</text>
            </view>
            <view class="state" v-if="currentState == '非工作时间'">
              <view class="dot notwork"></view>
              <text class="notline" @click="jumpTo('../description/description?page=workdesc')">{{ currentState }}</text>
            </view>
          </view>
          <view class="icon end" v-if="isSale" @click="jumpTo('../newsList/newsList')">
            <!-- <u-badge :isDot="true" absolute :offset="[0, 0]"></u-badge> -->
            <image src="../../static/profile-img/notice.png"></image
          ></view>

          <u-divider></u-divider>

          <view class="group">
            <view class="item">
              <view class="icon"><image src="../../static/profile-img/city.png"></image></view>
              <view class="text">{{ userInfo.operation }}</view>
            </view>
            <view class="item">
              <view class="icon"><image src="../../static/profile-img/phone.png"></image></view>
              <view class="text">{{ userInfo.mobilePhone }}</view>
            </view>
          </view>
          <view v-if="lastTime" style="margin-top: 26rpx">最后推送时间：{{ lastTime }}</view>
        </view>
      </view>
    </view>

    <view class="list">
      <view class="li" @click="jumpTo('../description/description?page=aboutus')">
        <view class="icon"><image src="../../static/profile-img/about.png"></image></view>
        <view class="text">关于我们</view>
        <image class="to" src="../../static/profile-img/to.png"></image>
      </view>

      <view class="li" @click="jumpTo('../logonLogs/logonLogs')">
        <view class="icon"><image src="../../static/profile-img/log.png"></image></view>
        <view class="text">登录日志</view>
        <image class="to" src="../../static/profile-img/to.png"></image>
      </view>
      <view class="li" @click="jumpTo('../acitonLogs/acitonLogs')" v-if="!isSale">
        <view class="icon"><image src="../../static/profile-img/aciton.png"></image></view>
        <view class="text">操作记录</view>
        <image class="to" src="../../static/profile-img/to.png"></image>
      </view>

      <view class="li" @click="showPop = true">
        <view class="icon"><image src="../../static/profile-img/proposal.png"></image></view>
        <view class="text">意见反馈</view>
        <image class="to" src="../../static/profile-img/to.png"></image>
      </view>

      <view class="li" @click="jumpTo('../changePassword/changePassword')">
        <view class="icon"><image src="../../static/profile-img/password.png"></image></view>
        <view class="text">修改密码</view>
        <image class="to" src="../../static/profile-img/to.png"></image>
      </view>

      <view class="li" @click="showModal = true">
        <view class="icon"><image src="../../static/profile-img/set.png"></image></view>
        <view class="text">退出登录</view>
        <image class="to" src="../../static/profile-img/to.png"></image>
      </view>
      <view class="li version">
        <view>版本号</view>
        <view class="num" @click="jumpTo('../description/description?page=verdesc')">
          {{ version }}
        </view>
      </view>
    </view>

    <u-popup :show="showPop" @close="showPop = false" :round="10" closeable>
      <view class="pop">
        <view> 请对软件使用做出评价</view>
        <u-radio-group v-model="paramType" placement="row" style="margin: 20px 0">
          <u-radio
            :customStyle="{ marginRight: '8px' }"
            v-for="(item, index) in radioList"
            :key="index"
            :label="item.value"
            :name="item.type"
          >
          </u-radio>
        </u-radio-group>
        <u--textarea v-model="content" placeholder="请输入内容" class="area" height="100"></u--textarea>
        <u-button type="primary" size="large" text="提交" @click="submitAdvice" class="mt-10" shape="circle"></u-button>
      </view>
    </u-popup>
    <u-toast ref="uToast"></u-toast>
    <u-modal
      :show="showModal"
      showCancelButton
      confirmColor="#f391a9"
      @cancel="showModal = false"
      @confirm="confirm"
      content="确认退出登录吗？"
    ></u-modal>
    <u-modal :show="showNotice" title="错误提示" content="当前手机号未查询到用户信息" @confirm="showNotice = false"></u-modal>
    <keep-position ref="keepPosition"></keep-position>
  </view>
</template>
<script>
import { getUserInfo, getCurrentOnline, submitAdvice, getParamConfig } from '@/api/market.js'
import { mapState, mapMutations } from 'vuex'
import KeepPosition from '@/components/KeepPosition'
export default {
  components: { KeepPosition },
  data() {
    return {
      dateBegin: '05:00:00', //考勤计入开始时间
      dateEnd: '23:00:00', //考勤计入结束时间
      lastTime: '',
      currentState: '',
      showNotice: false,
      //意见
      radioList: [],
      paramType: '',
      content: '',
      showPop: false,
      //用户
      // userInfo: {},
      showModal: false,
      userPhone: '',
      isSale: false,
      version: this.$appVersion,
    }
  },
  computed: {
    ...mapState({
      userInfo: (state) => state.crmUserInfo,
      orionUserInfo: (state) => state.orionUserInfo,
    }),
  },
  onLoad() {
    this.judgeRole()
  },
  //解决tabbar切换不调用onload函数
  onShow() {
    if (!this.orionUserInfo) {
      uni.navigateTo({
        url: '../login/login',
      })
      return
    }
    this.judgeRole()
    this.getInfo()
    this.getParamConfig()
  },

  methods: {
    ...mapMutations(['setCrmUserInfo']),
    judgeRole() {
      //角色判断，管理端不查看问题通知
      if (this.orionUserInfo) {
        const { roles } = this.orionUserInfo
        this.isSale = !roles.includes('SaleManage')
        this.userPhone = this.orionUserInfo.phone
      }
    },
    //计算是否在考勤范围之外
    nowInDateBetwen() {
      var date = new Date() //获取当前时间
      var h = date.getHours()
      var m = date.getMinutes()
      var s = date.getSeconds()
      var currSec = h * 3600 + m * 60 + s
      var from = this.dateBegin.split(':')
      var to = this.dateEnd.split(':')
      var dateBegin = Number(from[0]) * 3600 + Number(from[1]) * 60 + Number(from[2])
      var dateEnd = Number(to[0]) * 3600 + Number(to[1]) * 60 + Number(to[2])
      return currSec > dateEnd || currSec < dateBegin
    },
    //获取意见类型
    getParamConfig() {
      getParamConfig({ name: 'FEEDBACK' }).then((res) => {
        this.radioList = res
      })
    },
    getInfo() {
      getUserInfo(this.userPhone).then((res) => {
        if (res) {
          this.setCrmUserInfo(res)
        } else {
          this.showNotice = true
        }
      })
      getCurrentOnline({ mobilePhone: this.userPhone }).then((res) => {
        const online = res.filter((item) => item.phone == this.userPhone)
        if (online.length > 0) {
          getParamConfig().then((resData) => {
            this.dateBegin = resData.filter((item) => item.name === 'T_QUERYCHECKFROM')[0].value
            this.dateEnd = resData.filter((item) => item.name === 'T_QUERYCHECKTO')[0].value
            if (this.nowInDateBetwen()) {
              this.currentState = '非工作时间'
            } else {
              this.lastTime = online[0].lastTime
              this.currentState = online[0].status
            }
          })
        }
      })
    },

    submitAdvice() {
      submitAdvice({
        paramType: this.paramType,
        content: this.content,
        phone: this.userPhone,
      }).then((res) => {
        this.showPop = false
        this.$refs.uToast.show({
          type: 'success',
          title: '成功主题(带图标)',
          message: '提交成功',
          iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
        })
      })
    },

    jumpTo(url) {
      uni.navigateTo({
        url: url,
      })
    },

    confirm() {
      this.showModal = false
      //移出用户信息
      uni.removeStorageSync('USER_TOKEN')
      uni.removeStorageSync('ORION_USER_INFO')
      uni.removeStorageSync('CRM_USER_INFO')
      uni.removeStorageSync('lastUptime')
      if (this.$refs.keepPosition) this.$refs.keepPosition.stopLocation()
      this.$refs.uToast.show({
        type: 'loading',
        title: '正在加载',
        duration: '1000',
        message: '正在加载',
        iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/loading.png',
        complete() {
          uni.navigateTo({
            url: '../login/login',
          })
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/ .u-modal__content__text {
  text-align: center;
}
/deep/.u-divider {
  margin: 12px 0;
}

.page-container {
  background: #f1f1f1;
  height: 100%;
  .nav-bar {
    height: 70rpx;
    width: 100%;
    background-image: linear-gradient(225deg, #256dee 0%, #c0e3f7 100%);
  }
  .header {
    background: #fff;
    // height: 200rpx;
    padding-bottom: 180rpx;
    .bg-header {
      width: 100%;
      height: 200rpx;
      padding-top: 100rpx;
      background-color: #4191ea;
      line-height: 28px;
      .userInfo {
        position: relative;
        width: 620rpx;
        // height: 220rpx;
        background: url(../../static/profile-img/personalBg.png);
        background-size: 100% 100%;
        border-radius: 20rpx;
        padding: 40rpx;
        margin: 0 auto;
        background-color: #fff;
        box-shadow: 0 5upx 20upx 0upx rgba(0, 0, 150, 0.2);
        .line {
          display: flex;
          justify-content: space-between;
        }
        .user {
          font-size: 40rpx;
          display: flex;
          align-items: center;
          letter-spacing: 5rpx;
          margin: 20rpx 0;
          .job {
            font-size: 32rpx;
          }
        }
        .state {
          display: flex;
          align-items: center;
          width: 200rpx;
          .dot {
            width: 16rpx;
            height: 16rpx;
            border-radius: 50%;
            margin: 0 10rpx;
          }
          .ondot {
            background: #19be6b;
          }
          .offdot {
            background: #fa3534;
          }
          .notwork {
            background: #82848a;
          }
          .online {
            color: #19be6b;
          }
          .offline {
            color: #fa3534;
          }
          .notline {
            color: #82848a;
            text-decoration: underline;
          }
        }
        .group {
          display: flex;
          justify-content: space-around;
          flex-wrap: nowrap;
          margin: 20rpx 0;

          .item {
            flex: 1;
            display: flex;
            align-items: center;
          }
        }
        .end {
          position: absolute;
          right: 20rpx;
          top: 20rpx;
          cursor: pointer;
        }
        .icon {
          width: 50rpx;
          height: 50rpx;
          image {
            width: 50rpx;
            height: 50rpx;
          }
        }
      }
    }
  }

  .list {
    width: 100%;
    border-bottom: 15upx solid #f1f1f1;
    background: #fff;
    margin-top: -10rpx;
    &:last-child {
      border: none;
    }
    .li {
      width: 92%;
      height: 100upx;
      padding: 0 4%;
      border-bottom: 1px solid rgb(243, 243, 243);
      display: flex;
      align-items: center;
      &.noborder {
        border-bottom: 0;
      }
      .icon {
        flex-shrink: 0;
        width: 50rpx;
        height: 50rpx;
        image {
          width: 50rpx;
          height: 50rpx;
        }
      }
      .text {
        padding-left: 20upx;
        width: 100%;
        color: #666;
      }
      .to {
        flex-shrink: 0;
        width: 40upx;
        height: 40upx;
      }
    }
    .version {
      justify-content: flex-end;
      width: 90%;
      display: flex;
      .num {
        color: #4191ea;
        margin-left: 10rpx;
        text-decoration: underline;
      }
    }
  }
  .pop {
    padding: 50rpx;
    .area {
      margin-top: 20rpx;
    }
  }
}
</style>
