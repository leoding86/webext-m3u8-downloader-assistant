export default {
  webRequest: {
    onBeforeSendHeaders: [
      'onWebRequestBeforeSendHeadersMgtv',
      'onWebRequestBeforeSendHeadersIqiyi'
    ]
  },

  tabs: {
    onRemoved: 'onTabsRemoved'
  },

  runtime: {
    onMessage: 'onRuntimeMessage',
    onConnect: 'onRuntimeConnect'
  }
};
