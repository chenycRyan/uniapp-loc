<template>
  <view class="page-container">
    <view class="place"></view>
    <view class="text-area">
      <u--textarea v-model="content" placeholder="请输入内容" count height="300" maxlength="1000" class="item"></u--textarea>
    </view>
    <u-toast ref="uToast"></u-toast>
    <u-button type="primary" size="large" shape="circle" text="提交" class="subbtn" style="width: 90%" @click="submitIssue"></u-button>
  </view>
</template>

<script>
import { submitIssue } from '@/api/market.js'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      content: '',
      pickerArray: ['王经理', '陈总', '徐总', '人事部'],
      index: null,
    }
  },
  computed: {
    ...mapState(['orionUserInfo']),
  },
  methods: {
    submitIssue() {
      if (!this.content) {
        this.$refs.uToast.show({
          type: 'error',
          message: '请先输入内容',
        })
        return
      }
      const { phone } = this.orionUserInfo
      const data = {
        content: this.content,
        isPrivate: '0',
        phone: phone,
        systemTypeCode: '7',
      }

      submitIssue(data).then((res) => {
        this.$refs.uToast.show({
          type: 'success',
          message: '问题上报成功！',
          complete() {
            uni.switchTab({
              url: '../home/home',
            })
          },
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.place {
  height: 80rpx;
}
.text-area {
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  height: 400px;
  padding: 0rpx 40rpx;
  .item {
    flex-grow: 0;
  }
  .subbtn {
    margin-top: 20px;
  }
}
</style>
