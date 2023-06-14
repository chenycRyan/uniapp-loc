<template>
  <view class="u-page">
    <u-list @scrolltolower="scrolltolower">
      <u-list-item v-for="(item, index) in dataList" :key="index">
        <u-cell :title="item.content">
          <u-icon slot="icon" v-if="item.status === '未完成'" size="32" color="#18b566" name="checkbox-mark"></u-icon>
          <u-icon slot="icon" v-else size="32" color="#f29100" name="rewind-right-fill"></u-icon>
          <text slot="value">{{ item.dateTime }}</text>
        </u-cell>
      </u-list-item>
    </u-list>
  </view>
</template>

<script>
import { getUserEvents } from '@/api/market.js'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      dataList: [],
    }
  },
  onLoad() {
    this.loadmore()
  },
  computed: {
    ...mapState(['orionUserInfo']),
  },
  methods: {
    scrolltolower() {
      //   this.loadmore()
    },
    loadmore() {
      const { phone } = this.orionUserInfo
      getUserEvents({
        mobilePhone: phone,
        num: '20',
      }).then((res) => {
        res.forEach((item) => {
          item.dateTime = uni.$u.timeFormat(item.dateTime, 'yyyy-mm-dd')
        })
        this.dataList = res
      })
    },
  },
}
</script>
