#!/usr/bin/env node

const minimist = require('minimist');

const overrideLibrary = require('../lib/override.js');
const flagLibrary = require('../lib/flag.js');

// Displays the text in the console
const { both, _: argumentList } = minimist(process.argv.slice(2));
if (argumentList[0] === 'override') {
  overrideLibrary.override(argumentList[1], { both });
} else if (argumentList[0] === 'flag') {
  flagLibrary.flag(argumentList[1]);
}
