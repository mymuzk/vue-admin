import request from '@/utils/request'

/**
 * 获取卡片列表
 */
export function getCardListAPI(params) {
  return request.get('/parking/card/list', { params })
}

/**
 * 添加月卡
 */

export function addCardAPI(data) {
  return request.post('/parking/card', data)
}

/**
 * 通过id获取月卡详情
 */

export function getCardDetailAPI(id) {
  return request.get(`/parking/card/detail/${id}`)
}

/**
 * 编辑月卡
 */

export function editCardAPI(params) {
  return request.put('/parking/card/edit', params)
}

/**
 * 删除月卡
 */

export function delCardAPI(ids) {
  return request.delete(`/parking/card/${ids}`)
}
