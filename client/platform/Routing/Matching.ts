import {find} from '../Utils'

import {RouteStack, RoutePath, ViewParams} from './index'




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


export function matchPathToRoute (path: string, matcher: string): ViewParams {
  const pathSegments = path.split("/")
  const matcherSegments = matcher.split("/")
  const viewParams: {[key: string]: string} = {}

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


