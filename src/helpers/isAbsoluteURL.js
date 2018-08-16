'use strict';

/**
 * Determines whether the specified url is absolute
 *
 * @param {String} url the url to test
 * @return {Boolean} True if the specified URL is absolute, otherwise false
 */
export default function isAbsoluteURL(url) {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//g.test(url);
}
