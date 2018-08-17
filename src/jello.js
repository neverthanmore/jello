'use strict';

import defaults from './core/defaults';
import interceptor from './core/interceptor';
import merge from './helpers/merge';
import dispatchRequest from './core/dispatchRequest';
import cancelToken from './cancel/cancelToken';
import isCancel from './cancel/isCancel';

const NO_DATA_METHOD = ['delete', 'get', 'head', 'options'];
const WITH_DATA_METHOD = ['put', 'patch', 'post'];
class Jello {
  constructor(defaultConifg) {
    this.defaults = defaultConifg;

    this.interceptors = {
      request: new interceptor(),
      response: new interceptor()
    };

    this.forEachMethod();
  }

  get cancelToken() {
    return cancelToken;
  }

  get isCancel() {
    return isCancel;
  }

  request(config) {
    if (typeof config === 'string') {
      conifg = merge({
        url: arguments[0]
      }, arguments[1]);
    }

    config = merge(this.defaults, { method: 'get' }, config);
    config.method = config.method.toLowerCase();

    const chain = [dispatchRequest, undefined];
    this.interceptors.request.forEach(interceptor => {
      chain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor.fulfilled, interceptor.rejected);
    });

    const promise = Promise.resolve(config);

    while(chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }

  forEachMethod() {
    NO_DATA_METHOD.forEach(method => {
      this[method] = (url, config) => {
        return this.request(merge(config || {}, {
          method, url
        }));
      };
    });

    WITH_DATA_METHOD.forEach(method => {
      this[method] = (url, data, config) => {
        return this.request(merge(config || {}, {
          url, method, data
        }));
      };
    });
  }
};

const jello = new Jello(defaults);
jello.Jello = Jello;

export default jello;
