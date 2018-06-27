import {createStore, Store, combineReducers} from 'redux'


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


export interface CountState {
  count: number
}

const countInitial = {count: 0}

export function reducer (state: CountState = {count: 0}, action: any) {
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

export const countActions = {
  incrementCount,
  decrementCount,
}

export const CounterStateBundle: StateBundle<CountState> = {
  name: "counter",
  reducer,
  initial: countInitial,
  actions: countActions,
}

export interface CounterStateShape {
  counter: CountState
}

export interface CounterActionsShape {
  counter: typeof countActions
}



export default function createStateStore<AppState, AppActions>(stateBundles: StateBundle<any>[]) {
  const reducerSet: any = {}
  const initialState: any = {}

  stateBundles.forEach((stateBundle) => {
    reducerSet[stateBundle.name] = stateBundle.reducer
    initialState[stateBundle.name] = stateBundle.initial
  })

  const store: Store<AppState> = createStore(
    combineReducers(reducerSet),
    initialState,
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
  )

  const actionsBundle: any = {}
  stateBundles.forEach((stateBundle) => {
    const bundleActions: any = {}
    Object.keys(stateBundle.actions).forEach((key) => {
      const func = stateBundle.actions[key]

      bundleActions[key] = function (...args: any[]) {
        store.dispatch(func(...args))
      }
    })

    actionsBundle[stateBundle.name] = bundleActions
  })

  return {store, actionsBundle: (actionsBundle as AppActions)}
}
