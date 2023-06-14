<template>
  <view class="login-container">
    <!-- <view class="place"></view> -->

    <view class="page-card">
      <view class="image-logo">
        <u--image src="../../static/img/logo.png" width="140rpx" height="140rpx"></u--image>
      </view>
      <view class="title">掌控乾坤</view>

      <view class="content">
        <u--form :model="form" ref="uForm" :rules="rules" v-show="loginType === 'account'">
          <u-form-item prop="phone" class="item">
            <u--input
              prefixIcon="phone"
              prefixIconStyle="font-size: 22px;color: #909399"
              placeholder="请输入手机号"
              v-model="form.phone"
              type="number"
              maxlength="11"
              border="bottom"
              clearable
              @clear="clearNumber"
            ></u--input>
          </u-form-item>
          <u-form-item prop="password" class="item">
            <u--input
              prefixIcon="lock"
              prefixIconStyle="font-size: 22px;color: #909399"
              placeholder="请输入密码"
              v-model="form.password"
              type="password"
              border="bottom"
              clearable
            >
            </u--input>
          </u-form-item>
        </u--form>
        <u--form :model="form" ref="uForm" class="m-form" :rules="rules" v-show="loginType === 'phone'">
          <u-form-item borderBottom labelWidth="60">
            <u--input placeholder="请输入手机号" @blur="checkBlurPhone" v-model="form.phone" border="none"></u--input>
            <u-code :seconds="seconds" @end="end" ref="uCode" @change="codeChange"></u-code>
            <u-button type="primary" @tap="getCode" style="width: 220rpx" size="small">{{ tips }}</u-button>
          </u-form-item>
          <u-form-item borderBottom labelWidth="100">
            <u-code-input v-model="form.vCode" mode="line" :maxlength="4"></u-code-input>
          </u-form-item>
        </u--form>
        <u-button type="primary" class="btn" text="登录" shape="circle" @click="handleLogin"></u-button>
        <view class="text-t">
          <view class="account" v-if="loginType === 'phone'" @click="changeLoginType('account')"> 密码登录</view>
          <view class="account" v-else @click="changeLoginType('phone')"> 手机登录</view>
          <view class="forget" @click="jumpTo"> 忘记密码</view>
        </view>
      </view>
    </view>
    <u-checkbox-group @change="changeAgree">
      <view class="agreement">
        <u-checkbox name="同意" shape="circle"></u-checkbox>
        <view>
          我已阅读并同意
          <text class="href" @click="jumptoAgree">《用户协议及隐私政策》</text>
        </view>
      </view>
    </u-checkbox-group>
  </view>
</template>

<script>
import { login, sendMsg, loginByCode, checkPhone } from '@/api/market.js'
import { getAuth } from '@/api/orion.js'
import { mapState, mapMutations } from 'vuex'
export default {
  data() {
    return {
      loginType: 'account',
      form: {
        phone: '',
        password: '',
        tenantName: '',
        vCode: '',
      },
      isAgree: false,

      rules: {
        phone: {
          type: 'string',
          required: false,
        },
        password: {
          type: 'string',
          required: false,
        },
      },
      tips: '',
      seconds: 60,
    }
  },
  onLoad() {
    this.form.phone = this.userPhone
    if (this.password) {
      this.form.password = atob(this.password)
    }
  },
  computed: {
    ...mapState(['userPhone', 'password']),
  },
  methods: {
    ...mapMutations(['setUserPhone', 'setPassword', 'setOrionUserInfo']),
    changeLoginType(val) {
      this.form.phone = this.userPhone
      this.loginType = val
    },
    changeAgree(val) {
      this.isAgree = val.includes('同意')
    },
    jumptoAgree() {
      uni.navigateTo({
        url: '../description/description?page=agreement',
      })
    },
    jumpTo() {
      uni.navigateTo({
        url: '../changePassword/changePassword?type=forget',
      })
    },
    checkBlurPhone() {
      checkPhone({ phone: this.form.phone }).then((res) => {
        if (!res) {
          uni.showToast({
            title: '该手机号未在系统中注册，请确认',
            duration: 2000,
            icon: 'none',
          })
        }
      })
    },

    clearNumber() {
      this.form.password = ''
    },
    handleLogin() {
      if (this.loginType === 'account') {
        this.accoutLogin()
      } else {
        this.phoneLogin()
      }
    },
    async accoutLogin() {
      var phone = this.form.phone
      var password = this.form.password
      var phoneReg = /^1[3456789]\d{9}$/
      if (!phoneReg.test(phone)) {
        uni.showToast({
          title: '手机号格式错误',
          duration: 2000,
          icon: 'none',
        })
        return
      }
      if (password.length < 4) {
        uni.showToast({
          title: '密码格式错误',
          duration: 2000,
          icon: 'none',
        })
        return
      }
      if (!this.isAgree) {
        uni.showToast({
          title: '请先勾选用户协议',
          duration: 2000,
          icon: 'none',
        })
        return
      }
      let encryptPassword = btoa(password)
      const form = {
        phone: this.form.phone,
        password: encryptPassword,
        tenantName: '',
      }
      uni.showLoading({
        title: '正在登录',
      })
      // uni.clearStorageSync()
      login(form)
        .then((res) => {
          uni.hideLoading()
          if (res.access_token) {
            uni.showToast({
              title: '登录成功',
              duration: 2000,
              icon: 'none',
            })
            uni.setStorageSync('USER_TOKEN', res.access_token)

            const userInfo = {
              userName: res.userName,
              realName: res.realName,
              token: res.access_token,
              phone: res.phone,
              roles: res.roles,
              expires: res.expires_in,
              scope: res.scope,
              userId: res.userId,
            }
            this.setPassword(encryptPassword)
            this.setUserPhone(this.form.phone)
            this.setOrionUserInfo(userInfo)

            //跳转home
            uni.switchTab({
              url: '../home/home',
            })
          } else {
            setTimeout(() => {
              uni.showToast({
                title: '服务器错误',
                duration: 2000,
                icon: 'none',
              })
            }, 100)
          }
        })
        .catch((err) => {
          console.log('err', err)
        })
    },

    codeChange(text) {
      this.tips = text
    },
    getCode() {
      if (this.$refs.uCode.canGetCode) {
        // uni.showLoading({
        //   title: '正在获取验证码',
        // })
        sendMsg({ phone: this.form.phone, purposeName: 'CURRENCY' }).then((res) => {
          // 这里此提示会被this.start()方法中的提示覆盖
          uni.$u.toast('验证码已发送')
          // 通知验证码组件内部开始倒计时
          this.$refs.uCode.start()
        })
      } else {
        uni.$u.toast('倒计时结束后再发送')
      }
    },
    end() {
      uni.$u.toast('倒计时结束')
    },

    phoneLogin() {
      if (!this.isAgree) {
        uni.showToast({
          title: '请先勾选用户协议',
          duration: 2000,
          icon: 'none',
        })
        return
      }
      if (!(this.form.vCode && this.form.phone)) {
        uni.showToast({
          title: '请先完善登录信息',
          duration: 2000,
          icon: 'none',
        })
        return
      }

      loginByCode({
        code: this.form.vCode,
        crm: true,
        phone: this.form.phone,
        tenantId: '',
      }).then((res) => {
        if (res.access_token) {
          uni.showToast({
            title: '登录成功',
            duration: 2000,
            icon: 'none',
          })
          uni.setStorageSync('USER_TOKEN', res.access_token)
          const userInfo = {
            userName: res.userName,
            realName: res.realName,
            phone: res.phone,
            roles: res.roles,
            expires: res.expires_in,
            scope: res.scope,
            userId: res.userId,
          }

          this.setUserPhone(res.phone)
          this.setOrionUserInfo(userInfo)

          //跳转home
          uni.switchTab({
            url: '../home/home',
          })
        } else {
          setTimeout(() => {
            uni.showToast({
              title: '服务器错误',
              duration: 2000,
              icon: 'none',
            })
          }, 100)
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.place {
  height: 100rpx;
  /*  #ifdef  APP-PLUS  */
  margin-top: var(--status-bar-height);
  /*  #endif  */
}
/deep/.u-checkbox-group--row {
  justify-content: center;
  .agreement {
    display: flex;

    font-size: 30rpx;
    margin: 40rpx 0;
    .href {
      cursor: pointer;
      color: #33a3dc;
    }
  }
}
.login-container {
  height: calc(100% - 200rpx);
  width: 100%;
  background: url(../../static/img/loginbg.png);
  background-size: 100% 100%;
  padding-top: 200rpx;
  .page-card {
    width: 70%;
    margin: 0 auto;
    padding: 40rpx;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px 0 #ebeef5;
    border-radius: 20rpx;
    .title {
      font-size: 40rpx;
      text-align: center;
      color: #2e3153;
    }

    .content {
      .item {
        margin: 40rpx 0;
      }

      .btn {
        margin: 20rpx 0;
      }
    }
  }
}

.image-logo {
  width: 140rpx;
  margin: 20rpx auto;
}
.text-t {
  display: flex;
  justify-content: space-between;
  margin-top: 40rpx;
  .account {
    color: #33a3dc;
    font-size: 30rpx;
  }
  .forget {
    font-size: 30rpx;
    text-decoration: underline;
  }
}

.page-foot {
  z-index: -1;
  position: fixed;
  bottom: 0;
  height: 500rpx;
  width: 100%;
}
/deep/ .u-form-item__body__right__message {
  margin-left: 0;
}
.m-form {
  /deep/ .u-form-item {
    margin: 20px 0;
  }
  /deep/ .uni-input-input {
    padding-left: 10px;
  }
  /deep/.u-code-input {
    padding-left: 10px;
  }
}
</style>
