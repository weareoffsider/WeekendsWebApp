import {createStore} from 'redux'

export const INCREMENT_ACTION = {type: "INCREMENT"}
export const DECREMENT_ACTION = {type: "DECREMENT"}
export const NOTHING_ACTION = {type: "NOTHING"}

export function reducer (state: any = {count: 0}, action: any) {
  if (action.type == "INCREMENT") {
    return {count: state.count + 1}
  } else if (action.type == "DECREMENT") {
    return {count: state.count - 1}
  } else {
    return state
  }
}


export default function createStateStore(initial: any) {
  const store = createStore(
    reducer,
    initial,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  )

  return store
}
