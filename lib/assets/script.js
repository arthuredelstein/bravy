const handleLaunch = async () => {
  await fetch("/launch", {
    method: "post",
    body: { launch: true}
  })
}

const setup = () => {
  const launchButton = document.getElementById("launchButton")
  launchButton.addEventListener("click", handleLaunch)
}

document.addEventListener("load", setup);
