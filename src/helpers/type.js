'use strict';

const toString = Object.prototype.toString;

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
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is Number
 *
 * @param {Object} val The value to test
 * @return {boolean} True if the value is Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
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
  let result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
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

function isObject(val) {
  return typeof val === 'object';
}

export {
  isUndefined,
  isFormData,
  isNumber,
  isArrayBuffer,
  isFile,
  isBlob,
  isArrayBufferView,
  isURLSearchParams,
  isObject
};

export default {
  isUndefined,
  isFormData,
  isNumber,
  isArrayBuffer,
  isFile,
  isBlob,
  isArrayBufferView,
  isURLSearchParams,
  isObject
};
