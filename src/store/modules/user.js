import { loginAPI } from '@/api/user'
import { setToken, getToken, removeToken } from '@/utils/auth'

export default {
  namespaced: true,
  state() {
    return {
      token: getToken() || ''
    }
  },
  mutations: {
    setToken(state, newToken) {
      state.token = newToken
      setToken(newToken)
    },
    removeToken(state) {
      state.token = ''
      removeToken()
    }
  },
  actions: {
    async getTokenInfo(store, data) {
      const res = await loginAPI(data)
      console.log(res)
      store.commit('setToken', res.data.token)
    }
  }
}
