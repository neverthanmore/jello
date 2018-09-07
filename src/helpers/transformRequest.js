'use strict';
import normalizeHeaderName from './normalizeHeaderName';
import setContentTypeIfUnset from './setContentTypeIfUnset';
import {
  isFormData, isArrayBuffer, isFile,
  isBlob, isArrayBufferView, isURLSearchParams,
  isObject, isUndefined
} from './type';

const REQUEST_OPTIONS = [
  'cache', 'credentials', 'destination', 'integrity', 'keepalive',
  'mode', 'redirect', 'referrer', 'referrerPolicy', 'signal'
];
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
  let result = {};
  REQUEST_OPTIONS.forEach(option => {
    if (!isUndefined(requestOptions[option])) {
      result[option] = requestOptions[option];
    }
  });
  return result;
}

export default {
  transformData,
  transfromRequestoptions
};
