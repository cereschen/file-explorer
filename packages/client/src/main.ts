import { createApp } from "vue"
import App from "./app.vue"
import { clickOutside } from "./directives/cllickOutSide"
import { registerIcons } from "./icons"
const app = createApp(App)
registerIcons(app)

app.directive('clickOutside', clickOutside)
app.mount('#app')



