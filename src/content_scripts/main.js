import Vue from 'vue';
import App from './components/App';
import Browser from '@/modules/Browser/Browser';
import SuperMixin from '@/mixins/SuperMixin';

(self => {
  /**
   * Create app mount point
   */
  const mountId = 'm3u8-app';

  let appEl = document.createElement('div');
  appEl.id = mountId;

  document.body.appendChild(appEl);

  /**
   * Configurate Vue
   */
  Vue.prototype.$browser = self.browser = Browser.getBrowser();
  Vue.mixin(SuperMixin);

  new Vue({
    el: '#' + mountId,

    render: h => h(App),

    data() {
      return {
        rootInitialized: false,
        rootBrowserItems: {}
      }
    },

    beforeMount() {
      this.initialize();

      browser.storage.local.get(null, items => {
        this.rootBrowserItems = items;
        this.rootInitialized = true;
      });
    }
  });
})(window || self);
