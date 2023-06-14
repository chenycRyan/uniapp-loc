<template>
	<view class="content">
		<button type="primary" @click="queryTerminal()">查询终端</button>
		<button type="primary" @click="addTerminal()">创建终端</button>
		<button type="primary" @click="addTrack()">添加轨迹</button>
		<button type="primary" @click="startTrack()">启动上报</button>
		<button type="primary" @click="stopTrack()">停止上报</button>
		<button type="primary" @click="startGather()">开始数据采集</button>
		<button type="primary" @click="stopGather()">停止数据采集</button>
		<button type="primary" @click="queryLatestPoint()">实时数据查询</button>
		<button type="primary" @click="queryHistoryTrack()">查询终端所有轨迹点</button>
		<button type="primary" @click="queryTerminalTrack()">查询终端下属于某个轨迹的轨迹点</button>
	</view>
</template>

<script>
	var track = uni.requireNativePlugin('AMap-Track');
	export default {
		data() {
			return {
				title: 'Hello',
				sid:625697,//268816,//服务id
				tid:479878667,//336765765,//终端id
				termianl:"user123",//终端名称
				trackId:680//20//轨迹id
			}
		},
		onLoad() {
			//初始化
			track.init(this.sid);
			
			//回调事件
			var that = this;
			track.setOnTrackListener(function(res){
				console.log(res);
				//通过res.type判断回调接口名称, res.data为回调参数数据
				if (res.type == "onQueryTerminalCallback") {
					//that.onQueryTerminalCallback(res.data);
				} else if (res.type == "onStartGatherCallback") {
					
				} else if (res.type == "onStartTrackCallback") {
					
				} else if (res.type == "onStopTrackCallback") {
					
				} else if (res.type == "onStopGatherCallback") {
					
				}//更多回调接口参考OnTrackListener和OnTrackLifecycleListener
				//http://a.amap.com/lbs/static/unzip/Android_Track_Doc/com/amap/api/track/query/model/OnTrackListener.html
				//http://a.amap.com/lbs/static/unzip/Android_Track_Doc/com/amap/api/track/OnTrackLifecycleListener.html
			});
			
			//配置定位采集周期和上报周期
			var gatherInterval = 2;//定位信息采集周期,单位s,默认2s
			var packInterval = 20; //上报周期，单位s,默认20s
			track.setInterval(gatherInterval, packInterval);
			
			//配置本地缓存大小20M
			track.setCacheSize(20);
			
			//配置定位模式
			track.setLocationMode(1);//HIGHT_ACCURACY = 1;DEVICE_SENSORS = 2;BATTERY_SAVING = 3;
		},
		methods: {
			onQueryTerminalCallback(data) {
				console.log(data);
			},
			queryTerminal() {
				//创建terminal
				var sid = this.sid;//服务id
				var termianl = this.termianl;//终端
				track.queryTerminal(sid, termianl);
			},
			addTerminal() {
				//创建terminal
				var sid = this.sid;//服务id
				var termianl = this.termianl;//终端
				track.addTerminal(sid, termianl);
			},
			addTrack() {
				//增加轨迹，得到trackId
				var sid = this.sid;//服务id
				var tid = this.tid;//终端id
				track.addTrack(sid, tid);
			},
			startTrack() {
				var sid = this.sid;//服务id
				var tid = this.tid;//终端id
				var trackId = this.trackId;//轨迹id
				track.startTrack(sid, tid, trackId);
			},
			stopTrack() {
				var sid = this.sid;//服务id
				var tid = this.tid;//终端id
				var trackId = this.trackId;//轨迹id
				track.stopTrack(sid, tid, trackId);
			},
			startGather() {
				track.startGather();
			},
			stopGather() {
				track.stopGather();
			},
			queryLatestPoint() {
				var sid = this.sid;//服务id
				var tid = this.tid;//终端id
				var trackId = this.trackId;//轨迹id
				track.queryLatestPoint(sid, tid, trackId, -1, "");
			},
			queryHistoryTrack() {
				var sid = this.sid;//服务id
				var tid = this.tid;//终端id
				var startTime = 1618280003234;
				var endTime = 1618308803123;
				var correction = 0;// 不绑路
				var recoup = 0;// 不做距离补偿
				var gap = 5000;//距离补偿阈值，只有超过5km的点才启用距离补偿
				var order = 0;// 由旧到新排序
				var page = 1;//返回第1页数据
				var pageSize = 100;// 一页不超过100条
				track.queryHistoryTrack(sid, tid, startTime, endTime, correction, recoup, gap, order, page, pageSize, "");
			},
			queryTerminalTrack() {
				var sid = this.sid;//服务id
				var tid = this.tid;//终端id
				var trackId = this.trackId;//轨迹id
				var startTime = 1618280003234;
				var endTime = 1618308803123;
				var denoise = 0;// 不启用去噪
				var mapmatch = 0;// 不绑路
				var threshold = 0;//不进行精度过滤
				var drivemode = 0;/// 当前仅支持驾车模式
				var recoup = 0;// 不做距离补偿
				var gap = 5000;//距离补偿阈值，只有超过5km的点才启用距离补偿
				var ispoints = 1;// 结果应该包含轨迹点信息
				var page = 1;//返回第1页数据
				var pageSize = 100;// 一页不超过100条
				track.queryTerminalTrack(sid, tid, trackId, startTime, endTime, denoise, mapmatch, threshold, drivemode, recoup, gap, ispoints, page, pageSize);
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
