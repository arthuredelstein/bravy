#!/usr/bin/env node

var override_library = require('../lib/override.js');

// Displays the text in the console
override_library.override(process.argv[2]);
