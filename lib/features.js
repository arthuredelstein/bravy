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
  "FledgeEnforceKAnonymity",
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

  console.log({featureSettings})
  const enabledFeatures = Object.entries(featureSettings).filter(([k,v]) => v === true).map(([k,v]) => k)

  if (enabledFeatures.length > 0) {
    flags['enable-features'] = enabledFeatures.join(",")
  }
  const cmd = `'${app}' ${formatFlags(flags)}`
  console.log(cmd)
  exec(cmd)
  return cmd;
}

const page = (title, content) => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>${title}</title>
      <meta charset='utf8' />
      <script src='/assets/script.js'></script>
      <style>
      #launchButton {
        margin: 20px;
        font-size: 20px;
      }
      </style>
    </head>
    <body>
    ${content}
    </body>
  </html>
  `.trim()

const controls = () => {
  const checkboxes = enableFeatureList.map(feature => `
    <div>
    <input type="checkbox" class="featureFlag" id="${feature}" name="${feature}" value="${feature}"></input>
    <label for=${feature}>${feature}</label>
    </div>
    `).join("\n");
  const button = `<button type="button" id="launchButton">launch</button>`
  const lastCommandDiv = `<div><span id="lastCommandLabel">Last command:&nbsp;</span><span id="lastCommand"></span></div>`
  return checkboxes + button + lastCommandDiv;
}

const controlPage = () => {
  const heading = `<h1>Flip brave feature flags</h1>\n`
  return page("bravey features", heading + controls())
}


const app = express()
app.use("/assets", express.static(__dirname + '/assets'))
app.use(express.json())

app.get('/', function (req, res) {
  res.send(controlPage());
})

app.post('/launch', function (req, res) {
  console.log("req.body:", req.body)
  const { profile, featureSettings } = req.body
  const command = launch({profile, featureSettings})
  res.send(JSON.stringify({ command }))
})

app.listen(3000)