'use strict';

import { isFormData } from '../helpers/type';
import buildURL from '../helpers/buildURL';
import cookies from '../helpers/cookies';
import isURLSameOrigin from '../helpers/isURLSameOrigin';

export default function adapter(config) {
  return new Promise(resolve, reject => {
    const { headers, data, method, url, requestOptions } = config;

    if (isFormData(data)) { // let browser set it
      delete headers['Content-Type'];
    }

    // set body
    if (data === undefined) {
      requestOptions.body = null;
    } else {
      requestOptions.body = data;
    }

    // set abort controller，cover signal from
    const abortController = new AbortController();
    requestOptions.signal = abortController.signal;

    // get xsrf from cookies and add xsrf to header
    const xsrfValue = (requestOptions.credentials === 'include' && isURLSameOrigin(url)) && config.xsrfCookieName ?
      cookies.read(onfig.xsrfCookieName) :
      undefined;

    if (xsrfValue) {
      headers[config.xsrfHeaderName] = xsrfValue;
    }

    // add method、headers to requestOptions
    object.assign(requestOptions, {
      method, headers
    });

    // fetch resolve function
    function fetchResolve(response) {

    }

    // fetch reject function
    function fetchReject(response) {

    }

    const fetchPromise = fetch(buildURL(url, config.params, config.paramsSerializer), requestOptions)
      .then(fetchResolve, fetchReject);

    // handle timeout
    if (config.timeout) {

    }

    // handle cancel
    if (config.cancelToken) {

    }
  });
}
