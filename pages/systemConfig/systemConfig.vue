<template>
  <view class="config-container">
    <view class="place"></view>
    <u--form labelPosition="left">
      <u-form-item
        :label="item.type"
        borderBottom
        v-for="(item, index) in this.dataList"
        :key="item.id"
        :labelWidth="60 + item.type.length * 10"
      >
        <u-icon
          name="question-circle-fill"
          v-if="item.remark.length > item.type.length"
          @click="showTitle(item.remark)"
          class="form-icon"
        ></u-icon>
        <u-cell :title="item.value" v-if="includeT(item.name)" @click="openDatePicker(item, index)"></u-cell>
        <!-- <u--input
          v-model="item.value"
          v-if="item.name == 'ABSENCE' || item.name == 'LATE'"
          border="none"
          @focus="openDatePicker(item, index)"
        >
        </u--input> -->
        <u--input v-model="item.value" border="none" v-else> </u--input>
      </u-form-item>
    </u--form>
    <u-button type="primary" class="mt-10" @click="showModal = true">提交</u-button>
    <u-toast ref="uToast"></u-toast>

    <u-datetime-picker
      :show="showDate"
      v-model="defalutTime"
      mode="time"
      @cancel="showDate = false"
      @confirm="confirmDate"
    ></u-datetime-picker>

    <u-modal
      :show="showModal"
      title="操作提示"
      showCancelButton
      content="该操作将修改系统参数配置，请谨慎操作！"
      @cancel="showModal = false"
      @confirm="confirmModal"
    ></u-modal>
    <u-modal :show="showMessage" title="提示" :content="message" @confirm="showMessage = false"></u-modal>
  </view>
</template>

<script>
import { getParamConfig, modifyConfig } from '@/api/market.js'
export default {
  data() {
    return {
      defalutTime: '',
      showDate: false,
      showMessage: false,
      showModal: false,
      message: '',
      form: {},
      dataList: [],

      activeIndex: '',
    }
  },
  onLoad() {
    this.init()
  },
  methods: {
    init() {
      getParamConfig().then((res) => {
        this.dataList = res.filter((item) => item.name !== 'FEEDBACK')
      })
    },
    includeT(name) {
      return name.indexOf('T_') > -1
    },
    openDatePicker(item, index) {
      this.defalutTime = item.value
      this.showDate = true
      this.activeIndex = index
    },
    confirmDate(e) {
      let { value } = e
      if (!value) {
        value = '00:00'
      }
      console.log(value)
      this.dataList[this.activeIndex].value = value + ':00'
      this.showDate = false
      this.$set(this.dataList, 0, this.dataList[0])
    },
    showTitle(msg) {
      this.message = msg
      this.showMessage = true
    },
    confirmModal() {
      console.log(this.dataList)
      uni.showLoading({
        title: '修改中',
      })
      this.dataList.forEach((item) => {
        modifyConfig(item).then((res) => {
          this.showModal = false
          this.$refs.uToast.show({
            type: 'success',
            message: '修改配置成功',
            iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
          })
        })
      })
      setTimeout(() => {
        uni.hideLoading()
        this.init()
      }, 500)
    },
  },
}
</script>

<style lang="scss" scoped>
.config-container {
  padding: 20px;
}
.form-icon {
  font-size: 20px;
  color: #909399;
  margin-right: 10px;
}
</style>
