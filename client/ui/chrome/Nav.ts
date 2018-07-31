import {
  WeekendsWebAppContext, WeekendsWebAppState, WeekendsWebAppActions
} from '../../AppState'
import {ChromeBundle} from '../../platform/Renderer/index'


function initialize(
  container: HTMLElement, 
  state: WeekendsWebAppState,
  context: WeekendsWebAppContext
) {
  container.innerHTML = `
    <h1>Weekends Web App Nav</h1>
  `
}

function update(
  container: HTMLElement, 
  state: WeekendsWebAppState,
  context: WeekendsWebAppContext
) {
}

export const chromeBundle: ChromeBundle<WeekendsWebAppState, WeekendsWebAppContext> = {
  containerId: "nav",
  initialize,
  update,
}

export default chromeBundle
