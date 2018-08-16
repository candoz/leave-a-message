import Vue from 'vue'
import Router from 'vue-router'
import LookAround from '@/components/LookAround.vue'
import Login from '@/components/Login.vue'
import Profile from '@/components/Profile.vue'
import Write from '@/components/Write.vue'

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
    },
    {
      path: '/profile',
      component: Profile
    },
    {
      path: '/write',
      component: Write
    }
  ]
})
