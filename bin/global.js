#!/usr/bin/env node

const minimist = require('minimist');

const overrideLibrary = require('../lib/override.js');

// Displays the text in the console
const { both, _: argumentList } = minimist(process.argv.slice(2));
overrideLibrary.override(argumentList[0], { both });
