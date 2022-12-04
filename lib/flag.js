const path = require('node:path');
const fs = require('node:fs');
const _ = require('lodash');
const { execSync } = require('child_process');
const { findChromiumOriginal } = require('./utils');

// Convert `AnyTokenLikeThis` to `any-token-like-this`.
const camelToHyphen = _.memoize((camel) =>
  camel.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/^-/g, ''));

// Convert `AnyTokenLikeThis` to `kAnyTokenLikeThis`
const constantName = _.memoize((camel) => 'k' + camel);

// Add terminating backslashes to each line for the
// file browser/about_flags.cc
const backslashes = (s) => {
  const lines = [];
  for (const rawLine of s.split('\n')) {
    const line = rawLine + ' '.repeat(76 - rawLine.length) + '\\';
    lines.push(line);
  }
  return lines.join('\n');
};

// Instructions for inserting the right lines into several files
// so we can add a feature flag to Brave
const insertionData = [
  {
    file: 'browser/about_flags.cc',
    create: (camel) => `constexpr char ${constantName(camel)}Name[] =
    "TODO: NAME TEXT";
constexpr char ${constantName(camel)}Description[] =
    "TODO: DESCRIPTION TEXT";`,
    insertBefore: `}  // namespace

}  // namespace flag_descriptions`
  },
  {
    file: 'browser/about_flags.cc',
    create: (camel) => backslashes(`    {"${camelToHyphen(camel)}",
      flag_descriptions::${constantName(camel)}Name,
      flag_descriptions::${constantName(camel)}Description,
      kOsAll, FEATURE_VALUE_TYPE(
          blink::features::${constantName(camel)})},`),
    insertBefore: '    BRAVE_IPFS_FEATURE_ENTRIES'
  },
  {
    file: 'chromium_src/third_party/blink/common/features.cc',
    create: (camel) => `// TODO: Comment here about how we Enable/Disable by default
BASE_FEATURE(${constantName(camel)},
             "${camel}",
             base::FEATURE_ENABLED_BY_DEFAULT);\n`,
    insertBefore: `}  // namespace features
}  // namespace blink`
  },
  {
    file: 'chromium_src/third_party/blink/public/common/features.h',
    create: (camel) => `BLINK_COMMON_EXPORT BASE_DECLARE_FEATURE(${constantName(camel)});`,
    insertBefore: `\n}  // namespace features
}  // namespace blink`
  }
];

// Insert some `text` into a file at `filePath`, before the first
// text that matches `insertBefore`. Save it to the same file.
const insertInFile = (filePath, insertBefore, text) => {
  const contents = fs.readFileSync(filePath, 'utf-8');
  const contents2 = contents.replace(insertBefore, text + insertBefore);
  fs.writeFileSync(filePath, contents2, { encoding: 'utf-8' });
};

// Create an example of how our feature code can detect the state
// of the feature flag, along with necessary includes.
const flagConditional = (camel) => `
// Code for using the flag:
#include "base/feature_list.h"
#include "third_party/blink/public/common/features.h"
base::FeatureList::IsEnabled(blink::features::${constantName(camel)});`;

// The main function. Take a FeatureFlagName in camel case and edit the
// relevant files so that we have a working feature flag.
const flag = (camel) => {
  const cleanCamel = camel.replace(/^k/, '');
  const chromiumOriginal = findChromiumOriginal();
  const bravePath = path.join(chromiumOriginal, 'brave');
  for (const item of insertionData) {
    insertInFile(path.join(bravePath, item.file),
      '\n' + item.insertBefore,
      '\n' + item.create(cleanCamel));
  }
  console.log(execSync('git diff').toString());
  console.log(flagConditional(cleanCamel));
};

exports.flag = flag;
