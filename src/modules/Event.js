class Event {

  constructor (target) {
    this.target = target;
    this.events = {};
  }

  addListener (eventName, listener, thisArg) {
    if (undefined === this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push({
      caller: listener,
      thisArg: !thisArg ? this.target : thisArg
    });
  }

  addExclusiveListener (eventName, listener, thisArg) {
    this.events[eventName] = [];

    this.events[eventName].push({
      caller: listener,
      thisArg: !thisArg ? this.target : thisArg
    });
  }

  dispatch (eventName, args) {
    let newArgs = (Object.prototype.toString.call(args) === '[object Array]') ? args : [];

    if (this.events[eventName]) {
      this.events[eventName].forEach((listener) => {
        listener.caller.apply(listener.thisArg, newArgs);
      });
    }
  }

  removeEventListener(eventName, listener) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((eventListener, i) => {
        if (eventListener.caller === listener) {
          delete this.events[eventName][i]
        }
      })
    }
  }

  removeEventListeners(eventName) {
    this.events[eventName] = []
  }
}

export default Event;
