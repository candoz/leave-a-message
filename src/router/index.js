import Vue from 'vue'
import Router from 'vue-router'
import LookAround from '@/components/LookAround.vue'
import Login from '@/components/Login.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: LookAround
    },
    {
      path: '/login',
      component: Login
    }
  ]
})
