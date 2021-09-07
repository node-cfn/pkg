'use strict';

const { builtinModules } = require('module');

const rollup = require('rollup');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');

module.exports = function getSourceCode(sourceCodePath) {
  const inputOptions = {
    input: sourceCodePath,
    external: ['aws-sdk', 'cfn-response'].concat(builtinModules),
    plugins: [
      commonjs(),
      resolve({
        mainFields: ['module', 'main', 'jsnext'],
        preferBuiltins: true,
      }),
    ],
    onwarn (warning, warn) {
      if (warning.code === 'UNRESOLVED_IMPORT') {
        throw new Error(warning.message);
      }
      warn(warning);
    }
  };

  const outputOptions = {
    format: 'cjs',
    exports: 'named'
  };

  return rollup.rollup(inputOptions)
    .then(bundle => {
      return bundle.generate(outputOptions);
    })
    .then(result => {
      const [{ code, exports }] = result.output;

      if (exports.find(r => r === 'handler')) {    
        return code;
      }

      throw new Error(`missing 'module.exports.handler =' in source code`);
    });
};