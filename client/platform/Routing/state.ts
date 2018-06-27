// tags
// reducer
// action creators


import {StateAction, StateBundle} from '../State'

export interface RouterState {
  currentPath: string
  loadedRouteName: string
  loadedRouteParams: {[key: string]: string}
}

// initial State
export const initialState: RouterState = {
  currentPath: window.location.pathname,
  loadedRouteName: "",
  loadedRouteParams: {},
}


export const CHANGE_CURRENT_PATH = "Router/CHANGE_CURRENT_PATH"
export const CHANGE_LOADED_ROUTE = "Router/CHANGE_LOADED_ROUTE"


export function reducer (state: RouterState = initialState, action: any) {
  if (action.type == CHANGE_CURRENT_PATH) {
    return Object.assign({}, state, {currentPath: action.path, loadedRouteName: "", loadedRouteParams: {}})
  } else if (action.type == CHANGE_LOADED_ROUTE) {
    return Object.assign({}, state, {
      loadedRouteName: action.name,
      loadedRouteParams: action.params,
    })
  }

  return state
}


export function changeCurrentPath (path: string) {
  return {type: CHANGE_CURRENT_PATH, path}
}

export function changeLoadedRoute (routeName: string, routeParams: any) {
  return {
    type: CHANGE_LOADED_ROUTE,
    name: routeName,
    params: routeParams,
  }
}

export const stateActions = {
  changeCurrentPath,
  changeLoadedRoute,
}


export const stateBundle: StateBundle<RouterState> = {
  name: "routing",
  reducer,
  initial: initialState,
  actions: stateActions,
}

export interface RoutingStateShape {
  routing: RouterState
}

export interface RoutingActionsShape {
  routing: typeof stateActions
}


export default stateBundle
