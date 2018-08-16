'use strict';

import isAbsoluteURL from '../helpers/isAbsoluteURL';
import combineURLs from '../helpers/combineURLs';
import transformRequest from '../helpers/transformRequest';
import transformResponse from '../helpers/transformResponse';
import merge from '../helpers/merge';
import adapter from './fetch';

function throwIfCancelRequest(config) {
  if (config.cancelToken) {
    throw config.cancelToken.throwIfHasReason();
  }
}

export default function dispatchRequest(config) {
  throwIfCancelRequest(config);

  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  config.headers = config.headers || {};

  config.data = transformRequest.transformData(
    config.data,
    config.headers
  );

  config.headers = merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  config.requestOptions = transformRequest.transfromRequestoptions(config.requestOptions);

  ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'].forEach(method => {
    delete config.headers[method];
  });

  return adapter(config).then(response => {

  }, reason => {

  });
}
