import {
  SeaTimeContext, SeaTimeState, SeaTimeActions
} from '../../AppState'
import {ChromeBundle} from '../../platform/Renderer/index'

interface CounterChromeState {
  counterElem: Element
  lastCount: number
}

function initialize(
  container: Element, 
  state: SeaTimeState,
  context: SeaTimeContext
) {
  container.innerHTML = `
    <span class="count">${state.counter.count}</span>
    <button class="increment">Increment</button>
    <button class="decrement">Decrement</button>
  `
  const counterElem = container.querySelector('.count')
  const incrementButton = container.querySelector('.increment')
  const decrementButton = container.querySelector('.decrement')
  incrementButton.addEventListener('click', context.actions.counter.incrementCount)
  decrementButton.addEventListener('click', context.actions.counter.decrementCount)

  return {
    counterElem,
    lastCount: state.counter.count,
  }
}

function update(
  container: HTMLElement, 
  state: SeaTimeState,
  context: SeaTimeContext,
  ccState: CounterChromeState
) {
  if (ccState.lastCount != state.counter.count) {
    ccState.counterElem.textContent = state.counter.count.toString()
    ccState.lastCount = state.counter.count
  }
  return ccState
}

export const chromeBundle: ChromeBundle<
  SeaTimeState, SeaTimeContext, CounterChromeState
> = {
  containerId: "counter",
  initialize,
  update,
}

export default chromeBundle
