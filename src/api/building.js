import request from '@/utils/request'

// 获取楼宇列表
// params { page, pageSize, name }
export function getBuildingListAPI(params) {
  return request.get('/park/building', { params })
}

// 新增楼宇&编辑楼宇

export function addBuildingAPI(data, requestType) {
  // return request.post('/park/building', data)
  return request({
    url: '/park/building',
    method: requestType,
    data
  })
}

// 楼宇详情查询

export function getBuildingInfoAPI(id) {
  return request.get(`/park/building/${id}`)
}

// 编辑楼宇
export function editBuildingAPI(data) {
  return request.put('/park/building', data)
}

// 删除楼宇
export function delBuildingAPI(id) {
  return request.delete(`/park/building/${id}`)
}
