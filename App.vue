<script>
import { addActionLog, setRedisOnline } from '@/api/market'
import { mapState } from 'vuex'

export default {
  onLaunch: function () {
    this.moveToBack()
    this.setRedis()
    this.timer = setInterval(() => {
      this.setRedis()
    }, 18000)
  },
  onShow: function () {
    this.addLog('App 进入前台')
  },
  onHide: function () {
    this.addLog('App 进入后台')
  },
  computed: {
    ...mapState(['userPhone']),
  },

  data() {
    return {}
  },
  methods: {
    //设置在线redis
    setRedis() {
      if (this.userPhone) setRedisOnline(this.userPhone)
    },
    //添加Log
    addLog(str) {
      if (this.userPhone) addActionLog({ phone: this.userPhone, action: str })
    },
    //重写安卓APP默认关闭的功能，而是退至后台
    moveToBack() {
      // #ifdef APP-PLUS
      if (this.platform === 'android') {
        // 隐藏“再按一次退出应用”的提示，将应用隐藏至后台
        let main = plus.android.runtimeMainActivity()
        plus.runtime.quit = function () {
          main.moveTaskToBack(false)
        }
        //重写提示：如果提示为 ‘再按一次退出应用’ 就隐藏应用，其他提示正常显示
        plus.nativeUI.toast = function (str) {
          console.log('再按一次退出应用')
          if (str == '再按一次退出应用') {
            main.moveTaskToBack(false)
            return false
          } else {
            uni.showToast({
              title: str,
              icon: 'none',
            })
          }
        }
      }
      // #endif
    },
  },
}
</script>

<style lang="scss">
@import '@/common/uni.css';
@import '@/styles/index.scss';
page {
  height: 100%;
  width: 100%;
  position: relative;
}

@import 'uview-ui/index.scss'; /*每个页面公共css */
</style>
