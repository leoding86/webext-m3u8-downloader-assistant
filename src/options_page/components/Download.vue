<template>
  <div id="page-download app-page">
    <div>Download</div>
    <div><input type="text" v-model="resourceUrl"></div>
    <div><button type="button" @click="downloadResource">Download</button></div>
    <div><a :href="url">Download</a></div>
  </div>
</template>

<script>
import M3U8FileParser from 'm3u8-file-parser';
import Browser from '@/modules/Browser/Browser';

export default {
  data() {
    return {
      resourceUrl: null,
      baseUrl: null,
      url: ''
    }
  },

  beforeMount() {
    this.contentArrays = [];
    this.contentType = '';
    this.browser = Browser.getBrowser();
  },

  methods: {
    downloadSegment(url) {
      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', this.appendTime(url));
        xhr.responseType = 'arraybuffer';
        xhr.onload = event => {
          let arrayBuffer = xhr.response;

          if (arrayBuffer) {
            let byteArray = new Uint8Array(arrayBuffer);

            resolve(byteArray);
          } else {
            reject();
          }
        };

        xhr.send();
      });
    },

    downloadSegments(segments, i = 0) {
      let vm = this;

      return new Promise(resolve => {
        if (i === 0) {
          vm.contentArrays = [];
        }

        if (segments.length <= i) {
          resolve();
          return;
        }

        this.downloadSegment(this.baseUrl + segments[i].url).then(byteArray => {
          vm.contentArrays.push(byteArray);

          i++;

          resolve(this.downloadSegments(segments, i));
        });
      });
    },

    /**
     * @param {String} url
     */
    downloadM3U8(url) {
      return new Promise((resolve, reject) => {
        let matches = url.match(/^https?:\/{2}[^?]+/);

        if (!matches) {
          reject(Error('Invalid url'));
          return;
        }

        if (matches[0][matches[0].length - 1] === '/') {
          this.baseUrl = matches[0];
        } else {
          this.baseUrl = matches[0].substring(0, matches[0].lastIndexOf('/')) + '/';
        }

        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = event => {
          resolve(xhr.responseText);
        };

        xhr.ontimeout = event => {
          reject(Error('Timeout'));
        };

        xhr.onerror = event => {
          reject(Error('Error'));
        };

        xhr.onabort = event => {
          reject(Error('Abort'))
        };

        xhr.send();
      });
    },

    downloadResource() {
      let vm = this;

      this.downloadM3U8(this.resourceUrl).then(responseText => {
        let reader = new M3U8FileParser();
        reader.read(responseText);
        const result = reader.getResult();

        return this.downloadSegments(result.segments);
      }).then(() => {
        let len = 0;

        let start = true;

        vm.contentArrays.forEach(typedArray => {
          len += typedArray.length - (start ? 0 : 0);
          start = false;
        });

        let contentArray = new Uint8Array(len);
        let index = 0;
        start = true;

        vm.contentArrays.forEach(typedArray => {
          let i = 0;
          let skip = start ? 0 : 0;

          typedArray.forEach(element => {
            start = false;

            if (i < skip) {
              i++;
              return;
            }

            contentArray[index] = element;
            index++;
          });
        });

        let blob = new Blob([contentArray.buffer], {type: 'video/mp2t'});
        this.url = URL.createObjectURL(blob);
        console.log(this.url);

        this.browser.downloads.download({
          url: this.url
        });
      }).catch(error => {
        //
      });
    },

    appendTime(url) {
      return url + (url.indexOf('?') < 0 ? '?' : '&') + '_t=' + Date.now();
    }
  }
}
</script>
