'use strict';

import { isUndefined } from './type';

export default function setContentTypeIfUnset(headers, value) {
  if (!isUndefined(headers) && !isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}
