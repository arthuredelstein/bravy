const path = require("node:path");
const fs = require("node:fs");
const _ = require("lodash");

const licenseHeader = () => {
  const year = new Date().getFullYear();
  return `/* Copyright (c) ${year} The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */`;
};

const createOverridePath = (chromiumPath) =>
      "brave/chromium_src/" + chromiumPath;

const createOriginalPath = (chromiumPath) =>
      "src/" + chromiumPath;

const createHeaderPath = (chromiumPath) => chromiumPath.replace(/\.cc$/, ".h");

const createIncludeGuard = (chromiumPath) => createOverridePath(chromiumPath)
      .toUpperCase().split(/[\/\.]/).join("_") + "_";

const createHeaderContents = (chromiumPath) => {
  const includeGuard = createIncludeGuard(chromiumPath);
  const pieces = [
    licenseHeader(),
    `#ifndef ${includeGuard}`,
    `#define ${includeGuard}`,
    `#include "${createOriginalPath(chromiumPath)}"`,
    `#endif  // ${includeGuard}`
  ];
  return pieces.join("\n\n") + "\n";
};

const createSourceContents = (chromiumPath) => {
  const originalPath = createOriginalPath(chromiumPath);
  const headerPath = createHeaderPath(chromiumPath);
  const pieces = [
    licenseHeader(),
    `#include "${headerPath}"`,
    `#include "${originalPath}"`
  ];
  if (originalPath.includes("third_party/blink/")) {
    pieces.push(`namespace blink {`);
    pieces.push(`}  // namespace blink`);
  }
  return pieces.join("\n\n") + "\n";
};

const findChromiumOriginal = _.memoize(() => {
  const currentDirectory = process.cwd();
  if (currentDirectory.includes("/src/brave")) {
    const stem = currentDirectory.split("/src/brave")[0];
    return path.join(stem, "/src/");
  }
});

const findChromiumSrc = _.memoize(() => {
  const chromiumOriginal = findChromiumOriginal();
  return path.join(chromiumOriginal, "brave/chromium_src");
});

const writeNewFile = (filePath, contents) => {
  if (fs.existsSync(filePath)) {
    throw new Error(`${filePath} already exists!`);
  }
  const parentDir = path.dirname(filePath);
  fs.mkdirSync(parentDir, { recursive: true });
  fs.writeFileSync(filePath, contents);
  const relativePath = path.relative(process.cwd(), filePath);
  console.log(`Wrote new file: ${relativePath}`);
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
    return filePath;
  }
  const absoluteFilePath = path.join(process.cwd(), filePath);
  const filePath2 = path.relative(chromiumSrc, absoluteFilePath);
  const originalPath2 = path.join(chromiumOriginal, filePath2);
  if (fs.existsSync(originalPath2)) {
    return filePath2;
  }
  throw new Error(`Could not find a file to be overridden: tried:
- "brave-browser/src/${filePath1}"
- "brave-browser/src/${filePath2}"`);
}

const override = (rawFilePath) => {
  const filePath = findOverrideDestinationPath(rawFilePath);
  const chromiumSrc = findChromiumSrc();
  if (filePath.endsWith(".h")) {
    const contents = createHeaderContents(filePath);
    writeNewFile(path.join(chromiumSrc, filePath), contents);
  } else if (filePath.endsWith(".cc")) {
    const contents = createSourceContents(filePath);
    writeNewFile(path.join(chromiumSrc, filePath), contents);
  }
};

exports.override = override
// test("third_party/blink/renderer/core/timing/performance_entry.h");
