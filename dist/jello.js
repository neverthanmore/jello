(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.jello = factory());
}(this, (function () { 'use strict';

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'x-www-form-urlencoded'
  };

  var defaults = {
    requestOptions: {
      // An options object containing any custom settings that you want to apply to the request
      method: 'get',

      /**
       * A request has an associated mode, which is "same-origin", "cors", "no-cors", "navigate", or "websocket".
       * Unless stated otherwise, it is "no-cors"
       */
      mode: 'no-cors',

      /**
       * https://fetch.spec.whatwg.org/#concept-request-cache-mode
       * A request has an associated cache mode, which is "default", "no-store",
       * "reload", "no-cache", "force-cache", or "only-if-cached". Unless stated otherwise, it is "default"
       */
      cache: 'default',

      /**
       * A request has an associated credentials mode, which is "omit", "same-origin", or "include". Unless stated otherwise, it is "omit"
       * >= chrome 50  can accept FederatedCredential or PasswordCredential instance
       */
      credentials: 'omit',

      /**
       * A request has an associated redirect mode, which is "follow", "error", or "manual".
       * Unless stated otherwise, it is "follow".
       */
      redirect: 'follow'

      // referrer: 'client',
      // referrerPolicy: '',  https://w3c.github.io/webappsec-referrer-policy/
      // integrity: '', https://imququ.com/post/subresource-integrity.html
    },

    // requestData for body
    data: undefined,

    // timeout seted to abort request, if set to 0, no timeout func
    timeout: 0,

    /**
     * get xsrf token from cookies
     * add xsrf token to headers
     */
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
  };

  defaults.headers = {
    common: {
      Accept: 'application/json, text/plain, */*'
    }
  };

  ['delete', 'get', 'header'].forEach(function (method) {
    defaults.headers[method] = {};
  });

  ['post', 'put', 'patch'].forEach(function (method) {
    defaults.headers[method] = Object.assign({}, DEFAULT_CONTENT_TYPE);
  });

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  /**
   * Interceptor manager
   */

  var Interceptor = function () {
    function Interceptor() {
      classCallCheck(this, Interceptor);

      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled  The function to handle `then` for a `promise`
     * @param {Function} rejected The function to handle `reject` for a `promise`
     * @return {Number} An ID used to remove a interceptor
     */


    createClass(Interceptor, [{
      key: 'use',
      value: function use(fulfilled, rejected) {
        this.handlers.push({
          fulfilled: fulfilled,
          rejected: rejected
        });

        return this.handlers.length - 1;
      }

      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       */

    }, {
      key: 'delete',
      value: function _delete(id) {
        if (this.handlers[id]) {
          delete this.handlers[id];
        }
      }

      /**
       * Iterate over all the registered interceptors
       *
       * @param {Function} fn The function to call for each interceptor
       */

    }, {
      key: 'forEach',
      value: function forEach(fn) {
        this.handlers.forEach(function (interceptor) {
          if (interceptor !== null) {
            fn(interceptor);
          }
        });
      }
    }]);
    return Interceptor;
  }();

  /**
   * Multi Object deep clone
   *
   * @param {Array} objs Object Array to merge
   * @return {Object} result of merge
   */

  function merge() {
    for (var _len = arguments.length, objs = Array(_len), _key = 0; _key < _len; _key++) {
      objs[_key] = arguments[_key];
    }

    var result = {};

    function assignValue(val, key) {
      if (_typeof(result[key]) === 'object' && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
        result[key] = merge(result[key], val);
      } else {
        result[key] = val;
      }
    }

    var _loop = function _loop(i, l) {
      Object.keys(objs[i]).forEach(function (key) {
        return assignValue(objs[i][key], key);
      });
    };

    for (var i = 0, l = objs.length; i < l; i++) {
      _loop(i, l);
    }

    return result;
  }

  /**
   * Determines whether the specified url is absolute
   *
   * @param {String} url the url to test
   * @return {Boolean} True if the specified URL is absolute, otherwise false
   */

  function isAbsoluteURL(url) {
    return (/^([a-z][a-z\d\+\-\.]*:)?\/\//g.test(url)
    );
  }

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {String} baseURL The base url
   * @param {String} relativeURL The relative url
   * @return {String} The combined URL
   */

  function combineURLs(baseURL, relativeURL) {
    return relativeURL ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '') : baseURL;
  }

  function normalizeHeaderName(headers, normalizedName) {
    Object.keys(headers).forEach(function (key) {
      if (key !== normalizedName && key.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = headers[key];
        delete headers[key];
      }
    });
  }

  var toString = Object.prototype.toString;

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @return {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }
  /**
   * Determine if a value is FormData
   *
   * @param {Object} val The value to test
   * @return {boolean} True if the value is FormData, otherwise false
   */
  function isFormData(val) {
    return typeof FormData !== 'undefined' && val instanceof FormData;
  }

  /**
   * Determine if a value is ArrayBuffer
   *
   * @param {Object} val The value to test
   * @return {boolean} True if the value is ArrayBuffer, otherwise false
   */
  function isArrayBuffer(val) {
    return toString.call(val) === '[object ArrayBuffer]';
  }

  /**
   * Determine if a value is File
   *
   * @param {Object} val The value to test
   * @return {boolean} True if the value is File, otherwise false
   */
  function isFile(val) {
    return toString.call(val) === '[object File]';
  }

  /**
   * Determine if a value is Blob
   *
   * @param {Object} val The value to test
   * @return {boolean} True if the value is Blob, otherwise false
   */
  function isBlob(val) {
    return toString.call(val) === '[object Blob]';
  }

  /**
   * Determine if a value is ArrayBufferView
   *
   * @param {Object} val The value to test
   * @return {boolean} True if the value is ArrayBufferView, otherwise false
   */
  function isArrayBufferView(val) {
    var result = void 0;
    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
      return ArrayBuffer.isView(val);
    } else {
      result = val && val.buffer && val.buffer instanceof ArrayBuffer;
    }
    return result;
  }

  /**
   * Determine if a value is URLSearchParams
   *
   * @param {Object} val The value to test
   * @return {boolean} True if the value is URLSearchParams, otherwise false
   */
  function isURLSearchParams(val) {
    return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
  }

  /**
   * Determine if a value is Object
   *
   * @param {Object} val The value to test
   * @return {boolean} True if the value is Object, otherwise false
   */
  function isObject(val) {
    return (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
  }

  /**
   * Determine if a value is Date
   *
   * @param {Object} val The value to test
   * @return {boolean} True if the value is Date, otherwise false
   */
  function isDate() {
    return toString.call(val) === '[object Date]';
  }

  var REQUEST_OPTIONS = ['cache', 'credentials', 'destination', 'integrity', 'keepalive', 'mode', 'redirect', 'referrer', 'referrerPolicy', 'signal'];
  /**
   * deal data by type
   *
   * @param {Any} data request data
   * @param {Object} headers request headers
   * @return deal data
   */
  function transformData(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (isFormData(data) || isArrayBuffer(data) || isFile(data) || isBlob(data)) {
      return data;
    }

    if (isArrayBufferView(data)) {
      return data.buffer;
    }

    if (isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }

    if (isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }

    return data;
  }

  /**
   * Filter request option
   *
   * @param {Object} requestOptions
   * @return {Object} Request option has been filtered
   */
  function transfromRequestoptions(requestOptions) {
    var result = {};
    REQUEST_OPTIONS.forEach(function (option) {
      if (!isUndefined(requestOptions[option])) {
        result[option] = requestOptions[option];
      }
    });
    return result;
  }

  var transformRequest = {
    transformData: transformData,
    transfromRequestoptions: transfromRequestoptions
  };

  function encode(val) {
    return encodeURIComponent(val).replace(/%40/gi, '@').replace(/%3A/gi, ':').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%20/g, '+').replace(/%5B/gi, '[').replace(/%5D/gi, ']');
  }

  function buildURL(url, params, paramsSerializer) {
    if (!params) {
      return url;
    }

    var serializedParams = void 0;
    if (paramsSerializer) {
      serializedParams = paramsSerializer(params);
    } else if (isURLSearchParams(params)) {
      serializedParams = params.toSting();
    } else {
      var parts = [];

      Object.keys(params).forEach(function (key) {
        var val = params[key];
        if (val === null || typeof val === 'undefined') {
          return;
        }

        if (isArray(val)) {
          key += '[]';
        } else {
          val = [val];
        }

        val.forEach(function (v) {
          if (isDate(v)) {
            v = v.toISOString();
          } else if (isObject(v)) {
            v = JSON.stringify(v);
          }
          parts.push(encode(key) + '=' + encode(v));
        });
        serializedParams = parts.join('&');
      });
    }

    if (serializedParams) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  }

  var cookies = {
    read: function read(name) {
      var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
      return match ? decodeURIComponent(match[3]) : null;
    }
  };

  function isURLSameOrigin(url) {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');

    var resolveURL = function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: urlParsingNode.pathname.charAt(0) === '/' ? urlParsingNode.pathname : '/' + urlParsingNode.pathname
      };
    };

    var parsed = resolveURL(url);
    var originURL = resolveURL(url);

    return parsed.protocol === originURL.protocol && parsed.host === originURL.host;
  }

  function createError(message, config, code, response) {
    var error = new Error(message);
    if (code) {
      error.code = code;
    }
    error.config = config;
    error.response = response;
    return error;
  }

  function adapter(config) {
    return new Promise(resolve, function (reject) {
      var headers = config.headers,
          data = config.data,
          method = config.method,
          url = config.url,
          requestOptions = config.requestOptions;


      if (isFormData(data)) {
        // let browser set it
        delete headers['Content-Type'];
      }

      // set body
      if (data === undefined) {
        requestOptions.body = null;
      } else {
        requestOptions.body = data;
      }

      // set abort controller，cover signal from
      var abortController = new AbortController();
      requestOptions.signal = abortController.signal;

      // get xsrf from cookies and add xsrf to header
      var xsrfValue = requestOptions.credentials === 'include' && isURLSameOrigin(url) && config.xsrfCookieName ? cookies.read(onfig.xsrfCookieName) : undefined;

      if (xsrfValue) {
        headers[config.xsrfHeaderName] = xsrfValue;
      }

      // add method、headers to requestOptions
      object.assign(requestOptions, {
        method: method, headers: headers
      });

      // fetch resolve function
      function fetchResolve(response) {
        var responseType = ['arrayBuffer', 'formData', 'json', 'text'].includes(config.responseType) || 'json';

        // ie send 1223 insteadof 204
        var resolveResponse = {
          headers: response.url,
          ok: response.url,
          redirected: response.url,
          status: response.status === 1223 ? 204 : response.status,
          statusText: response.status === 1223 ? 'No Content' : response.statusText,
          type: response.url,
          url: response.url,
          request: fetchPromise
        };
        // if (!response.bodyUsed) {
        response.clone()[responseType]().then(function (data) {
          resolveResponse.data = data;
          /**
           * respons.ok == true equals code (200~299)
           */
          if (response.ok) {
            resolve(resolveResponse);
          } else {
            reject(createError('Request failed with status code ' + resolveResponse.status, config, null, resolveResponse.request, response));
          }
        });
        // }
      }

      // fetch reject function
      function fetchReject(response) {
        if (response !== 'DOMException: The user aborted a request.') {
          reject(createError('Network Error', config, null));
        }
      }

      var fetchPromise = fetch(buildURL(url, config.params, config.paramsSerializer), requestOptions).then(fetchResolve, fetchReject);

      // handle timeout
      if (config.timeout) {
        setTimeout(function () {
          reject(createError('timeout of ' + config.timeout + ' ms exceeded', config, 'ECONNABORTED'));
          abortController.abort();
          fetchPromise = null;
        }, config.timeout);
      }

      // handle cancel
      if (config.cancelToken) {
        config.cancelToken.promise.then(function (cancel) {
          if (!fetchPromise) {
            return;
          }
          reject(cancel);
          abortController.abort();
          fetchPromise = null;
        });
      }
    });
  }

  function throwIfCancelRequest(config) {
    if (config.cancelToken) {
      throw config.cancelToken.throwIfHasReason();
    }
  }

  function dispatchRequest(config) {
    throwIfCancelRequest(config);

    if (config.baseURL && !isAbsoluteURL(config.url)) {
      config.url = combineURLs(config.baseURL, config.url);
    }

    config.headers = config.headers || {};

    config.data = transformRequest.transformData(config.data, config.headers);

    config.headers = merge(config.headers.common || {}, config.headers[config.method] || {}, config.headers || {});

    config.requestOptions = transformRequest.transfromRequestoptions(config.requestOptions);

    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'].forEach(function (method) {
      delete config.headers[method];
    });

    return adapter(config).then(function (response) {
      throwIfCancelRequest(config);
      return response;
    }, function (reason) {
      throwIfCancelRequest(config);
      return Promise.reject(reason);
    });
  }

  /**
   * Cancel instance to throw
   */

  var Cancel = function () {
    function Cancel(message) {
      classCallCheck(this, Cancel);

      this.__CANCEL__ = true;
      this.message = message;
    }

    createClass(Cancel, [{
      key: 'toString',
      value: function toString() {
        return 'Cancel：' + (this.message || 'no message');
      }
    }]);
    return Cancel;
  }();

  var CancelToken = function () {
    function CancelToken() {
      var _this = this;

      classCallCheck(this, CancelToken);

      this.reason = null;
      this.promise = new Promise(function (resolve) {
        _this.resolvePromise = resolve;
      });
    }

    createClass(CancelToken, [{
      key: 'cancel',
      value: function cancel(message) {
        this.reason = new Cancel(message);
        this.resolvePromise(this.reason);
      }
    }, {
      key: 'throwIfHasReason',
      value: function throwIfHasReason() {
        if (this.reason) {
          throw this.reason;
        }
      }
    }], [{
      key: 'createInstance',
      value: function createInstance() {
        return new CancelToken();
      }
    }]);
    return CancelToken;
  }();

  function isCancel(value) {
    return !!(value && value.__CANCEL__);
  }

  var NO_DATA_METHOD = ['delete', 'get', 'head', 'options'];
  var WITH_DATA_METHOD = ['put', 'patch', 'post'];

  var Jello = function () {
    function Jello(defaultConifg) {
      classCallCheck(this, Jello);

      this.defaults = defaultConifg;

      this.interceptors = {
        request: new Interceptor(),
        response: new Interceptor()
      };

      this.forEachMethod();
    }

    createClass(Jello, [{
      key: 'request',
      value: function request(config) {
        if (typeof config === 'string') {
          conifg = merge({
            url: arguments[0]
          }, arguments[1]);
        }

        config = merge(this.defaults, { method: 'get' }, config);
        config.method = config.method.toLowerCase();

        var chain = [dispatchRequest, undefined];
        this.interceptors.request.forEach(function (interceptor) {
          chain.unshift(interceptor.fulfilled, interceptor.rejected);
        });

        this.interceptors.response.forEach(function (interceptor) {
          chain.push(interceptor.fulfilled, interceptor.rejected);
        });

        var promise = Promise.resolve(config);

        while (chain.length) {
          promise = promise.then(chain.shift(), chain.shift());
        }

        return promise;
      }
    }, {
      key: 'forEachMethod',
      value: function forEachMethod() {
        var _this = this;

        NO_DATA_METHOD.forEach(function (method) {
          _this[method] = function (url, config) {
            return _this.request(merge(config || {}, {
              method: method, url: url
            }));
          };
        });

        WITH_DATA_METHOD.forEach(function (method) {
          _this[method] = function (url, data, config) {
            return _this.request(merge(config || {}, {
              url: url, method: method, data: data
            }));
          };
        });
      }
    }, {
      key: 'cancelToken',
      get: function get$$1() {
        return CancelToken;
      }
    }, {
      key: 'isCancel',
      get: function get$$1() {
        return isCancel;
      }
    }]);
    return Jello;
  }();

  var jello = new Jello(defaults);
  jello.Jello = Jello;

  jello.version = '1.0.0';

  return jello;

})));
