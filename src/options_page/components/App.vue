<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import Vue from 'vue';
import manifest from '@@/../statics/manifest.json';
import SuperMixin from '@/mixins/SuperMixin';

export default {
  name: 'App',

  mixins: [
    SuperMixin
  ],

  data () {
    return {
      //
    }
  },

  beforeMount() {
    this.pushRoute({
      name: 'download'
    });
  },

  methods: {
    //
  }
}
</script>

<style lang="scss">
$primary-blue-color: #3367d6;
$primary-blue-text-color: #fff;
</style>
