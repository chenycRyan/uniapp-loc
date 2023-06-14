<template>
  <view class="imt-calendar">
    <view class="calendar-month-wrapper">
      <u-icon name="arrow-left" :color="current == 0 ? '#fff' : '#333333'" @click="turnLeft"></u-icon>
      <view class="calendar-month">{{ currentTime }}</view>
      <u-icon name="arrow-right" :color="current == calendar.length - 1 ? '#fff' : '#333333'" @click="turnRight"></u-icon>
    </view>
    <view class="calendar-week-wrapper">
      <view class="calendar-week" v-for="(item, index) in week" :key="index">{{ item }}</view>
    </view>
    <swiper class="calendar-date-swiper" :current="current" @change="current = $event.detail.current">
      <swiper-item class="calendar-date-wrapper" v-for="(item, index) in calendar" :key="index">
        <view
          class="calendar-date"
          v-for="(value, key) in item"
          :key="key"
          :style="value.error && { background: '#18b566', color: '#fff' }"
          :class="value.selected && 'select-date'"
          @click="selcetDate(value, key, item, index)"
          >{{ value.date }}</view
        >
      </swiper-item>
    </swiper>
  </view>
</template>

<script>
export default {
  data() {
    return {
      idx: new Date().getDate(),
      week: ['日', '一', '二', '三', '四', '五', '六'],
      current: '',
      startYear: '',
      startMonth: '',
      calendar: [],
      fromDate: '2022-01-01',
    }
  },
  props: {
    successList: {
      type: Array,
      default() {
        return []
      },
    },
    selected: {
      type: Array,
      default() {
        return []
      },
    },
    color: {
      type: String,
      //   default: '#e5373f',
      default: '#3a75c5',
    },
  },
  created() {
    let year = new Date().getFullYear()
    let month = new Date().getMonth()
    this.startYear = this.selected.length ? this.fromDate.substr(0, 4) : `${year}`
    this.startMonth = this.selected.length ? this.fromDate.substr(5, 2) - 1 : month
    this.calendar = [...Array((year - this.startYear) * 12 + month - this.startMonth + 1).keys()].map((i) => this.getDate(this.format(i)))

    this.current = this.calendar.length - 1
  },
  watch: {
    successList(newVal) {
      this.calendar.forEach((item) => {
        item.forEach((a) => {
          if (a.error) delete a.error
          if (a.selected) delete a.selected
        })
      })
      newVal.forEach((item) => {
        let time = item.split('-')
        this.calendar[time[1] - this.startMonth - 1 + (time[0] - this.startYear) * 12][
          time[2] - 1 + new Date(`${time[0]}-${time[1]}`).getDay()
        ].error = true
      })
      this.selected.forEach((item, index) => {
        if (index === this.selected.length - 1) {
          let time = item.split('-')
          this.calendar[time[1] - this.startMonth - 1 + (time[0] - this.startYear) * 12][
            time[2] - 1 + new Date(`${time[0]}-${time[1]}`).getDay()
          ].selected = true
        }
      })

      this.$set(this.calendar, 0, this.calendar[0])
    },
  },
  methods: {
    turnLeft() {
      this.current && this.current--
      this.$emit('changeMonth', this.currentTime)
    },
    turnRight() {
      this.current == this.calendar.length - 1 || this.current++
      this.$emit('changeMonth', this.currentTime)
    },
    selcetDate(val, key, arr, index) {
      if (val.date) {
        arr.forEach((item) => (item.selected = false))
        arr[key].selected = true
        this.$set(this.calendar, index, arr)
        const date = this.format(this.current) + '-' + val.date
        this.$emit('changeDate', date)
      }
    },
    getDate(e) {
      let time = e.split('-')
      return [...Array(new Date(`${time[0]}-${time[1]}`).getDay())]
        .map((i) => ({
          date: '',
        }))
        .concat(
          [...Array([4, 6, 9, 11].includes(time[1] * 1) ? 30 : time[1] != 2 ? 31 : time[0] % 4 == 0 ? 29 : 28).keys()].map((i) => ({
            date: i + 1,
          }))
        )
    },
    format(e) {
      let time = new Date(new Date(this.startYear).setMonth(this.startMonth + e))
      return `${time.getFullYear()}-${(time.getMonth() < 9 && '0') + (time.getMonth() + 1)}`
    },
  },
  computed: {
    currentTime() {
      return this.format(this.current)
    },
  },
}
</script>

<style>
@font-face {
  font-family: 'imt-calendar';
  src: url('//at.alicdn.com/t/font_1114123_r6yq558axt.ttf') format('truetype');
}

.imt-calendar {
  width: 700upx;
  margin: auto;
  background: #fff;
  border-radius: 10upx;
  text-align: center;
  color: #333;
}

.calendar-month-wrapper {
  display: flex;
  justify-content: space-around;
  border-bottom: 2upx solid #e5e5e5;
}

.calendar-icon {
  font-family: 'imt-calendar';
  width: 100upx;
  font-size: 32upx;
  line-height: 100upx;
  color: #ccc;
}

.calendar-month {
  font-size: 32upx;
  line-height: 100upx;
}

.calendar-icon-leftArrow {
  transform: rotate(180deg);
}

.calendar-week-wrapper {
  display: flex;
}

.calendar-week {
  flex: 1;
  font-size: 32upx;
  line-height: 100upx;
}

.calendar-date-swiper {
  height: 500upx;
}

.calendar-date-wrapper {
  display: flex;
  flex-wrap: wrap;
}

.calendar-date {
  width: 60upx;
  height: 60upx;
  font-size: 32upx;
  line-height: 60upx;
  border-radius: 50%;
  margin: 20upx;
}
.select-date {
  background: #3a75c5;
  color: #fff;
}
</style>
