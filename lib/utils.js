const _ = require('lodash')
const path = require('node:path');

const findChromiumOriginal = _.memoize(() => {
  const currentDirectory = process.cwd();
  if (currentDirectory.includes('/src/brave')) {
    const stem = currentDirectory.split('/src/brave')[0];
    return path.join(stem, '/src/');
  }
});

const findChromiumSrc = _.memoize(() => {
  const chromiumOriginal = findChromiumOriginal();
  if (chromiumOriginal === undefined) {
    throw new Error("Can't find the 'brave-browser/src' directory.");
  }
  return path.join(chromiumOriginal, 'brave/chromium_src');
});

exports.findChromiumOriginal = findChromiumOriginal;
exports.findChromiumSrc = findChromiumSrc;
