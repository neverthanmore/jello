'use strict';

import { isFormData } from '../helpers/type';
import buildURL from '../helpers/buildURL';
import cookies from '../helpers/cookies';
import isURLSameOrigin from '../helpers/isURLSameOrigin';
import createError from './createError';

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
      let bodyData;
      let responseType = ['arrayBuffer', 'formData', 'json', 'text']
        .includes(config.responseType) || 'json';

      // ie send 1223 insteadof 204
      let resolveResponse = {
        headers: response.url,
        ok: response.url,
        redirected: response.url,
        status: response.status === 1223 ? 204 : response.status,
        statusText: response.status === 1223 ? 'No Content' : response.statusText,
        type: response.url,
        url: response.url,
        request: fetchPromise,
      };
      // if (!response.bodyUsed) {
      response.clone()[responseType]().then(data => {
        resolveResponse.data = data;
        /**
         * respons.ok == true equals code (200~299)
         */
        if (response.ok) {
          resolve(resolveResponse);
        } else {
          reject(createError(
            'Request failed with status code ' + resolveResponse.status,
            config,
            null,
            resolveResponse.request,
            response
          ));
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

    const fetchPromise = fetch(buildURL(url, config.params, config.paramsSerializer), requestOptions)
      .then(fetchResolve, fetchReject);

    // handle timeout
    if (config.timeout) {
      setTimeout(() => {
        reject(createError(`timeout of ${config.timeout} ms exceeded`, config, 'ECONNABORTED'));
        abortController.abort();
        fetchPromise = null;
      }, config.timeout);
    }

    // handle cancel
    if (config.cancelToken) {
      config.cancelToken.promise.then(cancel => {
        if (!fetchPromise) {
          return;
        }
        reject(cancel);
        abortController.abort();
        fetchPromise =  null;
      });
    }
  });
}
