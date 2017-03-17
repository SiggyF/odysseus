// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Vuetify from 'vuetify';
import VSphere from 'components/VSphere.vue';
import VSphereControls from 'components/VSphereControls.vue';
import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons/iconfont/material-icons.css';
import 'roboto-fontface/css/roboto/sass/roboto-fontface.scss';
import 'styles/main.scss';

Vue.use(Vuetify);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  data() {
    return {
      nav2: false
    };
  },
  components: {
    'v-sphere': VSphere,
    'v-sphere-controls': VSphereControls
  }
});
