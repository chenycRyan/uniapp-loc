<template>
  <view>
    <button type="primary" @click="addKeywordFence()">根据关键字创建围栏</button>
    <button type="primary" @click="addAroundFence()">根据周边POI创建围栏</button>
    <button type="primary" @click="addDistrictFence()">创建行政区划围栏</button>
    <button type="primary" @click="addCircleFence()">创建圆形围栏</button>
    <button type="primary" @click="addPolygonFence()">创建多边形围栏</button>
    <button type="primary" @click="getAllGeoFence()">获取所有已经创建的地理围栏</button>
    <button type="primary" @click="removeGeoFence()">移除围栏</button>
  </view>
</template>

<script>
//地理围栏插件对象
var fence = uni.requireNativePlugin('AMap-Fence')
export default {
  data() {
    return {}
  },
  onLoad() {
    //初始化围栏
    fence.initFence({
      activateAction: 1, //进入地理围栏GEOFENCE_IN(1) | 退出地理围栏GEOFENCE_OUT(2) | 停留在地理围栏内10分钟GEOFENCE_STAYED(4)
    })

    //设置围栏监听事件
    fence.setGeoFenceListener(function (res) {
      console.log(res)
    })

    //设置触发地理围栏的条件
    var action = 1 | 2 | 4 //进入地理围栏GEOFENCE_IN(1) | 退出地理围栏GEOFENCE_OUT(2) | 停留在地理围栏内10分钟GEOFENCE_STAYED(4)
    fence.setActivateAction(action)
  },
  methods: {
    addKeywordFence() {
      //根据关键字创建围栏
      fence.addGeoFence({
        keyword: '万达广场', //POI关键字
        poiType: '写字楼', //POI类型
        city: '杭州', //POI所在的城市名称
        customId: '000FATE23', //与围栏关联的自有业务Id
      })
    },
    addAroundFence() {
      //根据周边POI创建围栏
      fence.addGeoFence({
        keyword: '江苏汇博机器人技术股份有限公司', //POI关键字
        poiType: '江苏汇博机器人', //POI类型
        point: {
          latitude: 31.318503834565483,
          longitude: 120.79507121232258,
        }, //周边区域中心点的经纬度，以此中心点建立周边地理围栏
        aroundRadius: 3000, //周边半径，0-50000米，默认3000米
        customId: '000FATE22', //与围栏关联的自有业务Id
      })
    },
    addDistrictFence() {
      //创建行政区划围栏
      fence.addGeoFence({
        keyword: '余杭区', //行政区划关键字
        customId: '000FATE23', //与围栏关联的自有业务Id
      })
    },
    addCircleFence() {
      //创建圆形围栏
      fence.addGeoFence({
        point: {
          latitude: 31.318503834565483,
          longitude: 120.79507121232258,
        }, //围栏中心点
        radius: 5000, //要创建的围栏半径 ，半径无限制，单位米
        customId: '000FATE24', //与围栏关联的自有业务Id
      })
    },
    addPolygonFence() {
      //创建多边形围栏
      fence.addGeoFence({
        points: [
          { latitude: 39.992702, longitude: 116.47047 },
          { latitude: 39.994387, longitude: 116.472498 },
          { latitude: 39.994478, longitude: 116.474161 },
          { latitude: 39.993163, longitude: 116.474504 },
          { latitude: 39.991363, longitude: 116.472605 },
        ], //多边形的边界坐标点，最少传3个
        customId: '000FATE23', //与围栏关联的自有业务Id
      })
    },
    getAllGeoFence() {
      //获取所有已经创建的地理围栏
      var geoFences = fence.getAllGeoFence()
      console.log(geoFences)
    },
    removeGeoFence() {
      //移除所有围栏，没有参数，则移除所有围栏
      fence.removeGeoFence({
        //customId:"000FATE23",//根据customId移除围栏
        //fenceId:"1932148002"//根据围栏ID移除围栏
      })
    },
  },
}
</script>

<style></style>
