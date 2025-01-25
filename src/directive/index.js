// 放置全局指令
import Vue from 'vue'
import store from '@/store'
Vue.directive('perm', {
  inserted(el, building) {
    const profile = store.state.menu.profile
    if (profile[0] === '*:*:*') return
    if (!profile.includes(building.value)) el.remove()
    // building.value.includes(profile)
  }
})
