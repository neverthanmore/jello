'use strict';
import Cancel from './cancel';
class CancelToken {
  constructor() {
    this.reason = null;
    this.promise = new Promise(resolve => {
      this.resolvePromise = resolve;
    });
  }

  cancel(message) {
    this.reason = new Cancel(message);
    this.resolvePromise(this.reason);
  }

  throwIfHasReason() {
    if (this.reason) {
      throw this.reason;
    }
  }

  static createInstance() {
    return new CancelToken();
  }
}

export default CancelToken;
