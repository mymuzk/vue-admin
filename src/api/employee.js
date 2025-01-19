import request from '@/utils/request'

/**
 * 获取员工列表
 * @param { page, pageSize, name} params
 * @returns
 */
export function getEmployeeListAPI(params) {
  return request({
    url: '/park/sys/user',
    params
  })
}

/**
 * 添加员工
 * @returns
 */
export function createEmployeeAPI(data) {
  return request({
    url: `/park/sys/user`,
    method: 'POST',
    data
  })
}

// 删除员工
export function delUserAPI(id) {
  return request.delete(`/park/sys/user/${id}`)
}

// 获取员工详情

export function getUserDetailAPI(id) {
  return request.get(`/park/sys/user/${id}`)
}
// 提交编辑员工

export function editUserAPI(data) {
  return request.put(`/park/sys/user`, data)
}

// 重置员工密码为123456

export function resetUserPwdAPI(id) {
  return request.put('/park/sys/user/resetPwd', { id })
}
