<template>
	<view class="content">
		<button type="primary" @click="loc()">持续定位</button>
		<button type="primary" @click="fence()">地理围栏</button>
		<button type="primary" @click="track()">猎鹰轨迹</button>
	</view>
</template>

<script>
	//插件对象
	var LocTrack = uni.requireNativePlugin('AMap-LocTrack');
	export default {
		data() {
			return {
				title: 'Hello'
			}
		},
		onLoad() {
			//检查定位权限
			LocTrack.checkLocationPermission(function(res){
				console.log(res);
				if (res.result == true) {
					LocTrack.checkAlwaysLocationPermission(function(res2){
						console.log(res2);
					});
				}
			});
		},
		methods: {
			loc(data) {
				uni.navigateTo({
					url:'./loc'
				});
			},
			fence() {
				uni.navigateTo({
					url:'./fence'
				});
			},
			track() {
				uni.navigateTo({
					url:'./track'
				});
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
