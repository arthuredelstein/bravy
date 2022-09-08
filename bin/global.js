#!/usr/bin/env node

const minimist = require('minimist');

var override_library = require('../lib/override.js');

// Displays the text in the console
const { both, _ : argumentList } = minimist(process.argv.slice(2));
override_library.override(argumentList[0], { both });
