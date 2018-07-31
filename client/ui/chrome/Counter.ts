import {
  WeekendsWebAppContext, WeekendsWebAppState, WeekendsWebAppActions
} from '../../AppState'
import {ChromeBundle} from '../../platform/Renderer/index'

interface CounterChromeState {
  counterElem: Element
  lastCount: number
}

function initialize(
  container: Element, 
  state: WeekendsWebAppState,
  context: WeekendsWebAppContext
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
  state: WeekendsWebAppState,
  context: WeekendsWebAppContext,
  ccState: CounterChromeState
) {
  if (ccState.lastCount != state.counter.count) {
    ccState.counterElem.textContent = state.counter.count.toString()
    ccState.lastCount = state.counter.count
  }
  return ccState
}

export const chromeBundle: ChromeBundle<
  WeekendsWebAppState, WeekendsWebAppContext, CounterChromeState
> = {
  containerId: "counter",
  initialize,
  update,
}

export default chromeBundle
