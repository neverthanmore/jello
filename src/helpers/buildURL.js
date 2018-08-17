'use strict';

import { isURLSearchParams, isDate, isObject } from './type';

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

export default function buildURL(url, params, paramsSerializer) {
  if (!params) {
    return url;
  }

  let serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toSting();
  } else {
    let parts = [];

    Object.keys(params).forEach(key => {
      let val = params[key];
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (isArray(val)) {
        key += '[]';
      } else {
        val = [ val ];
      }

      val.forEach(v => {
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
