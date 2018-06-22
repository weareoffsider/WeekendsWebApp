import {createStore, combineReducers} from 'redux'


export interface StateAction {
  type: string
}


export interface StateBundle<StateType> {
  name: string
  initial: StateType
  reducer: (state: StateType, action: StateAction) => StateType
  actions: any
}



export const INCREMENT_ACTION = {type: "INCREMENT"}
export const DECREMENT_ACTION = {type: "DECREMENT"}
export const NOTHING_ACTION = {type: "NOTHING"}

const countInitial = {count: 0}

export function reducer (state: any = {count: 0}, action: any) {
  if (action.type == "INCREMENT") {
    return {count: state.count + 1}
  } else if (action.type == "DECREMENT") {
    return {count: state.count - 1}
  } else {
    return state
  }
}

export function incrementCount () { return INCREMENT_ACTION }
export function decrementCount () { return DECREMENT_ACTION }

export const CounterStateBundle: StateBundle<typeof countInitial> = {
  name: "counter",
  reducer,
  initial: countInitial,
  actions: {
    incrementCount,
    decrementCount,
  },
}




export default function createStateStore(stateBundles: StateBundle<any>[]) {
  const reducerSet = {}
  const initialState = {}

  stateBundles.forEach((stateBundle) => {
    reducerSet[stateBundle.name] = stateBundle.reducer
    initialState[stateBundle.name] = stateBundle.initial
  })

  const store = createStore(
    combineReducers(reducerSet),
    initialState,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  )

  const actionsBundle = {}
  stateBundles.forEach((stateBundle) => {
    const bundleActions = {}
    Object.keys(stateBundle.actions).forEach((key) => {
      const func = stateBundle.actions[key]

      bundleActions[key] = function (...args) {
        store.dispatch(func(...args))
      }
    })

    actionsBundle[stateBundle.name] = bundleActions
  })

  return {store, actionsBundle}
}
