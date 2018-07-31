import {Store} from 'redux'
import {RouteStack} from '../Routing'
import {RoutingActionsShape, RoutingStateShape} from '../Routing/state'
import {matchPathToRoute} from '../Routing/Matching'
import {find} from '../Utils'


export interface RendererState {
  chromeStates: {[key: string]: any}
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


export default function initializeRenderer<
  S extends Store<RoutingStateShape>, A extends RoutingActionsShape, C
>(
  routeStack: RouteStack,
  chromeBundles: ChromeBundle<any, C, any>[],
  viewElement: HTMLElement,
  store: S,
  actionsBundle: A,
  context: C
) {
  let rendererState: RendererState = {
    chromeStates: {},
  }
  const activeViews: any = {}
  const initialState = store.getState()

  chromeBundles.forEach((cb) => {
    const containerElem = document.getElementById(cb.containerId)
    rendererState.chromeStates[cb.containerId] = (
      cb.initialize(containerElem, initialState, context)
    )
  })

  store.subscribe(() => {
    const appState = store.getState()
    const currentLocation = appState.routing.currentPath
    const mainRouteToRender = appState.routing.loadedRouteName == "__error__"
      ? {render: routeStack.renderError}
      : find(routeStack.routes, (route) => {
          return route.name == appState.routing.loadedRouteName
        })

    if (!activeViews[currentLocation]) {
      // we need a new container to render this new view

      // fade out all existing views ready for transition views
      Object.keys(activeViews).forEach((path) => {
        const {container} = activeViews[path]
        container.style.opacity = "0.5"
      })

      // create the new container and add it to our activeViews cache
      const newViewContainer = document.createElement('div')
      viewElement.appendChild(newViewContainer)

      activeViews[currentLocation] = {
        container: newViewContainer,
        route: mainRouteToRender || null,
        params: appState.routing.loadedRouteParams,
      }

    } else {
      // we need to update our container with the most up to date route details
      const {container} = activeViews[currentLocation]
      const viewParams = appState.routing.loadedRouteParams
      activeViews[currentLocation].params = viewParams
      activeViews[currentLocation].route = mainRouteToRender

      // try the render, and trigger an error route if this render fails
      try {
        mainRouteToRender.render(
          container,
          viewParams,
          appState,
          context
        )
      } catch (e) {
        activeViews[currentLocation].route = { render: routeStack.renderError }
        actionsBundle.routing.changeLoadedRoute(
          "__error__",
          {code: "500", err: e.toString()}
        )
      }
    }

    if (mainRouteToRender) {
      // if our main route is in fact loaded, then we don't all the stale
      // view containers any more, remove them
      Object.keys(activeViews).forEach((path) => {
        if (path != currentLocation) {
          const {container} = activeViews[path]
          container.parentNode.removeChild(container)
          delete activeViews[path]
        }
      })
    }

    // perform an update all active views
    // TODO: this causes the active view to render twice, to optimise
    Object.keys(activeViews).forEach((path) => {
      const {container, route, params} = activeViews[path]
      if (route) {
        route.render(container, params, appState, context)
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
}
