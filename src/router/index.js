import Vue from 'vue';
import Router from 'vue-router';
import VSphere from 'components/VSphere';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'left',
      component: VSphere,
      props: {
        src: 'static/video/left.mp4'
      }
    },
    {
      path: '/yuv',
      name: 'left-yuv',
      component: VSphere,
      props: {
        src: 'static/video/leftyuv420.mp4'
      }
    }
  ]
});
