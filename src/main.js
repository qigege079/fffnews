import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import App from './App.vue'
import store from './store'
import router from './router'
import VueAMap from "vue-amap"
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import echarts from './assets/js/echarts.min.js'

import { tokenAvailable, getToken, setToken } from './services/user.service';
import DetailForm from './assets/form-making/DetailForm'

Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(VueAMap)
Vue.use(ElementUI)

Vue.prototype.$globalEventBus = new Vue();

axios.interceptors.request.use(
  config => {
    if(tokenAvailable()) {
      config.headers.Authorization = getToken();
    }

    config.headers["System-Id"] = store.state.system.systemId;      
    
    return config;
  },
  err => Promise.reject(err)
);

axios.interceptors.response.use(
  res => {
    if(res && res.headers && res.headers.authorization) {
      setToken(res.headers.authorization);
    }

    if(res && res.data && res.data.error_code && (res.data.error_code !== 'OK')) {
      return Promise.reject(res.data.error_msg);
    }

    return res;
  },
  err => {});

//全局注册表单组件
Vue.component('detail-form', DetailForm)

VueAMap.initAMapApiLoader({
  key: "e1dedc6bdd765d46693986ff7ff969f4",
  plugin: [
    "AMap.Autocomplete",
    "AMap.PlaceSearch",
    "AMap.Geolocation",
    "AMap.Geocoder",
  ],
  uiVersion: "1.0"
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
