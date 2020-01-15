import Browser from '@/modules/Browser/Browser';
import Magic from '@/content_scripts/Magic';

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

  getStreams() {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', this.data.source);
      xhr.setRequestHeader('X-Webextension', true);

      xhr.onload = event => {
        let data = xhr.responseText.replace(/^[^\(]+\(/, '').replace(/\);?$/, '');

        let jsonData = JSON.parse(data);

        let streams = [];

        if (jsonData && jsonData.code === 200) {
          if (jsonData.data && jsonData.data.stream && jsonData.data.stream_domain) {
            jsonData.data.stream.forEach(stream => {
              let channel = {
                type: stream.name,
                urls: []
              }

              jsonData.data.stream_domain.forEach(domain => {
                channel.urls.push(domain + stream.url)
              });

              streams.push(channel);
            });

            resolve(streams);
          } else {
            reject(Error('Invalid response data'));
          }
        } else {
          reject(Error('Request error'));
        }
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
      return this.getDownloadUrls(streams);
    })
    .catch(error => {
      this.dispatchError(error);
    });
  }
}

export default Adapter;
