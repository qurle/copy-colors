// I really don't care about quality of the code, but you can make pull request to make it bettor!

// Constants
const confirmMsgs = ["Done!", "You got it!", "Aye!", "Is that all?", "My job here is done.", "Gotcha!", "It wasn't hard.", "Got it! What's next?"]
const actionMsgs = ["Copied for", "Affected", "Made it with", "Duplicated colors of"]
const idleMsgs = ["No available objects", "Can\'t handle this", "Nothing to do. Check fills and strokes of objects", "Nothing to copy"]
const nothingMsg = "Select something"
const destinations = ["🔲 to stroke", "🔳 to fill"]

// Variables
let notification: NotificationHandler
let selection: ReadonlyArray<SceneNode>
let working: boolean
let count: number = 0

figma.on("currentpagechange", abort);

// Main + Elements Check
figma.parameters.on("input", ({ query, result }: ParameterInputEvent) => {
  result.setSuggestions(destinations.filter(s => s.includes(query)))
})

figma.on("run", ({ parameters }: RunEvent) => {
  if (parameters) {
    working = true
    selection = figma.currentPage.selection
    console.log(selection.length + " selected")

    if (selection.length > 0)
      for (const node of selection)
        copyColors(node, parameters)
    else notify(nothingMsg)
    finish()
  }
})

function copyColors(node, parameters: ParameterValues) {
  if ("fills" in node && "strokes" in node) {
    switch (parameters["destination"]) {
      case destinations[0]:
        if (node.fills.length > 0) {
          node.strokeWeight = node.strokeWeight || 5
          node.strokeAlign = node.strokeAlign || "OUTSIDE"
          if (node.fillStyleId !== "") node.strokeStyleId = node.fillStyleId
          else node.strokes = node.fills
          count++
        }
        break;
      case destinations[1]:
        if (node.strokes.length > 0) {
          if (node.strokeStyleId !== "") node.fillStyleId = node.strokeStyleId
          else node.fills = node.strokes
          count++
        }
    }
  }
}

function finish() {
  working = false
  // Notification
  if (count > 0) {
    notify(confirmMsgs[Math.floor(Math.random() * confirmMsgs.length)] +
      " " + actionMsgs[Math.floor(Math.random() * actionMsgs.length)] +
      " " + ((count === 1) ? "only one layer" : (count + " layers")))
  }
  else notify(idleMsgs[Math.floor(Math.random() * idleMsgs.length)])
  figma.closePlugin()
}

function notify(text: string) {
  if (notification != null)
    notification.cancel()
  notification = figma.notify(text)
}

function abort() {
  if (notification != null)
    notification.cancel()
  if (working) {
    notify("Plugin work have been interrupted")
  }
}