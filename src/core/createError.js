'use strict';

export default function createError(message, config, code, response) {
  let error = new Error(message);
  if (code) {
    error.code = code;
  }
  error.config = config;
  error.response = response;
  return error;
}
