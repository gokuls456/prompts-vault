// Global loading counter — incremented per in-flight request.
// Components subscribe to be notified when loading starts/stops.
let count = 0;
let listeners = [];

const loadingState = {
  increment() {
    count++;
    listeners.forEach((l) => l(true));
  },
  decrement() {
    count = Math.max(0, count - 1);
    if (count === 0) listeners.forEach((l) => l(false));
  },
  /** Returns an unsubscribe function */
  subscribe(fn) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },
};

export default loadingState;
