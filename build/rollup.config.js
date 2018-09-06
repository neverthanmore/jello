'use strict';

import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'index.js',
  output: {
    file: './dist/jello.js',
    format: 'umd',
    name: 'jello'
  },
  plugins: [
    resolve({
      browser: true
    }),
    babel({
      exclude: 'node_modules/**', // 只编译我们的源代码
      externalHelpers: true,
      runtimeHelpers: true
    }),
    commonjs()
  ]
};
