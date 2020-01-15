export default {
  computed: {
    initialized() {
      return this.$root.rootInitialized;
    },

    browserItems() {
      return this.$root.rootBrowserItems;
    }
  },

  methods: {
    initialize() {
      if (this['onRuntimeMessage'] && typeof this['onRuntimeMessage'] === 'function') {
        browser.runtime.onMessage.addListener(this['onRuntimeMessage'].bind(this));
      }
    },

    tl(string) {
      return browser.i18n.getMessage(string);
    },

    stripTags(content, replace = ' ') {
      if (typeof content !== 'string') {
        return content;
      }

      return content.replace(/<\/?[^>]+(>|$)/g, replace.repeat(2)).trim();
    },

    pushRoute(args) {
      return this.$router.push(args).then(() => {
        return Promise.resolve();
      }).catch(error => {
        if (error.name === 'NavigationDuplicated') {
          // ignore
          return;
        }

        return Promise.reject(error);
      });
    }
  }
}
