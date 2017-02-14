import Vue from 'vue'
import Router from 'vue-router'
import VSphere from 'components/VSphere'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'VSphere',
      component: VSphere
    }
  ]
})
