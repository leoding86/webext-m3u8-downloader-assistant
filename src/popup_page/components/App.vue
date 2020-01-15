<template>
  <div id="popup">
    <div class="top-header">
      <h1>M3U8 Downloader</h1>
    </div>
  </div>
</template>

<script>
import SuperMixin from "@/mixins/SuperMixin";

export default {
  mixins: [
    SuperMixin
  ],

  data() {
    return {
      //
    }
  },

  mounted() {
    let self = this;

    /**
     * Fetch the current active tab
     */
    browser.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      //
    });
  },

  methods: {
    //
  }
}
</script>

<style lang="scss">
html, body, div, h1, h2, ul, li {
  margin: 0;
  padding: 0;
}

body {
  background: #f7f7f7;
}

#popup {
  width: 290px;
  margin: auto 20px;
}
</style>
