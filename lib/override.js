const path = require('node:path');
const fs = require('node:fs');
const { findChromiumOriginal, findChromiumSrc } = require('./utils');
const strip = require('strip-comments');

const licenseHeader = () => {
  const year = new Date().getFullYear();
  return `/* Copyright (c) ${year} The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */`;
};

const createOverridePath = (chromiumPath) =>
  'brave/chromium_src/' + chromiumPath;

const createOriginalPath = (chromiumPath) =>
  'src/' + chromiumPath;

const createHeaderPath = (chromiumPath) => chromiumPath.replace(/\.cc$/, '.h');

const createIncludeGuard = (chromiumPath) => createOverridePath(chromiumPath)
  .toUpperCase().split(/[/.]/).join('_') + '_';

const createHeaderContents = (chromiumPath) => {
  const includeGuard = createIncludeGuard(chromiumPath);
  const pieces = [
    licenseHeader(),
    `#ifndef ${includeGuard}\n#define ${includeGuard}`,
    `#include "${createOriginalPath(chromiumPath)}"`,
    `#endif  // ${includeGuard}`
  ];
  return pieces.join('\n\n') + '\n';
};

const createSourceContents = (chromiumPath) => {
  const originalPath = createOriginalPath(chromiumPath);
  const headerPath = createHeaderPath(chromiumPath);
  const pieces = [
    licenseHeader(),
    `#include "${headerPath}"`,
    `#include "${originalPath}"`
  ];
  if (originalPath.includes('third_party/blink/')) {
    pieces.push('namespace blink {');
    pieces.push('}  // namespace blink');
  }
  return pieces.join('\n\n') + '\n';
};

const writeNewFile = (filePath, contents, debug) => {
  if (fs.existsSync(filePath)) {
    throw new Error(`${filePath} already exists!`);
  }
  const parentDir = path.dirname(filePath);
  fs.mkdirSync(parentDir, { recursive: true });
  const relativePath = path.relative(process.cwd(), filePath);
  if (!debug) {
    fs.writeFileSync(filePath, contents);
    console.log(`Wrote new file: ${relativePath}`);
  } else {
    console.log(`Would have written file: ${relativePath}`);
  }
};

const findOverrideDestinationPath = (filePath) => {
  const chromiumSrc = findChromiumSrc();
  if (chromiumSrc === undefined) {
    throw new Error("Could not find 'brave-browser/src/brave/chromium_src' directory.");
  }
  const chromiumOriginal = findChromiumOriginal();
  if (chromiumOriginal === undefined) {
    throw new Error("Could not find 'brave-browser/src' directory with chromium source code.");
  }
  const originalPath1 = path.join(chromiumOriginal, filePath);
  if (fs.existsSync(originalPath1)) {
    return { filePath, originalPath: originalPath1 };
  }
  const absoluteFilePath = path.join(process.cwd(), filePath);
  const filePath2 = path.relative(chromiumSrc, absoluteFilePath);
  const originalPath2 = path.join(chromiumOriginal, filePath2);
  if (fs.existsSync(originalPath2)) {
    return { filePath: filePath2, originalPath: originalPath2 };
  }
  throw new Error(`Could not find a file to be overridden. Tried:
- "brave-browser/src/${filePath}"
- "brave-browser/src/${filePath2}"`);
};

const showUniques = (originalPath) => {
  const contents = fs.readFileSync(originalPath).toString();
  const stripped = strip(contents);
  const tokens = stripped.match(/[A-Za-z_]+/g);
  const tokenCounts = {};
  for (const token of tokens) {
    tokenCounts[token] ??= 0;
    ++tokenCounts[token];
  }
  const uniqueTokens = [];
  for (const [token, count] of Object.entries(tokenCounts)) {
    if (count === 1) {
      uniqueTokens.push(token);
    }
  }
  console.log(`** Unique tokens in ${originalPath} **:\n` + uniqueTokens.sort().join('\n'));
};

const override = (rawFilePath, { both, debug }) => {
  console.log({ rawFilePath, both });
  const chromiumSrc = findChromiumSrc();
  if (chromiumSrc === undefined) {
    throw new Error("Can't find the 'brave/chromium_src' directory.");
  }
  const rawFileStem = rawFilePath.replace(/\.(h|cc)$/, '');
  if (both || rawFilePath.endsWith('.h')) {
    const { filePath, originalPath } = findOverrideDestinationPath(rawFileStem + '.h');
    const contents = createHeaderContents(filePath);
    writeNewFile(path.join(chromiumSrc, filePath), contents, debug);
    showUniques(originalPath);
  }
  if (both || rawFilePath.endsWith('.cc')) {
    const { filePath, originalPath } = findOverrideDestinationPath(rawFileStem + '.cc');
    const contents = createSourceContents(filePath);
    writeNewFile(path.join(chromiumSrc, filePath), contents, debug);
    showUniques(originalPath);
  }
};

exports.override = override;
// test("third_party/blink/renderer/core/timing/performance_entry.h");
