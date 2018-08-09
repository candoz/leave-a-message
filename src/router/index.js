import Vue from 'vue'
import Router from 'vue-router'
import LookAround from '@/components/LookAround'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'LookAround',
      component: LookAround
    }
  ]
})
