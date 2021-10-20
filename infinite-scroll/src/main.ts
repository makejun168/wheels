import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './registerServiceWorker';
import { Performance } from './lib/performance'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
  mixins: [Performance.record(router)]
}).$mount('#app')
