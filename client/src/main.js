import Vue from 'vue'
import App from './App.vue'
import router from './router'

// ant design
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import { Button } from 'ant-design-vue';

Vue.config.productionTip = false

Vue.use(Antd)
Vue.use(Button);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
