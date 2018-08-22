import {
  SeaTimeContext, SeaTimeState, SeaTimeActions
} from '../../AppState'

import {ViewBundle} from '../../platform/Renderer'

function preload (params: any, context: SeaTimeContext) {
  return Promise.resolve(true)
}

function render (
  viewElement: Element,
  params: any,
  appState: SeaTimeState,
  context: SeaTimeContext
) {
  const entries = []

  viewElement.innerHTML = `
    <h2>${context.localize.translate('home_page.title')}</h2>
  `
}

function destroy (
) {
}

const viewBundle: ViewBundle<SeaTimeState, SeaTimeContext, void> = {
  viewId: "home",
  preload,
  initialize: render,
  update: render,
  destroy,
}

export default viewBundle
