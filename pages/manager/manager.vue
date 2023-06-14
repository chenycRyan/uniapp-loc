<template>
  <view class="usearch">
    <view class="place"></view>
    <view class="card">
      <u-divider text="管理员列表" textPosition="left"></u-divider>
      <u-list class="ulist" style="max-height: 220px; height: auto">
        <u-list-item v-for="(item, index) in manageList" :key="index">
          <u-cell @click="selectPerson(item)">
            <text slot="value" style="flex: 1"> {{ item.realName }}</text>
            <text slot="value" style="flex: 2"> {{ item.phone }}</text>
            <u-icon slot="value" name="man-delete" @click="delManager(item)" style="flex: 1" color="#dd6161" size="26"></u-icon>
          </u-cell>
        </u-list-item>
      </u-list>
    </view>
    <view style="padding: 10px">
      <u-divider text="请先选择人员" textPosition="left"></u-divider>
      <u-search placeholder="请输入关键字" v-model="userName" :clearabled="true" @custom="searchByName" @search="searchByName"></u-search>
      <u-list v-show="showList" class="ulist">
        <u-list-item v-for="(item, index) in dataList" :key="index">
          <u-cell @click="selectPerson(item)">
            <text slot="value" style="flex: 2"> {{ item.userName }}</text>
            <text slot="value" style="flex: 3"> {{ item.operation }}</text>
            <text slot="value" style="flex: 3"> {{ item.mobilePhone }}</text>
          </u-cell>
        </u-list-item>
      </u-list>
      <view class="mt-10" v-show="!showList && userId">
        <u-cell title="分配权限" :isLink="true" arrow-direction="right" @click="showPicker = true"></u-cell>
      </view>
      <u-picker :show="showPicker" :columns="roles" keyName="description" @confirm="confirmRole" @cancel="showPicker = false"></u-picker>
    </view>
    <u-toast ref="uToast"></u-toast>
    <u-modal
      :show="showModal"
      title="操作提示"
      showCancelButton
      :content="modalContent"
      @cancel="showModal = false"
      @confirm="confirmDel"
    ></u-modal>
  </view>
</template>

<script>
import { allotRoles, getUserByName, getSaleManage } from '@/api/market.js'
export default {
  data() {
    return {
      showModal: false,
      modalContent: '',
      userId: '',
      delUserId: '',
      userName: '',
      showPicker: false,
      dataList: [],
      manageList: [],
      showList: false,
      roles: [
        [
          {
            id: 453,
            name: 'Sale',
            description: '销售',
            isDeleted: false,
            permissions: [],
          },
          {
            id: 454,
            name: 'SaleManage',
            description: '销售管理',
            isDeleted: false,
            permissions: [],
          },
        ],
      ],
    }
  },
  onLoad() {
    this.pageInit()
  },
  methods: {
    pageInit() {
      getSaleManage().then((res) => {
        this.manageList = res
        console.log(res)
      })
    },
    searchByName(val) {
		if(!val){
			this.$refs.uToast.show({
			  type: 'default',
			  message: '请输入查询条件',
			
			})
			return
		}
      uni.showLoading({
        title: '查询中',
      })
      this.showList = true
      getUserByName(val).then((res) => {
        uni.hideLoading()
        this.dataList = res
      })
    },
    selectPerson(item) {
      this.showList = false
      this.userName = item.userName
      this.userId = item.orionUserId
      console.log(item)
    },
    delManager(item) {
      this.delUserId = item.id
      console.log(this.delUserId)
      this.showModal = true
      this.modalContent = ` 此操作将解除“${item.realName}”管理员角色`
    },
    //删除管理员
    confirmDel() {
      if (this.delUserId) {
        const params = { id: this.delUserId, roleIds: [6, 453] }
        allotRoles(this.delUserId, params).then((res) => {
          this.pageInit()
          this.showModal = false
          this.$refs.uToast.show({
            type: 'success',
            message: '角色修改成功！重新登录生效',
            iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
          })
        })
      }
    },
    confirmRole(e) {
      const { value } = e
      const params = { id: this.userId, roleIds: [6, value[0].id] }
      allotRoles(this.userId, params).then((res) => {
        this.showPicker = false
        this.pageInit()
        this.$refs.uToast.show({
          type: 'success',
          message: '角色修改成功！重新登录生效',
          iconUrl: 'https://cdn.uviewui.com/uview/demo/toast/success.png',
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.ulist {
  /deep/.u-cell__body__content {
    flex-grow: 0;
  }
}
.card {
  border: 1px solid #ebeef5;
  box-shadow: 0 2px 12px 0 #ebeef5;
  border-radius: 10rpx;
}

.place {
  height: 50rpx;
}
.usearch {
  width: 92%;
  margin: 0 auto;
}
</style>
