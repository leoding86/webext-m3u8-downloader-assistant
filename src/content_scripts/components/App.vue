<template>
  <div class="m3u8-app" v-show="initialized">
    <div class="app__container">
      <div v-for="item in context"
        :key="item.url"
      >
        <a
          @click="copy(item.url)"
          @click.native.prevent="true"
          @click.native.stop="true"
        >{{ item.type }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import AdapterFactory from '@/content_scripts/AdapterFactory';
import CopyStr from '@/modules/Util/CopyStr';

export default {
  data() {
    return {
      context: []
    };
  },

  beforeMount() {
    this.initialize();
  },

  mounted() {
    //
  },

  methods: {
    copy(str) {
      CopyStr.copy(str);
    },

    onRuntimeMessage(message, sender) {
      /**
       * Initialize context
       */
      this.context = [];

      if (message.status === 1) {
        try {
          let adapter = AdapterFactory.getAdatper(message.data);

          adapter.onload = (context) => {
            this.context.push(context);
          };

          adapter.onerror = (error) => {
            console.error(error);
          };

          adapter.fetchDownloadContext();
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
};
</script>

<style lang="scss">
.m3u8-app {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 0;
  height: 0;
  overflow: visible;
  z-index: 999;
}

.app__container {
  padding: 10px;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100px;
  background: #fff;
}
</style>
