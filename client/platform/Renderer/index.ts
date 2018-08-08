import {Store} from 'redux'
import {RoutePath, RouteStack} from '../Routing'
import {RoutingActionsShape, RoutingStateShape} from '../Routing/state'
import {matchPathToRoute} from '../Routing/Matching'
import {find} from '../Utils'

interface ActiveViewState {
  container: HTMLDivElement
  viewBundle?: ViewBundle<any, any, any>
  renderState?: any
  route: RoutePath
  params?: any
}

export interface RendererState {
  chromeStates: {[key: string]: any}
  viewStates: {[key: string]: ActiveViewState}
}


export interface ChromeBundle<S, C, RenderUnitState> {
  containerId: string
  initialize: (
    container: Element,
    state: S,
    context: C
  ) => RenderUnitState
  update: (
    container: Element,
    state: S,
    context: C,
    ruState?: RenderUnitState
  ) => RenderUnitState
}

export interface ViewBundle<S, C, RenderUnitState> {
  viewId: string
  preload?: (
    state: S,
    context: C
  ) => Promise<any>
  initialize: (
    container: Element,
    params: any,
    state: S,
    context: C
  ) => RenderUnitState
  update: (
    container: Element,
    params: any,
    state: S,
    context: C,
    ruState?: RenderUnitState
  ) => RenderUnitState
  destroy: (
    container: Element,
    params: any,
    state: S,
    context: C,
    ruState?: RenderUnitState
  ) => void
}



export default function initializeRenderer<
  S extends Store<RoutingStateShape>, A extends RoutingActionsShape, C
>(
  routeStack: RouteStack,
  chromeBundles: ChromeBundle<any, C, any>[],
  viewBundles: ViewBundle<any, C, any>[],
  viewElement: HTMLElement,
  store: S,
  actionsBundle: A,
  context: C
) {
  let rendererState: RendererState = {
    chromeStates: {},
    viewStates: {},
  }
  const initialState = store.getState()

  const keyedViewBundles: {[key: string]: ViewBundle<any, C, any>} = {}
  viewBundles.forEach((vb) => {
    keyedViewBundles[vb.viewId] = vb
  })

  chromeBundles.forEach((cb) => {
    const containerElem = document.getElementById(cb.containerId)
    rendererState.chromeStates[cb.containerId] = (
      cb.initialize(containerElem, initialState, context)
    )
  })

  const unsub = store.subscribe(() => {
    const appState = store.getState()
    const currentLocation = appState.routing.currentPath
    const mainRouteToRender = appState.routing.loadedRouteName == "__error__"
      ? {name: "__error__", matcher: "", viewId: "__error__"}
      : find(routeStack.routes, (route) => {
          return route.name == appState.routing.loadedRouteName
        })

    if (!rendererState.viewStates[currentLocation]) {
      // we need a new container to render this new view

      // fade out all existing views ready for transition views
      Object.keys(rendererState.viewStates).forEach((path) => {
        const {container} = rendererState.viewStates[path]
        container.style.opacity = "0.5"
      })

      // create the new container and add it to our activeViews cache
      const newViewContainer = document.createElement('div')
      viewElement.appendChild(newViewContainer)
      newViewContainer.setAttribute('data-path', currentLocation)

      rendererState.viewStates[currentLocation] = {
        container: newViewContainer,
        route: mainRouteToRender || null,
        params: appState.routing.loadedRouteParams,
      }

    } else {
      // we need to update our container with the most up to date route details
      const {container} = rendererState.viewStates[currentLocation]
      const viewParams = appState.routing.loadedRouteParams
      rendererState.viewStates[currentLocation].params = viewParams
      rendererState.viewStates[currentLocation].route = mainRouteToRender

      // try the render, and trigger an error route if this render fails
      try {
        const viewBundle = keyedViewBundles[mainRouteToRender.viewId]
        rendererState.viewStates[currentLocation].viewBundle = viewBundle
        rendererState.viewStates[currentLocation].renderState = (
          viewBundle.initialize(
            container,
            rendererState.viewStates[currentLocation].params,
            appState,
            context
          )
        )
      } catch (e) {
        rendererState.viewStates[currentLocation].viewBundle = keyedViewBundles["__error__"]
        actionsBundle.routing.changeLoadedRoute(
          "__error__",
          {code: "500", err: e.toString()}
        )
      }
    }

    if (mainRouteToRender) {
      // if our main route is in fact loaded, then we don't need all the stale
      // view containers any more, remove them
      Object.keys(rendererState.viewStates).forEach((path) => {
        if (path != currentLocation) {
          const {params, container, viewBundle, renderState} = rendererState.viewStates[path]
          viewBundle.destroy(container, params, appState, context, renderState)
          container.parentNode.removeChild(container)
          delete rendererState.viewStates[path]
        }
      })
    }

    // perform an update all active views
    // TODO: this causes the active view to render twice, to optimise
    Object.keys(rendererState.viewStates).forEach((path) => {
      const {container, viewBundle, params, renderState} = rendererState.viewStates[path]
      if (viewBundle) {
        rendererState.viewStates[path].renderState = (
          viewBundle.update(container, params, appState, context, renderState)
        )
      }
    })

    chromeBundles.forEach((cb) => {
      const containerElem = document.getElementById(cb.containerId)
      rendererState.chromeStates[cb.containerId] = (
        cb.update(
          containerElem, appState, context,
          rendererState.chromeStates[cb.containerId]
        )
      )
    })
  })

  return function() {
    unsub()
  }
}
