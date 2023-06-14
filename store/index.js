import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
var currMonth = new Date().getMonth() + 1
var currQuarter = Math.floor(currMonth % 3 == 0 ? currMonth / 3 : currMonth / 3 + 1) - 1
if (!currQuarter) {
  currQuarter = 1
}
const store = new Vuex.Store({
  state: {
    userPhone: uni.getStorageSync('USER_PHONE'),
    password: uni.getStorageSync('USER_PASSWORD'),
    orionUserInfo: uni.getStorageSync('ORION_USER_INFO') || {},
    crmUserInfo: {},
    amapInfo: {
      hasOpen: false,
      hasClose: false,
      openTime: null,
      closeTime: null,
      lunaAmap: null, //插件对象
      myInterval: 2, //定位间隔，单位秒
      sucCount: 0, // 持续定位成功次数
      errCount: 0, // 持续定位失败次数
    },
    packerDefault: {
      dayVal: Number(new Date()),
      monthVal: Number(new Date()),
      quarterIndex: [4, currQuarter],
      yearIndex: [4],
    },
    employeesTabIndex: 0,
  },
  mutations: {
    setPassword(state, info) {
      state.password = info
      uni.setStorageSync('USER_PASSWORD', info)
    },
    setUserPhone(state, info) {
      state.userPhone = info
      uni.setStorageSync('USER_PHONE', info)
    },
    setOrionUserInfo(state, info) {
      state.orionUserInfo = info
      uni.setStorageSync('ORION_USER_INFO', info)
    },
    setCrmUserInfo(state, info) {
      state.crmUserInfo = info
      uni.setStorageSync('CRM_USER_INFO', info)
    },
    setAmapInfo(state, info) {
      state.amapInfo = info
      uni.setStorage({
        //将用户信息保存在本地
        key: 'amapInfo',
        data: info,
      })
    },
    //记录上一次修改日期的索引
    setPackerDefault(state, info) {
      console.log(info, 'info')
      state.packerDefault = info
    },
    //记录员工Tabs的索引
    setEmployeesTabIndex(state, info) {
      state.employeesTabIndex = info
    },
  },
})

export default store
