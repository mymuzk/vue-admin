import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'
console.log(process.env.VUE_APP_BASE_URL)
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API,
  // baseURL: 'https://api-hmzs.itheima.net/v1',
  baseURL: process.env.VUE_APP_BASE_URL,
  timeout: 9000 // request timeout
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const token = store.state.user.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    // Message.error(error)
    // console.dir(error)

    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    if (response.data.code === 50000) {
      Message.error(response.data.msg)
      return Promise.reject(response.data)
    }
    return response.data
  },
  error => {
    // 判断token是否过期
    if (error.response.status === 401) {
      store.commit('user/removeToken')
      router.push('/login')
    }
    // 错误弹出提示消息
    Message.error(error.response.data.msg)
    return Promise.reject(error)
  }
)

export default service
