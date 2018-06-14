import {find} from '../Utils'

type ViewParams = {[key: string]: string}
type ViewRenderFunction = (viewElement: HTMLElement, params?: ViewParams) => void
type ViewRenderFunctionNoParams = (viewElement: HTMLElement) => void

interface RoutePath {
  name: string
  matcher: string
  render: ViewRenderFunction
}

export interface RouteStack {
  viewElement?: HTMLElement
  routes: RoutePath[]
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
  render: ViewRenderFunction | ViewRenderFunctionNoParams
): RouteStack {
  routeStack.routes.push({name, matcher, render})
  return routeStack
}

export function initializeRouter(
  routeStack: RouteStack
) {
  updateView(routeStack)

  window.addEventListener('popstate', function (event) {
    updateView(routeStack)
  })

  document.body.addEventListener('click', function (event) {
    if (event.target && (event.target as HTMLElement).tagName == "A") {
      const anchor = (event.target as HTMLAnchorElement)
      const root = window.location.origin
      if (anchor.href && anchor.href.indexOf(root) == 0) {
        event.preventDefault()
        window.history.pushState({}, "", anchor.href)
        updateView(routeStack)
      }
    }
  })
}

function matchPathToRoute (path: string, matcher: string): ViewParams {
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


function updateView (routeStack: RouteStack) {
  const {viewElement, routes} = routeStack
  let currentLocation = window.location.pathname
  if (currentLocation[currentLocation.length - 1] != "/") {
    window.history.pushState({}, "", currentLocation + "/")
    currentLocation = window.location.pathname
  }

  routes.some((route) => {
    const viewParams = matchPathToRoute(currentLocation, route.matcher)

    if (viewParams) {
      route.render(viewElement, viewParams)
      return true
    }

    return false
  })
}
