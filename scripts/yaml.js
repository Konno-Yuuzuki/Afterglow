'use strict'

const { Type, load, Schema } = require('js-yaml')

const withAlphaType = new Type('!alpha', {
  kind: 'sequence',
  construct: ([hexRGB, alpha]) => hexRGB + alpha,
  represent: ([hexRGB, alpha]) => hexRGB + alpha,
});

const schema = new Schema([withAlphaType]);

async function loadJSON(file) {
  return load(file, { schema });
}

module.exports = loadJSON;