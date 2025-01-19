import router from '@/router'
import store from './store'
// 配置不需要token的路径
const toPash = ['/login', '/404']
// 全局前置守卫
// eslint-disable-next-line space-before-function-paren
router.beforeEach(async (to, from, next) => {
  // ...
  // next()
  const token = store.state.user.token
  // 没有token
  if (!token) {
    if (toPash.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
    return
  } else {
    // 有token
    if (to.path === '/login') {
      next('/')
    } else {
      next()
      const res = await store.dispatch('menu/getProfile')
      console.log(11112, res)
    }
  }
  // next()
})
