import Vue from 'vue'
import Vuex from 'vuex'

import { account } from './store/account.module';
import { system } from './store/system.module';
import { keepalive } from './store/keepalive.module';

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
  	account,
    system,
    keepalive,
  }
})
