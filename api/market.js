import request from '@/utils/request'

/**
 * 用户登录
 * @param {*} data
 * @returns
 */
export function login(data) {
  return request.post('/orion/users/common/marketing/phone/login', data)
}
/**
 * 短信登录
 * @param {*} data
 * @returns
 */
export function loginByCode(data) {
  return request.post('/orion/users/common/phone/code/login', data)
}
/**
 * 检查手机号是否存在
 * @param {*} data
 * @returns
 */
export function checkPhone(data) {
  return request.get('/orion/users/common/check-phone', data)
}

/**
 * @returns
 */
export function getInfo() {
  return request.get('/orion/users/common/auth-info')
}
/**
 * 分配角色
 * @param {Object} params
 */

export function allotRoles(userId, params) {
  return request.put(`/orion/users/admin/${userId}/roles`, params)
}

/**
 * 登录日志
 * @param {Object} params
 */

export function getloginlogs(params) {
  return request.get('/orion/loginlog/page', params)
}
/**
 * (列表)查询所有运营中心及其下省份
 *
 * @export getAllCity
 * @param {*}
 * @returns
 */
export function getAllCity(params) {
  return request.get('/marketing/operation/query', params)
}

/**
 * (列表)查询指定时间内的市场占有率
 *
 * @export getMarket
 * @param {*}
 * @returns
 */
export function getMarket(params) {
  return request.get('/marketing/market-share/list', params)
}

/**
 * 按照本科、专科、高职等分类查询完成总量
 * @param {*} params
 * @returns
 */
export function getAssort(params) {
  return request.get('/marketing/complete/get-assort-order', params)
}

/**
 * 月度投标分析(整合)
 * @param {*} params
 * @returns
 */
export function getMonthBid(params) {
  return request.get('/marketing/complete/month-bid', params)
}

/**
 * 排名接口
 * @param {*} params
 * @returns
 */
export function getRank(params) {
  return request.get('/marketing/sale-target/query-sort', params)
}

/**
 * 查询用户待处理事项
 * @param {*} params
 * @returns
 */
export function getUserEvents(params) {
  return request.get('/marketing/complete/query-pending', params)
}

/**
 * 获取用户信息
 * @param {*} params
 * @returns
 */
export function getUserInfo(phone) {
  return request.get(`/marketing/location/user-info/${phone}`)
}

/**
 * 获取用户信息
 * @param {*} params
 * @returns
 */
export function getUserByName(name) {
  return request.get(`/marketing/location/user-info-name/${name}`)
}

/**
 * 获取位置列表
 * @param {*} params
 * @returns
 */
export function getLocation(params) {
  return request.get('/marketing/location/query', params)
}
/**
 * 查询全国、各运营中心、省份、个人的客户拜访分析-
 * @param {*} params
 * @returns
 */
export function getCustomVisit(params) {
  return request.get('/marketing/location/custom-visit', params)
}
/**
 * 查询全国、各运营中心、省份、个人的客户总数
 * @param {*} params
 * @returns
 */
export function getCustomTotal(params) {
  return request.get('/marketing/location/custom-query', params)
}
/**
 * 查询全国、各运营中心、省份、个人的新增客户总数
 * @param {*} params
 * @returns
 */
export function getAddSchool(params) {
  return request.get('/marketing/location/add-school-query', params)
}

/**
 * 查询当前在线人及离线人员Currently online
 * @param {*} params
 * @returns
 */
export function getCurrentOnline(params) {
  //  /location/current-online
  return request.get('/marketing/location/return-redis-onoffline', params)
}

/**
 * 查询所有人员考勤（除早退）
 * @param {*} params
 * @returns
 */
export function getAllAttendance(params) {
  return request.get('/marketing/location/query-attendance', params)
}

/**
 * 查询单个人员考勤
 * @param {*} params
 * @returns
 */
export function getPersonAttendance(params) {
  return request.get('/marketing/location/query-card', params)
}

/**
 * 查询早退人员
 * @param {*} params
 * @returns
 */
export function getLeaveEarly(params) {
  return request.get('/marketing/location/query-leave-early', params)
}

/**
 * 查询全国、各运营中心及省份的 在线/离线 轨迹分析
 * @param {*} params
 * @returns
 */
export function getLocationAnalyze(params) {
  return request.get('/marketing/location/online-location-analyze', params)
}
/**
 * 查询全国、各运营中心及省份的设备
 * @param {*} params
 * @returns
 */
export function getEquipment(params) {
  return request.get('/marketing/complete/equipment', params)
}

/**
 * 获取用户实时位置列表
 * @param {Object} params
 */
export function getUserLocation(params) {
  return request.get('/marketing/location/query', params)
}

/**
 * 上报位置
 * @param {Object} data
 */
export function addUserLocation(data) {
  return request.post('/marketing/location/', data)
}

/**
 * 通过手机号查询关联学校
 * @param {Object} phone
 * @param {Object} params
 */
export function getUserSchools(phone, params) {
  return request.get(`/marketing/location/custom-location/${phone}`, params)
}

/**
 * 项目状态
 * @param {*} phone
 * @returns
 */
export function getProjectStatus(phone) {
  return request.get(`/marketing/person/get-project-status/${phone}`)
}

/**
 * 个人项目状态
 * @param {*} phone
 * @returns
 */
export function getPersonProjects(params) {
  return request.get('/marketing/person/get-person-project', params)
}
/**
 * 个人项目状态
 * @param {*} phone
 * @returns
 */
export function modifyPersonInfo(params) {
  return request.post('/marketing/person/update-user-phone-info', params)
}

/**
 * 产品构成
 * @param {Object} params
 */
export function getProjectComposition(params) {
  return request.get('/marketing/person/sales-composition', params)
}

/**
 * 获取业绩环比
 * @param {*} params
 * @returns
 */
export function getAchievement(params) {
  return request.get('/marketing/complete/mom-info', params)
}
/**
 * 问题上报
 * @param {Object} params
 */
export function submitIssue(data) {
  return request.post('/marketing/complete/add-pending', data)
}

/**

 * 意见上报
 * @param {Object} params
 */

export function submitAdvice(data) {
  return request.post('/marketing/issue-feedback/', data)
}
/**
 * 发送短信
 * @param {Object} params
 */

export function sendMsg(data) {
  return request.post('/andromeda/msgs/verify-code', data)
}
/**
 * 通过短信修改密码
 * @param {Object} params
 */

export function changePasswordByMsg(data) {
  return request.put('/orion/users/common/phone-code/password', data)
}

/**
 * 修改密码
 * @param {Object} params
 */

export function changePassword(userId, data) {
  return request.put(`/orion/users/common/${userId}/password`, data)
}

/**
 * 获取地图用户轨迹
 * @param {Object} params
 */

export function getPersonLocation(phone, params) {
  return request.get(`/marketing/location/person-location/${phone}`, params)
}
/**
 * 获取参数配置
 * @param {Object} params
 */

export function getParamConfig(params) {
  return request.get('/marketing/param/query', params)
}
/**
 * 修改配置
 * @param {Object} params
 */

export function modifyConfig(params) {
  return request.post('/marketing/param/', params)
}

/**
 * 登录日志
 * @param {Object} params
 */

export function getNewVersion(params) {
  return request.get('/marketing/person/get-new-version', params)
}

/**
 * 获取销售经理
 * @param {Object} params
 */

export function getSaleManage(params) {
  return request.get('/orion/users/common/roles/SaleManage', params)
}
/**
 * 查询banner文件
 * @param {*} params
 * @returns
 */

export function getBannerImg() {
  return request.get('/marketing/app-file/query')
}

/**
 * 查询在线时长
 * @param {*} params
 * @returns
 */

export function getDuration(params) {
  return request.get('/marketing/location/query-check_time', params)
}

/**
 * 查询操作记录
 * @param {*} params
 * @returns
 */

export function getActionlog(params) {
  return request.get('/marketing/app-open-log/query', params)
}

/**
 * 新增操作记录
 * @param {*} params
 * @returns
 */

export function addActionLog(data) {
  return request.post('/marketing/app-open-log/', data)
}
/**
 * 获取省区下面的人
 * @param {*} params
 * @returns
 */

export function getProvPeople(data) {
  return request.post('/marketing/people/query-subordinate', data)
}
/**
 * 获取订单额
 * @param {*} params
 * @returns
 */

export function getCompleteOrder(data) {
  return request.get('/marketing/complete/query-order', data)
}
/**
 * 获取订单额
 * @param {*} params
 * @returns
 */

export function getCompleteOrderDtl(data) {
  return request.get('/marketing/complete/query-order-detail', data)
}
/**
 * 设置在线redis
 * @param {*} params
 * @returns
 */

export function setRedisOnline(phone) {
  return request.get(`/marketing/location/redis-store/${phone}`)
}
