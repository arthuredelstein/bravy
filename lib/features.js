const { exec } = require('node:child_process')
const express = require('express')

const formatFlags = (flagMap) => {
  const flagItems = Object.entries(flagMap).map(([key, val]) => `--${key}=${val}`);
  return flagItems.join(" ")
}

const enableFeatureList = [
  "AdAuctionReportingWithMacroApi",
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
  "TextFragmentAnchor"
]

const launch = ({profile, featureSettings}) => {
  const app = '/Applications/Brave Browser Nightly.app/Contents/MacOS/Brave Browser Nightly'

  let flags = {
    'profile-directory': profile,
  }
  if (enableFeatureList.length > 0) {
    flags['enable-features'] = enableFeatureList.join(",")
  }
  const cmd = `'${app}' ${formatFlags(flags)}`
  console.log(cmd)
  exec(cmd)
}

const page = (title, content) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
      <meta charset='utf8' />
      <script src='/assets/script.js'></script>
    </head>
    <body>
    ${content}
    </body>
  </html>
  `.trim()

const controls = () => {
  const checkboxes = enableFeatureList.map(feature => `
    <div>
    <input type="checkbox" id="${feature}" name="${feature}" value="${feature}"></input>
    <label for=${feature}>${feature}</label>
    </div>
    `).join("\n");
  const button = `<button type="button" id="launchButton">launch</button>`
  return checkboxes + button;
}

const controlPage = () => {
  const heading = `<h1>Flip brave feature flags</h1>\n`
  return page("bravey features", heading + controls())
}

const app = express()

app.get('/', function (req, res) {
  res.send(controlPage());
})

app.use(express.static('assets'))

app.post('/launch', function (req, res) {
  console.log("launch", req.body)
})

app.listen(3000)