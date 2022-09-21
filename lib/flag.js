const _ = require('lodash')
const { findChromiumOriginal, findChromiumSrc } = require('./utils');

// Convert `AnyTokenLikeThis` to `any-token-like-this`.
const camelToHyphen = _.memoize((camel) =>
  camel.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/^-/g, ''));

// Convert `AnyTokenLikeThis` to `kAnyTokenLikeThis`
const constantName = _.memoize((camel) => 'k' + camel);

const insertionData = [
  {file: "browser/about_flags.cc",
   create: (camel) => `
constexpr char ${constantName(camel)}Name[] =
    "TODO: NAME TEXT";
constexpr char ${constantName(camel)}Description[] =
    "TODO: DESCRIPTION TEXT";`,
   insertBefore: null},
  {file: "browser/about_flags.cc",
   create: (camel) => `
    {"${camelToHyphen(camel)}",
      flag_descriptions::${constantName(camel)}Name,
      flag_descriptions::${constantName(camel)}Description,
      kOsAll, FEATURE_VALUE_TYPE(
          blink::features::${constantName(camel)})},`,
   insertBefore: null},
  {file: "chromium_src/third_party/blink/common/features.cc",
   create: (camel) => `
// TODO: Comment here about how we Enable/Disable by default
const base::Feature ${constantName(camel)}{
  "${camel}", base::FEATURE_ENABLED_BY_DEFAULT};`,
   insertBefore: null},
  {file: "chromium_src/third_party/blink/public/common/features.h",
   create: (camel) => `
BLINK_COMMON_EXPORT extern const base::Feature ${constantName(camel)};`,
   insertBefore: null}
];

const flagConditional = (camel) => `
// Code for using the flag:
#include "base/feature_list.h"
#include "third_party/blink/public/common/features.h"
base::FeatureList::IsEnabled(blink::features::${constantName(camel)});`;

const flag = (camel) => {
  for (const item of insertionData) {
    console.log(item.file, item.create(camel));
  }
  console.log(flagConditional(camel));
};

exports.flag = flag;
