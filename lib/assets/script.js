const collectCheckboxes = () => {
  const checkBoxes = [...document.getElementsByClassName("featureFlag")]
  return Object.fromEntries(checkBoxes.map(checkBox => [checkBox.id, checkBox.checked]))
}

const handleLaunch = async () => {
  const featureSettings = collectCheckboxes()
  console.log("handleLaunch")
  const response = await fetch("/launch", {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ profile: "Default", featureSettings }),
    cache: "no-store"
  })
  const responseJson = await response.json()
  document.getElementById("lastCommand").innerText = responseJson.command
}

const setup = () => {
  const launchButton = document.getElementById("launchButton")

  launchButton.addEventListener("click", handleLaunch)
}

document.addEventListener("DOMContentLoaded", setup);
