'use strict';

/**
 * Interceptor manager
 */
export default class Interceptor {
  constructor() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled  The function to handle `then` for a `promise`
   * @param {Function} rejected The function to handle `reject` for a `promise`
   * @return {Number} An ID used to remove a interceptor
   */
  use(fulfilled, rejected) {
    this.handlers.push({
      fulfilled,
      rejected
    });

    return this.handlers.length - 1;
  }

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  delete(id) {
    if (this.handlers[id]) {
      delete this.handlers[id];
    }
  }

  /**
   * Iterate over all the registered interceptors
   *
   * @param {Function} fn The function to call for each interceptor
   */
  forEach(fn) {
    this.handlers.forEach(interceptor => {
      if (interceptor !== null) {
        fn(interceptor);
      }
    });
  }
}
