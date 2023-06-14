<template>
  <view class="container">
    <!-- 搜索员工 -->
    <view class="search-box">
      <u-search placeholder="请输入关键字" :clearabled="true" v-model="selectName" @custom="searchByName" @search="searchByName"></u-search>

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
    <view class="group mt-10" v-show="!showPersonList">
      <view class="item1">描述</view>
      <view class="item2">时间</view>
      <view class="item3">姓名</view>
    </view>
    <u-list v-show="!showPersonList">
      <u-list-item v-for="(item, index) in dataList" :key="index" class="group">
        <u-cell @click="selectPerson(item)">
          <text slot="value" class="item1"> {{ item.action }}</text>
          <text slot="value" class="item2"> {{ item.createTime }}</text>
          <text slot="value" class="item3"> {{ item.userName }}</text>
        </u-cell>
      </u-list-item>
    </u-list>
  </view>
</template>

<script>
import { getActionlog, getUserByName } from '@/api/market.js'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      selectName: '',
      showPersonList: false,
      dataList: [],
      personList: [],
    }
  },
  onLoad() {
    this.pageInit()
  },
  computed: {
    ...mapState(['orionUserInfo']),
  },
  methods: {
    pageInit(userPhone) {
      this.dataList = []
      const phone = userPhone || this.orionUserInfo.phone
      getActionlog({ phone: phone }).then((res) => {
        this.dataList = res
      })
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
      this.selectName = item.userName
      this.showPersonList = false
      this.pageInit(item.mobilePhone)
    },
    // scrolltolower() {
    //   this.page++
    //   this.pageInit()
    // },
  },
}
</script>

<style lang="scss" scoped>
.container {
  padding: 20px 10px;
}
/deep/.u-cell__body__content {
  flex-grow: 0;
}
/deep/.u-cell__body {
  font-size: 28rpx;
}
.group {
  display: flex;

  .item1 {
    flex: 1;
    text-align: center;
  }

  .item2 {
    flex: 1.2;
    text-align: center;
  }
  .item3 {
    flex: 0.8;
    text-align: center;
  }
}
</style>
