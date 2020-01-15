import Browser from '@/modules/Browser/Browser';

class Application {
  static default;

  constructor() {
    this.browser = Browser.getBrowser();
    this.sourcePool = new Map();
  }

  static getDefault() {
    if (!Application.default) {
      Application.default = new Application();
    }

    return Application.default;
  }

  webRequestEventGlobalFilter() {
    return {
      urls: [
        "*://*.mgtv.com/*"
      ]
    };
  }

  webRequestEventGlobalOptExtraInfoSpec() {
    return [
      "blocking",
      "requestHeaders",
      "extraHeaders"
    ];
  }

  onWebRequestBeforeSendHeadersMgtvFilter() {
    return {
      urls: [
        "*://*.api.mgtv.com/player/getSource*"
      ]
    };
  }

  onWebRequestBeforeSendHeadersMgtv(details) {
    let needSendMessage = true;

    this.sourcePool.set(details.tabId, details.url);

    for (let i = 0; i < details.requestHeaders.length; ++i) {
      let headerName = details.requestHeaders[i].name.toLowerCase();

      if (headerName === 'x-webextension') {
        needSendMessage = false;
      }

      if (headerName === 'referer' || headerName === 'x-webextension') {
        details.requestHeaders.splice(i, 1);
        break;
      }
    }

    if (needSendMessage) {
      this.browser.tabs.sendMessage(details.tabId, {
        status: 1,
        data: {
          source: details.url
        }
      });
    }

    details.requestHeaders.push({
      name: 'Referer',
      value: 'https://www.mgtv.com/'
    });

    return {
      requestHeaders: details.requestHeaders
    };
  }

  onTabsRemoved(tabId, removeInfo) {
    if (this.sourcePool.has(tabId)) {
      this.sourcePool.delete(tabId);
    }
  }

  onRuntimeMessage(message, sender, sendResponse) {
    //
  }

  onRuntimeConnect(port) {
    port.onMessage.addListener(message => {
      if (typeof message.action === 'string') {
        let className = message.action + 'Action';

        className = className.charAt(0).toUpperCase() + className.slice(1);

        import('./actions/' + className).then(module => {
          let action = new module.default();
          return action.handle.call(this, message.options).then(result => {
            port.postMessage({
              status: 'ok',
              data: result
            });
          }).catch(error => {
            throw error
          });
        }).catch(error => {
          throw error;
        });
      }
    });
  }
}

export default Application;
