import App from './App'
import Vue from 'vue'
import store from './store'

// main.js，注意要在use方法之后执行
import { appVersion } from '@/config/version.js'
import uView from 'uview-ui'
Vue.use(uView)

const nowYear = new Date().getFullYear()
const nowMonth = new Date().getMonth() + 1
const nowDay = new Date().getDate()
// const lastDay = nowDay - 1
//Vue.prototype.$defalutFrom = '2010-01-01'
Vue.prototype.$defalutFrom = nowYear + '-01-01'
Vue.prototype.$defalutTo = nowYear + '-12-31'
Vue.prototype.$monthFrom = nowYear + '-' + (nowMonth < 10 ? '0' + nowMonth : nowMonth) + '-01'
Vue.prototype.$monthTo = nowYear + '-' + (nowMonth < 10 ? '0' + nowMonth : nowMonth) + '-31'
Vue.prototype.$personFrom = uni.$u.timeFormat(new Date().getTime(), 'yyyy-mm-dd')
Vue.prototype.$personTo = uni.$u.timeFormat(new Date().getTime() + 24 * 60 * 60 * 1000, 'yyyy-mm-dd')
// Vue.prototype.$personFrom = nowYear + '-' + (nowMonth < 10 ? '0' + nowMonth : nowMonth) + '-' + (nowDay < 10 ? '0' + nowDay : nowDay)
// Vue.prototype.$personTo =
//   nowYear + '-' + (nowMonth < 10 ? '0' + nowMonth : nowMonth) + '-' + (nowDay + 1 < 10 ? '0' + nowDay + 1 : nowDay + 1)
Vue.prototype.$companyLevel = 'COMPANY'
Vue.prototype.$personLevel = 'PEOPLE'
Vue.prototype.$appVersion = appVersion
Vue.prototype.$store = store

Vue.config.productionTip = false

App.mpType = 'app'
const app = new Vue({
  store,
  ...App,
})
app.$mount()
