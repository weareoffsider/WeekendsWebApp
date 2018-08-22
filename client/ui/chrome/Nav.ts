import {
  SeaTimeContext, SeaTimeState, SeaTimeActions
} from '../../AppState'
import {ChromeBundle} from '../../platform/Renderer/index'


function initialize(
  container: HTMLElement, 
  state: SeaTimeState,
  context: SeaTimeContext
) {
  container.innerHTML = `
    <h1>Weekends Web App Nav</h1>
  `
}

function update(
  container: HTMLElement, 
  state: SeaTimeState,
  context: SeaTimeContext
) {
}

export const chromeBundle: ChromeBundle<SeaTimeState, SeaTimeContext, void> = {
  containerId: "nav",
  initialize,
  update,
}

export default chromeBundle
