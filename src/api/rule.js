import request from '@/utils/request'

/**
 *
 * 查看计费规则列表
 */

export function getRuleListAPI(params) {
  return request.get('/parking/rule/list', { params })
}

/**
 * 创建规则
 * @returns
 */
export function createRuleAPI(data) {
  return request({
    url: '/parking/rule',
    method: 'POST',
    data
  })
}

/**
 * 提交编辑规则
 * @returns
 */

export function editRuleAPI(params) {
  return request.put('/parking/rule', params)
}

/**
 * 获取计费规则详情
 * @export
 * @param {*} id
 * @return {*}
 */
export function getParkingRuleAPI(id) {
  return request({
    url: `/parking/rule/${id}`
  })
}

/**
 * 删除规则
 * @export
 * @param {*} id
 * @return {*}
 */
export function deleteRuleAPI(id) {
  return request({
    url: `/parking/rule/${id}`,
    method: 'DELETE'
  })
}
