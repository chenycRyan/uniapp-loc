<template>
  <view class="page">
    <u--image src="../../static/img/about1.png" width="100%" mode="widthFix"></u--image>
    <view class="about-box">
      <view class="mt-10 content"> {{ content.desc1 }}</view>
      <view class="mt-10 content"> {{ content.desc2 }}</view>
      <view class="title">工业领域</view>
      <view class="content"> {{ content.desc3 }}</view>
      <view class="title"> 教育领域</view>
      <view class="content"> {{ content.desc4 }}</view>
      <view class="title"> 汇博荣誉</view>
      <u--image src="../../static/img/about2.png" width="100%" mode="widthFix"></u--image>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      content: {
        desc1: `江苏汇博机器人技术股份有限公司（简称汇博机器人）是专门从事机器人及智能制造技术研发与应用，工业机器人、智能制造、人工智能等相关专业应用型技术技能人才培养的国家级高新 技术企业。在全国布局江苏（苏州）、广东（佛山）、天津三大运营基地及杭州研发中心。汇博机器人采取“工业与教育双轮驱动，工业装备、教育服务与人才培养三位一体”的发展模式，将工业应用与教学实训、人才培养紧密结合，相互融通，实现产教协同发展。`,
        desc2: `汇博机器人被授予工信部中国机器人综合实力TOP100、科技部国家创新人才推荐计划重点领域创新团队、工信部专心特新“小巨人”企业、1+X证书制度实施、全国机械行业先进制造领域产教融合骨干企业等荣誉。`,
        desc3: `在教育领域，汇博机器人专注于工业机器人与智能制造系统研发，是国内领先的陶瓷卫浴、通信、五金制造等行业智能制造整体解决方案供应商，以先进的自动化技术水平助力企业快速成长，凭借其特有的产品研发优势、硬核的技术壁垒、多年的方案实施经验，成为了国内领先的工业机器人整体解决方案领军企业`,
        desc4: `在教育领域，汇博机器人基于智能制造和人工智能领域的技术优势，积极投身到工业机器人、智能制造、人工智能等新兴专业建设和人才培养中，为技工/技师、中职、高职、本科等各层次人才培养提供一体化解决方案。深度参与国家相关专业教学标准制定、新职业开发、国家教学资源库建设、国家学分银行项目开发、国家技能竞赛实施等。以人工智能、大数据、物联网技术等，构建智能终端、智能装备、智慧系统，实现智慧教学、智能管理、智慧育人，助力教学改革与发展。先后获批教育部全国首批职业教育教师企业实践基地、全国首批职业教育校企深度合作项目承担企业、教育部产学合作协同育人项目支持企业、国家级高技能人才培训基地建设单位、江苏省产教融合型试点企业、江苏省高技能人才公共培训基地等。`,
      },
    }
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.about-box {
  line-height: 28px;
  padding: 20rpx 40rpx;
  .title {
    color: #de6601;
    font-weight: bold;
    font-size: 40rpx;
    line-height: 32px;
    margin-top: 20rpx;
  }
  .content {
    text-indent: 50rpx;
  }
}
</style>
