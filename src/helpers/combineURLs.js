'use strict';
/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {String} baseURL The base url
 * @param {String} relativeURL The relative url
 * @return {String} The combined URL
 */
export default function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
}
