import { getProfileAPI } from '@/api/user'
export default {
  namespaced: true,
  state() {
    return {
      profile: {}
    }
  },
  mutations: {
    setProfile(state, data) {
      state.profile = data
    }
  },
  actions: {
    async getProfile(ctx) {
      const res = await getProfileAPI()
      console.log(1121, res)
      ctx.commit('setProfile', res.data)
      return res.data.permissions
    }
  },
  getters: {}

}
