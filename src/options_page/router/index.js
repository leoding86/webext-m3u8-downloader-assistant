import Vue from 'vue';
import Router from 'vue-router';
import App from '@/options_page/components/App';
import Download from '@/options_page/components/Download'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'app',
      component: App
    }, {
      path: '/download',
      name: 'download',
      component: Download
    }
  ]
});
