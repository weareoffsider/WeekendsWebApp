import {find} from '../Utils'

type ViewParams = {[key: string]: string}
type ViewRenderFunction = (viewElement: HTMLElement, params?: ViewParams) => void
type PreloadFunction = (params?: ViewParams) => Promise<any>
type ViewRenderFunctionNoParams = (viewElement: HTMLElement) => void

interface RoutePath {
  name: string
  matcher: string
  preload: PreloadFunction
  render: ViewRenderFunction
}

export interface RouteStack {
  viewElement?: HTMLElement
  routes: RoutePath[]
}


export interface RouterState {
  loadedLocation?: string
  lastContainer?: HTMLElement
}


export function initializeRouter(
  routeStack: RouteStack
) {
  const routerState = {
    loadedLocation: "",
  }

  updateView(routeStack, routerState)

  window.addEventListener('popstate', function (event) {
    updateView(routeStack, routerState)
  })

  document.body.addEventListener('click', function (event) {
    if (event.target && (event.target as HTMLElement).tagName == "A") {
      const anchor = (event.target as HTMLAnchorElement)
      const root = window.location.origin
      if (anchor.href && anchor.href.indexOf(root) == 0) {
        event.preventDefault()
        window.history.pushState({}, "", anchor.href)
        updateView(routeStack, routerState)
      }
    }
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
  render: ViewRenderFunction | ViewRenderFunctionNoParams
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


export function updateView (routeStack: RouteStack, routerState: RouterState) {
  const {viewElement, routes} = routeStack

  let currentLocation = window.location.pathname

  if (currentLocation[currentLocation.length - 1] != "/") {
    window.history.pushState({}, "", currentLocation + "/")
    currentLocation = window.location.pathname
  }

  if (currentLocation == routerState.loadedLocation) {
    return
  }

  if (routerState.lastContainer) {
    routerState.lastContainer.style.opacity = "0.5"
  }

  routerState.loadedLocation = currentLocation

  const newViewContainer = document.createElement('div')
  newViewContainer.setAttribute('data-route-path', currentLocation)
  viewElement.appendChild(newViewContainer)

  routes.some((route) => {
    const viewParams = matchPathToRoute(currentLocation, route.matcher)

    if (viewParams) {
      route.preload(viewParams).then((result) => {
        if (routerState.lastContainer) {
          const leavingElement = routerState.lastContainer
          leavingElement.parentNode.removeChild(leavingElement)
        }
        route.render(newViewContainer, viewParams)
        routerState.lastContainer = newViewContainer
      })
      return true
    }

    return false
  })
}
