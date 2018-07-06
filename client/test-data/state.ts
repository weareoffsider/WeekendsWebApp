// tags
// reducer
// action creators


import {StateAction, StateBundle} from '../platform/State'

export interface ContentState {
  [key: string]: {[key: string]: any}
}

// initial State
export const initialState: ContentState = {
  "articles": {},
  "authors": {},
}


export const PUT_CONTENT = "Content/PUT_CONTENT"


export function reducer (state: ContentState = initialState, action: any) {
  if (action.type == PUT_CONTENT) {
    const dataStore = state[action.dataType]
    const nextDataStore = {...dataStore, [action.dataKey]: action.data}
    return {...state, [action.dataType]: nextDataStore}
  }

  return state
}


export function putContent (dataType: string, dataKey: string, data: any) {
  return {type: PUT_CONTENT, dataType, dataKey, data}
}

export const stateActions = {
  putContent,
}


export const stateBundle: StateBundle<ContentState> = {
  name: "content",
  reducer,
  initial: initialState,
  actions: stateActions,
}

export interface ContentStateShape {
  content: ContentState
}

export interface ContentActionsShape {
  content: typeof stateActions
}


export default stateBundle
