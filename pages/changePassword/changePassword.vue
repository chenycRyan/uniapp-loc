<template>
  <view>
    <view class="place"></view>
    <view class="card">
      <u--form labelPosition="left" :model="form" :rules="rules" ref="uForm">
        <u-form-item label="手机号" borderBottom labelWidth="60" v-if="showForget">
          <u--input v-model="form.phone" @blur="checkBlurPhone" border="none"></u--input>
          <u-code :seconds="seconds" @end="end" ref="uCode" @change="codeChange"></u-code>
          <u-button type="primary" @tap="getCode" style="width: 200rpx" size="small">{{ tips }}</u-button>
        </u-form-item>
        <u-form-item label="验证码" borderBottom labelWidth="60" v-if="showForget">
          <u-code-input v-model="form.vCode" mode="line" :maxlength="4"></u-code-input>
        </u-form-item>
        <u-form-item label="旧密码" prop="oldPassword" borderBottom labelWidth="60" v-else>
          <u--input v-model="form.oldPassword" border="none"></u--input>
        </u-form-item>
        <u-form-item label="新密码" prop="newPassword" borderBottom labelWidth="60">
          <u--input v-model="form.newPassword" border="none"></u--input>
        </u-form-item>
        <u-form-item label="确认密码" prop="keyword" borderBottom labelWidth="80">
          <u--input v-model="form.keyword" border="none"></u--input>
        </u-form-item>
        <u-button type="primary" @click="submit">提交</u-button>
      </u--form>
      <view class="tips">
        <view>如您是新用户，请先登录一次，再修改密码</view>
        <view>我们会将您的数据由CRM导入掌控乾坤</view>
        <view>初始化密码为a123456</view>
      </view>

      <u-toast ref="uToast"></u-toast>
    </view>
  </view>
</template>

<script>
import { sendMsg, changePasswordByMsg, changePassword, checkPhone } from '@/api/market.js'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      showForget: false,
      form: {
        phone: '',
        vCode: '',
        oldPassword: '',
        newPassword: '',
        keyword: '',
      },
      rules: {
        oldPassword: {
          type: 'string',
          required: true,
          message: '请填写旧密码',
          trigger: ['blur', 'change'],
        },
        newPassword: {
          type: 'string',
          required: true,
          message: '请填写新密码',
          trigger: ['blur', 'change'],
        },
        keyword: {
          type: 'string',
          required: true,
          message: '请再次确认密码',
          trigger: ['blur', 'change'],
        },
      },
      tips: '',

      seconds: 60,
    }
  },
  onLoad(options) {
    if (options.type) {
      this.showForget = true
    }
    this.form.phone = this.userPhone
  },
  computed: {
    ...mapState(['userPhone', 'orionUserInfo']),
  },
  methods: {
    codeChange(text) {
      this.tips = text
    },
    getCode() {
      if (this.$refs.uCode.canGetCode) {
        // uni.showLoading({
        //   title: '正在获取验证码',
        // })
        sendMsg({ phone: this.form.phone, purposeName: 'RESET_PASS' }).then((res) => {
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
    submit() {
      //校验是否输入一致
      if (this.form.newPassword !== this.form.keyword) {
        this.$refs.uToast.show({
          type: 'error',
          icon: false,
          message: '两次新密码输入不一致',
          iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/error.png',
        })
        return
      }
      this.$refs.uForm
        .validate()
        .then((res) => {
          if (this.showForget) {
            changePasswordByMsg({
              phone: this.form.phone,
              vCode: this.form.vCode,
              newPassword: this.form.newPassword,
            }).then((res) => {
              this.$refs.uToast.show({
                type: 'success',
                message: '修改密码成功',
                iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
                complete() {
                  uni.navigateTo({
                    url: '../login/login',
                  })
                },
              })
            })
          } else {
            const { userId } = this.orionUserInfo

            const params = {
              userId: userId,
              oldPassword: this.form.oldPassword,
              newPassword: this.form.newPassword,
            }
            changePassword(userId, params).then((res) => {
              this.$refs.uToast.show({
                type: 'success',
                message: '修改密码成功',
                iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
                complete() {
                  uni.navigateTo({
                    url: '../login/login',
                  })
                },
              })
            })
          }
        })
        .catch((errors) => {
          console.log(errors)
          uni.$u.toast('校验失败')
        })
    },
  },
}
</script>

<style lang="scss" scoped>
/deep/.u-form-item {
  margin-bottom: 40rpx;
}
.tips {
  font-size: 24rpx;
  color: #f56c6c;
  text-align: center;
  margin-top: 10px;
  line-height: 20px;
}
.place {
  height: 150rpx;
}
.card {
  width: 84%;
  border-radius: 20rpx;
  padding: 80rpx 40rpx;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 5upx 20upx 0upx rgba(0, 0, 150, 0.2);
}
</style>
