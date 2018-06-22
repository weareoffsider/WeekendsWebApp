import {find} from '../Utils'

type ViewParams = {[key: string]: string}
type ViewRenderFunction = (viewElement: HTMLElement, params?: ViewParams, appState?: any) => void
type PreloadFunction = (params?: ViewParams) => Promise<any>

interface RoutePath {
  name: string
  matcher: string
  preload: PreloadFunction
  render: ViewRenderFunction
}

export interface RouteStack {
  viewElement?: HTMLElement
  routes: RoutePath[]
  renderError: ViewRenderFunction
}


export interface RouterContainerState {
  routePath?: RoutePath
  routeParams?: any
  container: HTMLElement
}

export interface RouterState {
  currentPath?: string,
  lastContainer?: RouterContainerState
  activeContainers: RouterContainerState[]
}




export function initializeRouter(
  routeStack: RouteStack,
  store: any,
  actionsBundle: any,
) {
  const routerState = {
    activeContainers: [],
  }

  actionsBundle.routing.changeCurrentPath(window.location.pathname)

  window.addEventListener('popstate', function (event) {
    actionsBundle.routing.changeCurrentPath(window.location.pathname)
  })

  document.body.addEventListener('click', function (event) {
    if (event.target && (event.target as HTMLElement).tagName == "A") {
      const anchor = (event.target as HTMLAnchorElement)
      const root = window.location.origin
      if (anchor.href && anchor.href.indexOf(root) == 0) {
        event.preventDefault()
        window.history.pushState({}, "", anchor.href)
        actionsBundle.routing.changeCurrentPath(window.location.pathname)
      }
    }
  })

  updateView(routeStack, store.getState(), routerState, actionsBundle)

  store.subscribe(() => {
    updateView(routeStack, store.getState(), routerState, actionsBundle)
  })
}



export function getUrl(
  routeStack: RouteStack,
  name: string,
  params?: ViewParams
) {
  const {routes} = routeStack
  const matchingRoute = find(routes, (route: RoutePath) => {
    return route.name == name
  })

  if (matchingRoute) {
    const segments = matchingRoute.matcher.split("/")
    const parsedSegments = segments.map((segment) => {
      if (segment[0] && segment[0] == ":") {
        const segmentParam = params[segment.slice(1)]
        if (segmentParam) {
          return segmentParam
        }
        console.warn(`Route named ${name} is missing a parameter ${segment.slice(1)}`)

        return 'parameter-not-found'
      } else {
        return segment
      }
    })

    return parsedSegments.join('/')
  } else {
    console.warn(`Route named ${name} not found`)
    return "/404-route-not-found"
  }
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

export function matchPathToRoute (path: string, matcher: string): ViewParams {
  const pathSegments = path.split("/")
  const matcherSegments = matcher.split("/")
  const viewParams = {}

  if (pathSegments.length != matcherSegments.length) {
    return null
  }

  const matched = pathSegments.every((pathSeg, ix) => {
    const matchSeg = matcherSegments[ix]

    if (matchSeg[0] && matchSeg[0] == ":") {
      viewParams[matchSeg.slice(1)] = pathSeg
      return pathSeg.length > 0
    } else {
      return pathSeg == matchSeg
    }
  })

  if (matched) {
    return viewParams
  } else {
    return null
  }
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


// state in ->
  // checks if the loadedLocation Changed
    //   if loadedLocation changes, start loading the new route
  // for all visible routes
    //  send state to visible route render functions


export function updateView (
  routeStack: RouteStack,
  appState: any,
  routerState: RouterState,
  actionsBundle: any
) {
  const {viewElement, routes} = routeStack

  let currentLocation = window.location.pathname

  if (currentLocation[currentLocation.length - 1] != "/") {
    window.history.pushState({}, "", currentLocation + "/")
    currentLocation = window.location.pathname
  }
  console.log("Initiating load of route:", currentLocation)

  routerState.activeContainers.forEach((containerState) => {
    containerState.routePath.render(
      containerState.container,
      containerState.routeParams,
      appState
    )
  })


  if (routerState.currentPath != appState.routing.currentPath) {

    routerState.currentPath = appState.routing.currentPath
    const newViewContainer = document.createElement('div')
    newViewContainer.setAttribute('data-route-path', currentLocation)
    viewElement.appendChild(newViewContainer)

    const containerState: RouterContainerState = {
      routePath: null,
      container: newViewContainer,
    }

    if (routerState.lastContainer) {
      routerState.lastContainer.container.style.opacity = "0.5"
    }


    const routeFound = routes.some((route) => {
      const viewParams = matchPathToRoute(currentLocation, route.matcher)

      containerState.routePath = route
      containerState.routeParams = viewParams

      if (viewParams) {

        // async loading period starts now
        route.preload(viewParams).then((result) => {

          if (currentLocation != window.location.pathname) {
            console.log("discarding loading of path: " + currentLocation)
            newViewContainer.parentNode.removeChild(newViewContainer)
            routerState.activeContainers = routerState.activeContainers.filter(
              (cont) => cont != containerState
            )
            console.log(routerState)
            return
          }


          console.log("Rendering of route:", currentLocation)
          if (routerState.lastContainer) {
            const leavingElement = routerState.lastContainer
            leavingElement.container.parentNode.removeChild(
              leavingElement.container
            )
            routerState.activeContainers = routerState.activeContainers.filter(
              (cont) => cont != leavingElement
            )
          }

          try {
            route.render(newViewContainer, viewParams, appState)
            routerState.activeContainers.push(containerState)
          } catch (e) {
            console.error(e)
            routeStack.renderError(newViewContainer, {code: "500", err: e.toString()})
          }

          routerState.lastContainer = containerState
        }, (err) => {
          console.error(err)
          if (currentLocation != window.location.pathname) {
            console.log("discarding loading of path: " + currentLocation)
            newViewContainer.parentNode.removeChild(newViewContainer)
            routerState.activeContainers = routerState.activeContainers.filter(
              (cont) => cont != containerState
            )
            return
          }

          console.log("Rendering of route:", currentLocation)
          if (routerState.lastContainer) {
            const leavingElement = routerState.lastContainer
            leavingElement.container.parentNode.removeChild(leavingElement.container)
            routerState.activeContainers = routerState.activeContainers.filter(
              (cont) => cont != leavingElement
            )
          }

          if (err.name == "DataForbiddenError") {
            routeStack.renderError(newViewContainer, {code: "403", err: err.toString()})
          } else if (err.name == "DataNotFoundError")  {
            routeStack.renderError(newViewContainer, {code: "404", err: err.toString()})
          } else {
            routeStack.renderError(newViewContainer, {code: "500", err: err.toString()})
          }

          routerState.lastContainer = containerState
        })
        // async loading code ends

        return true
      }

      return false
    })

    if (!routeFound) {
      console.error("Route not found for path " + currentLocation)
      routeStack.renderError(newViewContainer, {code: "404"})
      routerState.lastContainer = containerState
    }
  }


}
