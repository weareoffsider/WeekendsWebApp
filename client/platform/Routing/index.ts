import {Store} from 'redux'
import {RoutingActionsShape, RoutingStateShape} from './state'
import {find} from '../Utils'

export type ViewParams = {[key: string]: string}
type ViewRenderFunction = (viewElement: HTMLElement, params?: ViewParams, appState?: any, context?: any) => void
  type PreloadFunction = (params: ViewParams, context: any) => Promise<any>

import renderer from '../Renderer'

import {matchPathToRoute, getUrl} from './Matching'

export {
  getUrl
}

export interface RoutePath {
  name: string
  matcher: string
  preload: PreloadFunction
  render: ViewRenderFunction
}

export interface RouteStack {
  routes: RoutePath[]
  renderError: ViewRenderFunction
}


export function normalizeRoute (targetRoute: string, pushStateIfWrong: boolean = false) {
  if (targetRoute[targetRoute.length - 1] != "/") {
    if (pushStateIfWrong) {
      window.history.pushState({}, "", targetRoute + "/")
    }
    return targetRoute + "/"
  } else {
    return targetRoute
  }
}


export function initializeRouter<
  S extends Store<RoutingStateShape>, A extends RoutingActionsShape, C
>(
  routeStack: RouteStack,
  store: S,
  actionsBundle: A,
  context: C
) {
  window.addEventListener('popstate', function (event) {
    actionsBundle.routing.changeCurrentPath(
      normalizeRoute(window.location.pathname, true)
    )
  })

  document.body.addEventListener('click', function (event) {
    if (event.target && (event.target as HTMLElement).tagName == "A") {
      const anchor = (event.target as HTMLAnchorElement)
      const root = window.location.origin
      if (anchor.href && anchor.href.indexOf(root) == 0) {
        event.preventDefault()
        window.history.pushState({}, "", normalizeRoute(anchor.href))
        actionsBundle.routing.changeCurrentPath(window.location.pathname)
      }
    }
  })

  let lastLoadedPath: string = null

  store.subscribe(() => {
    const appState = store.getState()
    const {routes} = routeStack

    if (lastLoadedPath != appState.routing.currentPath) {
      // route change needs to be initiated because path changed
      lastLoadedPath = appState.routing.currentPath
      const loadingPath = lastLoadedPath

      const routeFound = routes.some((route) => {
        const viewParams = matchPathToRoute(loadingPath, route.matcher)
        if (!viewParams) { return false }

        // route matches if view params is not null, begin async loading
        route.preload(viewParams, context).then((result) => {
          // preload successful, begin render
          
          // dont actually render if we've already moved on from this route
          if (loadingPath != window.location.pathname) { return }

          actionsBundle.routing.changeLoadedRoute(
            route.name, viewParams
          )
        }, (err) => {
          // error occurred during preload, render relevent error page
          let errorCode = "500"
          let errorText = err.toString()

          if (err.name == "DataForbiddenError") {
            errorCode = "403"
          } else if (err.name == "DataNotFoundError")  {
            errorCode = "404"
          }

          actionsBundle.routing.changeLoadedRoute(
            "__error__",
            {code: errorCode, err: errorText}
          )
        })

        return true
      })

      if (!routeFound) {
        // route was not found at all, no match so render 404
        actionsBundle.routing.changeLoadedRoute(
          "__error__",
          {code: "404"}
        )
      }
    }
  })

  actionsBundle.routing.changeCurrentPath(
    normalizeRoute(window.location.pathname, true)
  )
}


export function addRoute(
  routeStack: RouteStack,
  name: string,
  matcher: string,
  preload: PreloadFunction,
  render: ViewRenderFunction
): RouteStack {
  routeStack.routes.push({name, matcher, render, preload})
  return routeStack
}


export class DataNotFoundError extends Error {
  public name = "DataNotFoundError"

  constructor(readonly message: string) {
    super(message)
  }
}

export class DataForbiddenError extends Error {
  public name = "DataForbiddenError"

  constructor(readonly message: string) {
    super(message)
  }
}
