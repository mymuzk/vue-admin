import { registerMicroApps, start } from 'qiankun'

const isDev = process.env.NODE_ENV === 'development'
registerMicroApps([
  {
    name: 'BigScreen', // app name registered
    entry: isDev ? '//localhost:5173' : '//localhost:8089',
    container: '#container',
    activeRule: '/bigscreen'
  }
])

start()
