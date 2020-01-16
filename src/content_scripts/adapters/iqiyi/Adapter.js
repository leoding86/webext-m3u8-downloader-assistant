import Browser from '@/modules/Browser/Browser';
import Magic from '@/content_scripts/Magic';
import md5 from 'md5';
import Cmd5 from './Cmd5';

class Adapter {
  static instance

  constructor() {
    this.data = null;
    this.browser = Browser.getBrowser();
  }

  initialize(options) {
    this.data = options.data;
  }

  static getDefault(options) {
    if (!Adapter.instance) {
      Adapter.instance = new Adapter();
    }

    Adapter.instance.initialize(options);

    return Adapter.instance;
  }

  buildDashUrl(video) {
    let time = Date.now() - 1000;

    let url = this.data.source.replace(/bid=\d+/, `bid=${video.bid}`)
       .replace(/[^t]vid=[a-z\d]+/i, `vid=${video.vid}`)
       .replace(/mt=\d+/, `mt=${time}`)
       .replace(/&vf=[a-z\d]+/i, '')
       .replace(/authKey=[a-z\d]+/i, 'authKey=' + md5(md5('') + time + this.data.aid));

    let signStr = url.replace(/^https?:\/{2}[^/]+/, '');

    url += `&vf=${Cmd5.cmd5x(signStr)}`;
  }

  buildStreamsInfo(videos) {
    let channels = [];

    videos.forEach(video => {
      let stream = {
        type: 'unkown'
      };

      if (video.m3u8 && video.m3u8.length > 0) {
        stream.m3u8 = video.m3u8;
      } else {
        stream.dashUrl = this.buildDashUrl(video);
      }
    });

    debugger;
  }

  getStreams() {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', this.data.source);
      xhr.setRequestHeader('X-Webextension', true);

      xhr.onload = event => {
        let data = xhr.responseText;

        try {
          let jsonData = JSON.parse(data);

          if (jsonData && jsonData.code === 'A00000') {
            this.data.aid = jsonData.data.aid;

            if (jsonData.data && jsonData.data.program && Array.isArray(jsonData.data.program.video)) {
              let streams = this.buildStreamsInfo(jsonData.data.program.video);

              resolve(streams);
            } else {
              reject(Error('Invalid response data'));
            }
          } else {
            reject(Error('Request error'));
          }
        } catch (error) {
          this.dispatchError(error);
        }
      }

      xhr.onerror = event => {
        this.dispatchError(Error('Request error'));
      }

      xhr.send();
    });
  }

  dispatchError() {
    if (typeof this.onerror === 'function') {
      this.onerror.apply(this, arguments);
    }
  }

  dispatchLoad() {
    if (typeof this.onload === 'function') {
      this.onload.apply(this, arguments);
    }
  }

  /**
   * @param {{type: String, urls: Array.<String>}} stream
   */
  getDownloadUrl(stream) {
    let port = this.browser.runtime.connect();

    let context = Magic.getCSvar('window.VIDEOINFO', 'object');

    port.onMessage.addListener(message => {
      try {
        let jsonData = JSON.parse(message.data.responseText);

        if (jsonData && jsonData.status === 'ok') {
          const url = {
            url: jsonData.info,
            title: context.url
          }

          this.dispatchLoad({
            type: stream.type,
            url: 'm3u8-downloader://' + encodeURIComponent(JSON.stringify(url))
          });
        } else {
          this.dispatchError(Error('Invalid response data'));
        }
      } catch (error) {
        this.dispatchError(error);
      } finally {
        port.disconnect();
      }
    });

    port.postMessage({
      action: 'request',
      options: {
        url: stream.urls[0]
      }
    });
  }

  /**
   * @param {Array.<{type: String, urls: Array.<String>}>} streams
   */
  getDownloadUrls(streams) {
    streams.forEach(stream => {
      this.getDownloadUrl(stream);
    });
  }

  fetchDownloadContext() {
    this.getStreams().then(streams => {
      // return this.getDownloadUrls(streams);
    })
    .catch(error => {
      this.dispatchError(error);
    });
  }
}

export default Adapter;
