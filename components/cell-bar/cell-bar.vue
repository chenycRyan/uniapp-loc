<template>
  <view>
    <!-- <qiun-title-bar title="选择范围" /> -->
    <u-cell-group>
      <u-cell title="运营中心" :isLink="true" arrow-direction="right" @click="showOper = true">
        <view slot="value">{{ queryName.oper }}</view>
      </u-cell>
      <u-cell title="运营中心包含省份" :isLink="true" arrow-direction="right" @click="showProv = true">
        <view slot="value">{{ queryName.prov }}</view>
      </u-cell>
    </u-cell-group>
    <u-picker
      :show="showOper"
      :columns="colOper"
      keyName="name"
      :defaultIndex="defaultIndex1"
      @confirm="confirmOper"
      @cancel="showOper = false"
    ></u-picker>
    <u-picker
      :show="showProv"
      ref="uPicker"
      keyName="name"
      :columns="colProv"
      :defaultIndex="defaultIndex2"
      @confirm="confirmProv"
      @cancel="showProv = false"
      @change="changeHandler"
    ></u-picker>
  </view>
</template>

<script>
import { getAllCity, getUserInfo } from '@/api/market.js'
import { mapState } from 'vuex'
export default {
  props: {
    date: {
      type: String,
      default: uni.$u.timeFormat(new Date(), 'yyyy-mm-dd'),
    },
  },
  computed: {
    ...mapState(['userPhone', 'orionUserInfo']),
  },
  data() {
    return {
      isAdmin: false,
      defaultIndex1: [0],
      defaultIndex2: [0, 0],
      queryName: {
        oper: '全国',
        prov: '',
      },
      colOper: [],
      colProv: [],
      columnData: [],
      showOper: false,
      showProv: false,
    }
  },
  mounted() {
    this.judgeRole()
    this.getCity()
  },
  methods: {
    //获取所有运营中心及省份
    getCity() {
      getAllCity({ dateFrom: this.date, level: 'OPERATION' }).then((res) => {
        this.colOper = [
          [
            {
              id: -1,
              name: '全国',
              subProvinceVoList: [],
            },
            ...res,
          ],
        ]
        this.columnData = []
        res.forEach((item) => {
          if (!item.subProvinceVoList) item.subProvinceVoList = []
          this.columnData.push(
            item.subProvinceVoList.map((sub) => {
              return {
                id: sub.provinceId,
                name: sub.provinceName,
              }
            })
          )
        })

        console.log(this.columnData)
        this.colProv = [...[res], this.columnData[0]]

        getUserInfo(this.orionUserInfo.phone).then((res) => {
          console.log(this.colOper)
          if (!this.isAdmin) {
            const index = this.colOper[0].findIndex((item) => item.name === res.operation)
            const arr = this.colOper[0].filter((item) => item.name === res.operation)
            this.colOper = [
              [
                {
                  id: -1,
                  name: '全国',
                  subProvinceVoList: [],
                },
                ...arr,
              ],
            ]

            this.colProv = [...[arr], this.columnData[index - 1]]
          }
        })
      })
    },
    //角色判断
    judgeRole() {
      //角色判断，区分管理端和员工端
      const { roles } = this.orionUserInfo
      if (roles && roles.length > 0 && !roles.includes('SaleManage')) {
        this.isAdmin = false
      } else {
        this.isAdmin = true
      }
    },

    changeHandler(e) {
      const {
        columnIndex,
        value,
        values, // values为当前变化列的数组内容
        index,
        // 微信小程序无法将picker实例传出来，只能通过ref操作
        picker = this.$refs.uPicker,
      } = e
      console.log(e)

      // 当第一列值发生变化时，变化第二列(后一列)对应的选项
      if (columnIndex === 0) {
        // picker为选择器this实例，变化第二列对应的选项
        picker.setColumnValues(1, this.columnData[index])
      }
    },
    //确认运营中心
    confirmOper(e) {
      const { value, indexs } = e
      this.defaultIndex1 = indexs
      console.log('confirm', e)
      if (value[0].name === '全国') {
        this.$emit('queryLimit', {
          level: 'COMPANY',
          item: value[0],
        })
      } else {
        this.$emit('queryLimit', {
          level: 'OPERATION',
          item: value[0],
        })
      }
      this.queryName.prov = ''
      this.queryName.oper = value[0].name

      this.showOper = false
    },
    //确认省份
    confirmProv(e) {
      const { value, indexs } = e
      this.defaultIndex2 = indexs
      console.log('confirm', e)
      this.$emit('queryLimit', {
        level: 'PROVINCE',
        item: value[1],
      })
      this.queryName.oper = ''
      this.queryName.prov = value[1].name
      this.showProv = false
    },
  },
}
</script>

<style></style>
