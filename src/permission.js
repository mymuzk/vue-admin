/*
 * @Author: mymuzk muzk@qq.com
 * @Date: 2025-01-04 12:30:33
 * @LastEditors: mymuzk muzk@qq.com
 * @LastEditTime: 2025-01-20 20:37:08
 * @FilePath: \vue-admin\src\permission.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import router from '@/router'
import store from './store'
import asyncRouter from '@/router/asyncRouter'
// 配置不需要token的路径
const toPash = ['/login', '/404']
// 全局前置守卫
// 一级菜单权限
function getFirstMenu(permissions) {
  const firstPermArr = permissions.map(item => {
    return item.split(':')[0]
  })
  console.log(firstPermArr)
  return [...new Set(firstPermArr)]
}
// 二级菜单权限
function getSecondPerm(permissions) {
  const secondPermArr = permissions.map(item => {
    const itemArr = item.split(':')
    return `${itemArr[0]}:${itemArr[1]}`
  })
  console.log([...new Set(secondPermArr)])
  return [...new Set(secondPermArr)]
}
// 根据权限获取动态路由数据
function getRoutes(firstPerm, secondPerm, asyncRouter) {
  // 过滤一级菜单
  if (firstPerm.includes('*')) {
    return asyncRouter
  }
  const perm = asyncRouter.filter(item => firstPerm.includes(item.permission))
  // 过滤二级菜单
  perm.forEach(item => {
    item.children = item.children.filter(item => secondPerm.includes(item.permission))
  })
  return perm
}

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
      const permissions = await store.dispatch('menu/getProfile')
      // 一级菜单权限
      const firstPerm = getFirstMenu(permissions)
      console.log('一级菜单权限', firstPerm)
      // 二级菜单权限
      const secondPerm = getSecondPerm(permissions)
      console.log('二级菜单权限', secondPerm)
      const filterRoutes = getRoutes(firstPerm, secondPerm, asyncRouter)
      // 添加动态路由
      filterRoutes.forEach(item => router.addRoute(item))
      store.commit('menu/setMenuList', filterRoutes)
    }
  }
  // next()
})
