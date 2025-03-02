/*
 * @Author: mymuzk muzk@qq.com
 * @Date: 2024-12-31 15:23:31
 * @LastEditors: mymuzk muzk@qq.com
 * @LastEditTime: 2025-01-21 20:19:04
 * @FilePath: \vue-admin\src\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Vue from 'vue'
import 'normalize.css/normalize.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'

import store from './store'

import router from './router'

// 启动微前端配置
import '@/registerMicroApp'
// 引入全局指令
import '@/directive'
// 注册svg
import '@/icons'
// 引入 Permission.js
import '@/permission'
Vue.use(ElementUI)

Vue.config.productionTip = false

// vue实例化
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
