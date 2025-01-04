import request from '@/utils/request'

/**
 * 获取卡片列表
 */
export function getCardListAPI(params) {
  return request.get('/parking/card/list', { params })
}
