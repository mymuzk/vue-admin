/*
 * @Author: mymuzk muzk@qq.com
 * @Date: 2025-01-18 18:20:38
 * @LastEditors: mymuzk muzk@qq.com
 * @LastEditTime: 2025-01-21 20:23:43
 * @FilePath: \vue-admin\src\store\modules\menu.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: mymuzk muzk@qq.com
 * @Date: 2025-01-18 18:20:38
 * @LastEditors: mymuzk muzk@qq.com
 * @LastEditTime: 2025-01-20 20:19:43
 * @FilePath: \vue-admin\src\store\modules\menu.js
 * @Description: store 菜单相关
 */
import { routes, resetRouter } from '@/router'
import { getProfileAPI } from '@/api/user'
export default {
  namespaced: true,
  state() {
    return {
      // 用户权限数据
      profile: {},
      // 路由规则
      menuList: []
    }
  },
  mutations: {
    // 设置用户权限数据
    setProfile(state, data) {
      state.profile = data
    },
    // 设置路由规则
    setMenuList(state, asyncRoutes) {
      state.menuList = [...routes, ...asyncRoutes]
    },
    // 清空路由规则
    clearMenuList(state) {
      state.menuList = []
      resetRouter()
    }
  },
  actions: {
    async getProfile(store) {
      const res = await getProfileAPI()
      store.commit('setProfile', res.data.permissions)
      return res.data.permissions
    }
  },
  getters: {}

}
