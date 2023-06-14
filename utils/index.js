// 格式化时间
export const formateDate = (datetime, type) => {
  var year = datetime.getFullYear(),
    month = ('0' + (datetime.getMonth() + 1)).slice(-2),
    date = ('0' + datetime.getDate()).slice(-2),
    hour = ('0' + datetime.getHours()).slice(-2),
    minute = ('0' + datetime.getMinutes()).slice(-2),
    second = ('0' + datetime.getSeconds()).slice(-2)
  if (type === 'Y-M-D h:min:s') {
    var result = year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second
  } else if (type === 'Y-M-D h:min') {
    var result = year + '-' + month + '-' + date + ' ' + hour + ':' + minute
  } else if (type === 'Y-M-D') {
    var result = year + '-' + month + '-' + date
  } else if (type === 'h:min:s') {
    var result = hour + ':' + minute + ':' + second
  } else if (type === 'h:min') {
    var result = hour + ':' + minute
  }
  return result
}

export const numberUnitFormat = (num) => {
  return Math.floor(Number(num) / 10000)
}

export const numberRateFormat = (num) => {
  return Math.floor(Number(num) * 100)
}

export const getMapDistance = ({ lng1, lat1, lng2, lat2 }) => {
  var radLat1 = (lat1 * Math.PI) / 180.0
  var radLat2 = (lat2 * Math.PI) / 180.0
  var a = radLat1 - radLat2
  var b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)))
  s = s * 6378.137 // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000

  s = s * 1000

  if (isNaN(s)) {
    return 0
  }
  return s
}
