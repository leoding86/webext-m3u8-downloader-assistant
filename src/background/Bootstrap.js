import Browser from '@/modules/Browser/Browser';
import eventMaps from './eventMaps';
import Application from './Application';

class Bootstrap {
  /**
   * @static
   * @type {Bootstrap}
   */
  static instance;

  constructor() {
    this.application = Application.getDefault();
    this.browser = Browser.getBrowser();
  }

  static boot() {
    if (Bootstrap.instance) {
      throw new Error('Application has booted up');
    }

    Bootstrap.instance = new Bootstrap();
    Bootstrap.instance.startup();
  }

  getWebRequestEventFilter(appMethodName) {
    const methodName = appMethodName + 'Filter';
    const globalMethodName = 'webRequestEventGlobalFilter';

    return typeof this.application[methodName] === 'function' ?
      this.application[methodName].call(this.application) : typeof this.application[globalMethodName] === 'function' ?
        this.application[globalMethodName].call(this.application) : {};
  }

  getWebRequestEventOptExtraInfoSpec(appMethodName) {
    const methodName = appMethodName + 'OptExtraInfoSpec';
    const globalMethodName = 'webRequestEventGlobalOptExtraInfoSpec';

    return typeof this.application[methodName] === 'function' ?
      this.application[methodName].call(this.application) : typeof this.application[globalMethodName] === 'function' ?
        this.application[globalMethodName].call(this.application) : [];
  }

  startup() {
    for (let event in eventMaps.webRequest) {
      let methodNames = eventMaps.webRequest[event];

      if (!Array.isArray(methodNames)) {
        methodNames = [methodNames];
      }

      methodNames.forEach(methodName => {
        if (typeof this.application[methodName] === 'function') {
          this.browser.webRequest[event].addListener(
            this.application[methodName].bind(this.application),
            this.getWebRequestEventFilter(methodName),
            this.getWebRequestEventOptExtraInfoSpec(methodName)
          );
        }
      });
    }

    for (let event in eventMaps.tabs) {
      let methodNames = eventMaps.tabs[event];

      if (!Array.isArray(methodNames)) {
        methodNames = [methodNames];
      }

      methodNames.forEach(methodName => {
        if (typeof this.application[methodName] === 'function') {
          this.browser.tabs[event].addListener(
            this.application[methodName].bind(this.application)
          );
        }
      });
    }

    for (let event in eventMaps.runtime) {
      let methodNames = eventMaps.runtime[event];

      if (!Array.isArray(methodNames)) {
        methodNames = [methodNames];
      }

      methodNames.forEach(methodName => {
        if (typeof this.application[methodName] === 'function') {
          this.browser.runtime[event].addListener(
            this.application[methodName].bind(this.application)
          );
        }
      });
    }
  }
}

export default Bootstrap;
