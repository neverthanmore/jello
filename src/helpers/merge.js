'use strict';

/**
 * Multi Object deep assign
 *
 * @param {Array} objs Object Array to merge
 * @return {Object} result of merge
 */
export default function merge(...objs) {
  let result = {};

  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (let i = 0, l = objs.length; i < l; i++) {
    Object.keys(objs[i]).forEach(key => assignValue(objs[i][key], key));
  }

  return result;
}
