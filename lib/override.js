const path = require("node:path");
const fs = require("node:fs");

const licenseHeader = () => {
  const year = new Date().getFullYear();
  return `/* Copyright (c) ${year} The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */`;
};

const createOverridePath = (chromiumPath) =>
      "brave/chromium_src/" + chromiumPath;

const createIncludeGuard = (chromiumPath) => createOverridePath(chromiumPath)
      .toUpperCase().split(/[\/\.]/).join("_") + "_";

const createOriginalPath = (chromiumPath) =>
      "src/" + chromiumPath;

const createHeaderPath = (chromiumPath) => chromiumPath.replace(/\.cc$/, ".h");

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

const findChromiumSrc = () => {
  const currentDirectory = process.cwd();
  if (currentDirectory.includes("/src/brave")) {
    const stem = currentDirectory.split("/src/brave")[0];
    return stem + "/src/brave/chromium_src";
  }
};

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

const override = (filePath) => {
  const chromiumSrc = findChromiumSrc();
  if (chromiumSrc === undefined) {
    throw new Error("Could not find chromium_src directory.");
  }
  const destinationPath = path.join(chromiumSrc, "/", filePath);
  if (filePath.endsWith(".h")) {
    const contents = createHeaderContents(filePath);
    writeNewFile(destinationPath, contents);
  } else if (filePath.endsWith(".cc")) {
    const contents = createSourceContents(filePath);
    writeNewFile(destinationPath, contents);
  }
};

exports.override = override
// test("third_party/blink/renderer/core/timing/performance_entry.h");
