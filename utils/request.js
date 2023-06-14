import { baseUrl } from '@/config/network.js'
function setRequest(url, method, data) {
  let header = { 'content-type': 'application/json' }

  //白名单--后端未处理Bearer
  const noAuthList = [
    '/orion/users/common/marketing/phone/login',
    '/orion/users/common/phone-code/password',
    '/andromeda/msgs/verify-code',
    '/orion/users/common/phone/code/login',
    '/orion/users/common/check-phone',
  ]
  if (!noAuthList.includes(url)) {
    let curPage = getCurrentPages()
    let route = curPage.length ? curPage[curPage.length - 1].route : '' //获取当前页面的路由
    if (!uni.getStorageSync('USER_TOKEN')) {
      if (route && route !== 'pages/login/login') {
        uni.navigateTo({ url: '/pages/login/login' })
      }

      return
    }
    if (uni.getStorageSync('USER_TOKEN')) header['Authorization'] = 'Bearer ' + uni.getStorageSync('USER_TOKEN')
  }

  const promise = new Promise((resolve, reject) => {
    uni.request({
      url: baseUrl + url,
      data,
      method,
      dataType: 'json',
      header,
      success: function (res) {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          uni.hideLoading()
          reject(res.data)

          let errMessage = typeof res.data === 'string' && res.data.length < 30 ? res.data : `服务器异常，错误代码:${res.statusCode}！`
          console.log(url, res.statusCode, 'res.statusCode')
          const pages = getCurrentPages()
          const route = pages.length ? pages[0].route : ''

          switch (res.statusCode) {
            case 401:
              uni.showToast({
                icon: 'none',
                title: '用户信息失效，请重新登录！',
                complete: () => {
                  uni.removeStorageSync('USER_TOKEN')
                  uni.removeStorageSync('ORION_USER_INFO')
                },
              })
              console.log(route, 'route')
              if (route !== 'pages/login/login') {
                uni.navigateTo({ url: '/pages/login/login' })
              }

              break
            case 403:
              uni.showToast({
                icon: 'none',
                title: '用户信息失效，请重新登录！',
                complete: () => {
                  uni.removeStorageSync('USER_TOKEN')
                  uni.removeStorageSync('ORION_USER_INFO')
                },
              })

              if (route !== 'pages/login/login') {
                uni.navigateTo({ url: '/pages/login/login' })
              }
              break
            default:
              uni.showToast({
                icon: 'none',
                title: errMessage,
              })
          }
        }
      },
      fail: function (err) {
        reject(err),
          uni.showToast({
            icon: 'none',
            title: '网络出错,连接失败！',
          })
      },
    })
  })
  return promise
}

function getRequest(url, data) {
  return setRequest(url, 'GET', data)
}

function postRequest(url, data) {
  return setRequest(url, 'POST', data)
}

function putRequest(url, data) {
  return setRequest(url, 'PUT', data)
}

function deleteRequest(url, data) {
  return setRequest(url, 'DELETE', data)
}

module.exports = {
  get: getRequest,
  post: postRequest,
  put: putRequest,
  delete: deleteRequest,
}
