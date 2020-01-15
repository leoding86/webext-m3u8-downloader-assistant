import Vue from 'vue';
import App from '@/popup_page/components/App';
import Browser from '@/modules/Browser/Browser';

Vue.config.productionTip = false;

window.browser = Browser.getBrowser();

browser.storage.local.get(null, items => {
  new Vue({
    el: '#app',

    render: h => h(App),

    data() {
      return {
        browserItems: items
      }
    },

    beforeMount() {
      let vm = this;

      browser.storage.onChanged.addListener((items) => {
        for (let key in items) {
          vm.browserItems[key] = items[key].newValue;
        }
      });
    }
  });
});
