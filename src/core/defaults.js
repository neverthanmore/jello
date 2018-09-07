'use strict';

const DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'x-www-form-urlencoded'
};

const defaults = {
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

[ 'delete', 'get', 'head' ].forEach(method => {
  defaults.headers[method] = {};
});

[ 'post', 'put', 'patch' ].forEach(method => {
  defaults.headers[method] = Object.assign({}, DEFAULT_CONTENT_TYPE);
});

export default defaults;
