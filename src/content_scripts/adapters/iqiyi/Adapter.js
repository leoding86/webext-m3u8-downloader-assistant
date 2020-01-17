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
       .replace(/&vid=[a-z\d]+/i, `&vid=${video.vid}`)
       .replace(/mt=\d+/, `mt=${time}`)
       .replace(/&vf=[a-z\d]+/i, '')
       .replace(/authKey=[a-z\d]+/i, 'authKey=' + md5(md5('') + time + this.data.aid));

    let signStr = url.replace(/^https?:\/{2}[^/]+/, '');

    url += `&vf=${Cmd5.cmd5x(signStr)}`;

    return url;
  }

  getVideoInfo(video) {
    return new Promise((resolve, reject) => {
      let dashUrl = this.buildDashUrl(video);

      let xhr = new XMLHttpRequest();
      xhr.open('GET', dashUrl);
      xhr.setRequestHeader('X-Webextension', true);
      xhr.onload = event => {
        try {
          let responseJson = JSON.parse(xhr.responseText);

          if (responseJson && responseJson.code === 'A00000' && responseJson.data && responseJson.data.program && Array.isArray(responseJson.data.program.video)) {
            responseJson.data.program.video.forEach(v => {
              if (v.vid === video.vid) {
                resolve(v);
              } else {
                return;
              }
            });
          }
        } catch (e) {
          reject(e);
        }
      };

      xhr.onerror = event => {
        reject(Error('Request error'));
      };

      xhr.ontimeout = event => {
        reject(Error('Request timeout'));
      };

      xhr.send(null);
    });
  }

  buildStreamsInfo(videos) {
    return new Promise((resolve, reject) => {
      let channels = [];
      let waitCount = 0;

      videos.forEach(video => {
        let stream = {
          type: 'unkown',
          size: video.vsize
        };

        if (video.m3u8 && video.m3u8.length > 0) {
          stream.type = video.scrsz;
          stream.m3u8 = video.m3u8;
        } else {
          waitCount++;

          this.getVideoInfo(video).then(data => {
            stream.m3u8 = data.m3u8;
            stream.type = data.scrsz;
          }).catch(error => {
            stream.type = 'invalidable'
          }).finally(() => {
            waitCount--;

            if (waitCount <= 0) {
              resolve(channels);
            }
          });
        }

        channels.push(stream);
      });
    });
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
              resolve(this.buildStreamsInfo(jsonData.data.program.video));
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
    let context = Magic.getCSvar('window.Q.PageInfo.playPageInfo', 'object');

    let data = {
      title: context.tvName,
      m3u8: stream.m3u8
    };

    this.dispatchLoad({
      type: stream.type,
      url: 'm3u8-downloader://' + encodeURIComponent(JSON.stringify(data))
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
