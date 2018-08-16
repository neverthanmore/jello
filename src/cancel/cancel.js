'use strict';
/**
 * Cancel instance to throw
 */
class Cancel {
  constructor(message) {
    this.__CANCEL__ = true;
    this.message = message;
  }

  toString() {
    return 'Cancel：' + (this.message || 'no message');
  }
}

export default Cancel;
