import { createApp } from "vue"
import App from "./App.vue"
import router from "./routers"
import vuetify from "./plugins/vuetify"
import { settingService } from "./utils/settingService"

settingService.applyTheme()
settingService.initThemeWatcher()

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.mount("#app")