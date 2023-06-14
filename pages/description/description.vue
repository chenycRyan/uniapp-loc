<template>
  <view class="page">
    <about-us v-if="page === 'aboutus'"></about-us>
    <agreement v-if="page === 'agreement'"></agreement>
    <ver-desc v-if="page === 'verdesc'"></ver-desc>
    <work-desc v-if="page === 'workdesc'"></work-desc>
  </view>
</template>

<script>
import AboutUs from './components/aboutus'
import Agreement from './components/agreement'
import VerDesc from './components/verdesc'
import WorkDesc from './components/workdesc'
export default {
  components: { AboutUs, Agreement, VerDesc, WorkDesc },
  data() {
    return {
      page: '',
    }
  },
  onLoad(options) {
    this.page = options.page
    console.log(options)
  },
  methods: {},
}
</script>
