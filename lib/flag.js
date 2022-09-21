const _ = require('lodash')
const { findChromiumOriginal, findChromiumSrc } = require('./utils');

// Convert `AnyTokenLikeThis` to `any-token-like-this`.
const camelToHyphen = _.memoize((camel) =>
  camel.replace(/[A-Z]/g, m => '-' + m.toLowerCase()).replace(/^-/g, ''));

// Convert `AnyTokenLikeThis` to `kAnyTokenLikeThis`
const constantName = _.memoize((camel) => 'k' + camel);

// First text to insert into browser/about_flags.cc
const about_flags_cc_text1 = (camel) => `
constexpr char ${constantName(camel)}Name[] =
    "TODO: NAME TEXT";
constexpr char ${constantName(camel)}Description[] =
    "TODO: DESCRIPTION TEXT";`;

// Second text to insert into browser/about_flags.cc
const about_flags_cc_text2 = (camel) => `
    {"${camelToHyphen(camel)}",
      flag_descriptions::${constantName(camel)}Name,
      flag_descriptions::${constantName(camel)}Description,
      kOsAll, FEATURE_VALUE_TYPE(
          blink::features::${constantName(camel)})},`;

// Text to insert into chromium_src/third_party/blink/common/features.cc
const features_cc = (camel) => `
// TODO: Comment here about how we Enable/Disable by default
const base::Feature ${constantName(camel)}{
  "${camel}", base::FEATURE_ENABLED_BY_DEFAULT};`;

// Text to insert into chromium_src/third_party/blink/public/common/features.h
const features_h = (camel) => `
BLINK_COMMON_EXPORT extern const base::Feature ${constantName(camel)};`;

const flag = (camel) => {
  console.log(about_flags_cc_text1(camel));
  console.log(about_flags_cc_text2(camel));
  console.log(features_cc(camel));
  console.log(features_h(camel));
};

exports.flag = flag;
