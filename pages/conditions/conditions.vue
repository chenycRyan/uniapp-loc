<template>
  <view>
    <u-cell-group>
      <u-cell title="按天统计" :isLink="true" arrow-direction="right" @click="showDay = true" v-if="showDayCell"></u-cell>
      <!-- <u-cell title="按周统计" :isLink="true" arrow-direction="right" @click="showWeek = true"></u-cell> -->
      <u-cell title="按月统计" :isLink="true" arrow-direction="right" @click="showMonth = true"></u-cell>
      <u-cell title="按季统计" :isLink="true" arrow-direction="right" @click="showQuarter = true" v-if="!showDayCell"></u-cell>
      <u-cell title="按年统计" :isLink="true" arrow-direction="right" @click="showYear = true" v-if="!showDayCell"></u-cell>
    </u-cell-group>
    <u-datetime-picker
      v-model="packerDefault.dayVal"
      :show="showDay"
      @confirm="confirmDay"
      @cancel="showDay = false"
      mode="date"
    ></u-datetime-picker>
    <!-- <u-picker :show="showWeek" :columns="columnsWeek" @confirm="confirmWeek" @cancel="showWeek = false"></u-picker> -->
    <u-datetime-picker
      :show="showMonth"
      v-model="packerDefault.monthVal"
      @confirm="confirmMonth"
      @cancel="showMonth = false"
      mode="year-month"
    >
    </u-datetime-picker>
    <u-picker
      :show="showQuarter"
      ref="uPicker"
      :columns="columnsQuarter"
      :defaultIndex="packerDefault.quarterIndex"
      @confirm="confirmQuarter"
      @cancel="showQuarter = false"
    >
    </u-picker>
    <u-picker
      :show="showYear"
      ref="uPicker"
      :defaultIndex="packerDefault.yearIndex"
      :columns="columnsYear"
      @confirm="confirmYear"
      @cancel="showYear = false"
    ></u-picker>
  </view>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
export default {
  data() {
    return {
      showDayCell: false,
      params: {},
      showDay: false,
      showWeek: false,
      columnsWeek: [['上一周', '当前周']],
      showMonth: false,
      showQuarter: false,
      columnsQuarter: [],
      showYear: false,
      columnsYear: [],
      keyCode: {
        一季度: {
          dateFrom: '01-01',
          dateTo: '03-31',
        },
        二季度: {
          dateFrom: '04-01',
          dateTo: '06-30',
        },
        三季度: {
          dateFrom: '07-01',
          dateTo: '09-30',
        },
        四季度: {
          dateFrom: '10-01',
          dateTo: '12-31',
        },
      },
    }
  },
  computed: {
    ...mapState(['packerDefault']),
  },
  onLoad(options) {
    console.log(options.showDay)
    this.showDayCell = options.showDay == 1
    let year = new Date().getFullYear()
    let arr = []
    for (let index = 0; index < 5; index++) {
      arr.unshift(year--)
    }
    this.columnsQuarter.push(arr)
    this.columnsQuarter.push(['一季度', '二季度', '三季度', '四季度'])
    this.columnsYear.push(arr)
    var now = new Date() //当前日期
    var nowDayOfWeek = now.getDay() //今天本周的第几天
    var nowDay = now.getDate()
    var nowMonth = now.getMonth()
    var nowYear = now.getFullYear()
    //获得上周的开始日期
    var lastWeekStart = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 6)
    var lastWeekEnd = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek)
    //获得本周的开始日期
    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 1)
    //获得本周的结束日期
    var weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek))

    this.keyCode['上一周'] = {
      dateFrom: uni.$u.timeFormat(lastWeekStart, 'yyyy-mm-dd'),
      dateTo: uni.$u.timeFormat(lastWeekEnd, 'yyyy-mm-dd'),
    }
    this.keyCode['当前周'] = {
      dateFrom: uni.$u.timeFormat(weekStartDate, 'yyyy-mm-dd'),
      dateTo: uni.$u.timeFormat(weekEndDate, 'yyyy-mm-dd'),
    }
  },
  methods: {
    ...mapMutations(['setPackerDefault']),
    changeHandler(e) {
      const {
        columnIndex,
        value,
        values, // values为当前变化列的数组内容
        index,
        // 微信小程序无法将picker实例传出来，只能通过ref操作
        picker = this.$refs.uPicker,
      } = e
      // 当第一列值发生变化时，变化第二列(后一列)对应的选项
      if (columnIndex === 0) {
        // picker为选择器this实例，变化第二列对应的选项
        picker.setColumnValues(1, this.columnData[index])
      }
    },
    confirmDay(e) {
      const { value } = e
      this.setPackerDefault({
        dayVal: value,
        monthVal: this.packerDefault.monthVal,
        quarterIndex: this.packerDefault.monthVal,
        yearIndex: this.packerDefault.yearIndex,
      })
      this.params = {
        dateFrom: uni.$u.timeFormat(value, 'yyyy-mm-dd'),
        dateTo: uni.$u.timeFormat(value + 24 * 60 * 60 * 1000, 'yyyy-mm-dd'),
      }
      console.log(this.params)
      this.showDay = false
      this.toOrigin()
    },

    confirmWeek(e) {
      const { value } = e
      this.params = this.keyCode[value]
      this.showWeek = false
      console.log(this.params)
      this.toOrigin()
    },
    confirmMonth(e) {
      const { value } = e
      this.setPackerDefault({
        dayVal: this.packerDefault.dayVal,
        monthVal: value,
        quarterIndex: this.packerDefault.quarterIndex,
        yearIndex: this.packerDefault.yearIndex,
      })
      this.params = {
        dateFrom: uni.$u.timeFormat(value, 'yyyy-mm') + '-01',
        dateTo: uni.$u.timeFormat(value, 'yyyy-mm') + '-31',
      }
      console.log(this.params)
      this.showMonth = false
      this.toOrigin()
    },
    confirmQuarter(e) {
      const { value, indexs } = e
      this.setPackerDefault({
        dayVal: this.packerDefault.dayVal,
        monthVal: this.packerDefault.monthVal,
        quarterIndex: indexs,
        yearIndex: this.packerDefault.yearIndex,
      })

      this.params.dateFrom = value[0] + '-' + this.keyCode[value[1]].dateFrom
      this.params.dateTo = value[0] + '-' + this.keyCode[value[1]].dateTo
      console.log(this.params)
      this.showQuarter = false
      this.toOrigin()
    },
    confirmYear(e) {
      const { value, indexs } = e
      this.setPackerDefault({
        dayVal: this.packerDefault.dayVal,
        monthVal: this.packerDefault.monthVal,
        quarterIndex: this.packerDefault.quarterIndex,
        yearIndex: indexs,
      })
      this.params.dateFrom = value[0] + '-' + '01-01'
      this.params.dateTo = value[0] + '-' + '12-31'
      console.log(this.params)
      this.showYear = false
      this.toOrigin()
    },
    toOrigin() {
      /*获取当前路由*/
      let curPage = this.$mp.page
      //在微信小程序或是app中，通过curPage.options；如果是H5，则需要curPage.$route.query（H5中的curPage.options为undefined，所以刚好就不需要条件编译了）
      let curParam = curPage.options.path || curPage.$route.query.path
      console.log(curParam)
      uni.navigateTo({
        url: curParam.replace('pages', '..') + '?params=' + JSON.stringify(this.params) + '&phone=' + curPage.options.phone,
      })
    },
  },
}
</script>
