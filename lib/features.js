const { exec } = require('node:child_process')

const formatFlags = (flagMap) => {
  const flagItems = Object.entries(flagMap).map(([key, val]) => `--${key}=${val}`);
  return flagItems.join(" ")
}

const enableFeatureList = [
 /* "AdAuctionReportingWithMacroApi",
  "AdInterestGroupAPI",
  "AllowURNsInIframes",
  "AttributionReportingInBrowserMigration",
  "BackgroundResourceFetch",
  "BiddingAndScoringDebugReportingAPI",
  "BraveWebBluetoothAPI",
  "BrowsingTopics",
  "ClientHintsFormFactors",
  "ControlledFrame",
  "CssSelectorFragmentAnchor",
  "FencedFrames",
  "FencedFramesM120FeaturesPart2",
  "FileSystemAccessAPI",
  "Fledge",
  "FledgeBiddingAndAuctionServer",
  "FledgeConsiderKAnonymity",
  "FledgeEnforceKAnonymity   ",
  "InterestGroupStorage",
  "NavigatorConnectionAttribute",
  "Parakeet",
  "PartitionBlinkMemoryCache",
  "Prerender2",
  "PrivateAggregationApi",
  "ReduceCookieIPCs",
  "ReduceUserAgentMinorVersion",
  "RestrictWebSocketsPool",
  "SharedStorageAPI",
  "SharedStorageAPIM118",
  "SharedStorageAPIM125",
  "SharedStorageSelectURLLimit",
  "SpeculationRulesPrefetchFuture",
  "TextFragmentAnchor",*/
]

const launch = () => {
  const app = '/Applications/Brave Browser Nightly.app/Contents/MacOS/Brave Browser Nightly'

  let flags = {
    'profile-directory': 'Default',
  }
  if (enableFeatureList.length > 0) {
    flags['enable-features'] = enableFeatureList.join(",")
  }
  const cmd = `'${app}' ${formatFlags(flags)}`
  console.log(cmd)
  exec(cmd)
}