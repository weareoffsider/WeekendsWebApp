import {
  SeaTimeContext, SeaTimeState, SeaTimeActions
} from '../../AppState'

import {ViewBundle} from '../../platform/Renderer'


function render (
  viewElement: Element,
  params: any,
  appState: SeaTimeState,
  context: SeaTimeContext
) {
  if (params.code == "404") {
    viewElement.innerHTML = `
      <h2>404 Error</h2>
      <pre>${ JSON.stringify(params) }</pre>
      <a href="${context.getUrl('home')}">Go Back Home</a>
    `
  } else if (params.code == "403") {
    viewElement.innerHTML = `
      <h2>403 Forbidden Error</h2>
      <pre>${ JSON.stringify(params) }</pre>
      <a href="${context.getUrl('home')}">Go Back Home</a>
    `
  } else {
    viewElement.innerHTML = `
      <h2>Unspecified Error</h2>
      <pre>${ JSON.stringify(params) }</pre>
      <a href="${context.getUrl('home')}">Go Back Home</a>
    `
  }
}

function destroy (
) {
}

const viewBundle: ViewBundle<SeaTimeState, SeaTimeContext, void> = {
  viewId: "__error__",
  initialize: render,
  update: render,
  destroy,
}

export default viewBundle
