import request from '@/utils/request'

/**
 * 获取企业列表
 */

export function getEnterpriseListAPI(params) {
  return request.get('/park/enterprise', { params })
}

/**
 * 删除企业按钮
 */

export function delEnterpriseAPI(id) {
  return request.delete(`/park/enterprise/${id}`)
}

/**
 *
 * 查询企业所属行业列表
 */

export function getEnterpriseIndustryListAPI() {
  return request.get('/park/industry')
}

/**
 * 增加企业按钮
 */

export function addEnterpriseAPI(data) {
  return request.post('/park/enterprise', data)
}

/**
 * 查看企业详情进行回显
 */

export function getEnterpriseInfoAPI(id) {
  return request.get(`/park/enterprise/${id}`)
}

/**
 * 编辑企业按钮
 */

export function editEnterpriseAPI(data) {
  return request.put('/park/enterprise', data)
}

/**
 * 查询可租赁的楼宇列表
 */

export function getRentBuildingAPI() {
  return request.get('/park/rent/building')
}

/**
 *
 * 添加/续租企业的租赁合同
 */

export function addEnterpriseRentAPI(data) {
  return request.post('/park/enterprise/rent', data)
}

/**
 *
 * 获取添加/续租企业的租赁合同
 */

export function getEnterpriseRentBuildingAPI(id) {
  return request.get(`/park/enterprise/rent/${id}`)
}

/**
 * 退租接口
 */

export function outRentAPI(type, id) {
  // return request.put(`/park/enterprise/rent/${id}`)
  return request({
    url: `/park/enterprise/rent/${id}`,
    method: `${type}`
  })
}
