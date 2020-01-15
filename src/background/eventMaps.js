export default {
  webRequest: {
    onBeforeSendHeaders: [
      'onWebRequestBeforeSendHeadersMgtv'
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
