import router from '@/router'
import store from './store'
// 配置不需要token的路径
const toPash = ['/login', '/404']
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // ...
  // next()
  const token = store.state.user.token
  if (!token) {
    if (toPash.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
    return
  } else {
    if (to.path === '/login') {
      next('/')
    } else {
      next()
    }
  }
  // next()
})
