import Vue from 'vue'
import Browser from '@/modules/Browser/Browser';
import SuperMixin from '@/mixins/SuperMixin';
import router from '@/options_page/router';
import App from '@/options_page/components/App';

Vue.config.productionTip = false;
Vue.mixin(SuperMixin);

try {
  (function(browser) {
    window.browser = browser;

    browser.storage.local.get(null, items => {
      /* eslint-disable no-new */
      new Vue({
        el: '#app',

        router,

        render: h => h(App),

        data() {
          return {
            browserItems: items
          }
        },

        beforeMount() {
          let vm = this;

          browser.storage.onChanged.addListener((items, scope) => {
            for (let key in items) {
              vm.browserItems[key] = items[key].newValue;
            }
          });
        }
      })
    });
  })(Browser.getBrowser());
} catch (e) {
  console.error(e);
}
