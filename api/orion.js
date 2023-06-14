import request from '@/utils/request'
/**
 * 获取用户信息
 * @param {*} params
 * @returns
 */

export function getAuth(data) {
  return request.get('/orion/users/common/auth-info', data)
}
