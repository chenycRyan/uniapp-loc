<template>
  <view class="container">
    <view class="title">
      <view class="item0"> 系统</view>
      <view class="item1"> IP地址 </view>
      <view class="item2">登录时间</view>
    </view>
    <u-list @scrolltolower="scrolltolower">
      <u-list-item v-for="(item, index) in dataList" :key="index" class="group">
        <u-cell @click="selectPerson(item)">
          <text slot="value" class="item0"> {{ item.os }}</text>
          <text slot="value" class="item1"> {{ item.ip }}</text>
          <text slot="value" class="item2"> {{ item.createdTime }}</text>
        </u-cell>
      </u-list-item>
    </u-list>
  </view>
</template>

<script>
import { getloginlogs } from '@/api/market.js'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      page: 0,
      dataList: [],
    }
  },
  onLoad() {
    this.pageInit()
  },
  computed: {
    ...mapState(['orionUserInfo']),
  },
  methods: {
    pageInit() {
      const { phone } = this.orionUserInfo
      getloginlogs({
        loginName: phone,
        page: this.page,
        size: 20,
        sort: 'createdTime,DESC',
      }).then((res) => {
        res.content.forEach((item) => {
          item.os = item.os.slice(0, 7)
          item.createdTime = uni.$u.timeFormat(item.createdTime, 'yyyy-mm-dd hh:MM:ss')
        })
        this.dataList = [...this.dataList, ...res.content]
        console.log(this.dataList)
      })
    },
    scrolltolower() {
      this.page++
      this.pageInit()
    },
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
.title {
  display: flex;

  .item0 {
    flex: 1.8;
    text-align: center;
  }
  .item1 {
    flex: 2.5;
    text-align: center;
  }
  .item2 {
    flex: 4;
    text-align: center;
  }
}
.group {
  display: flex;

  .item0 {
    flex: 1.8;
  }
  .item1 {
    flex: 2.5;
  }
  .item2 {
    flex: 4;
  }
}
</style>
