import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { setupVeeValidate } from './utils/vee-validate-config'
import router from './router'
import './index.css'
import App from './App.vue'

// VeeValidateのグローバル設定
setupVeeValidate()

// typescript-eslint は .vue import の完全な型情報を得られずフォールバック型になるため誤検出になる
// (allowComponentTypeUnsafety: false の既知の制限。型検査は vue-tsc 側で担保される)
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
