import {expect} from 'chai'
import initializeRenderer, {ViewBundle, ChromeBundle} from '../Renderer'
import RoutingStateBundle, {RoutingStateShape, RoutingActionsShape} from '../Routing/state'
import createStateStore, {CounterStateBundle, CounterStateShape, CounterActionsShape} from '../State'
import {RouteStack, addRoute} from '../Routing'


interface RenderTestState extends RoutingStateShape, CounterStateShape { }
interface RenderTestActions extends RoutingActionsShape, CounterActionsShape { }

function makeRenderFunc(html: string) {
  return function(container: Element, params: any, state: RenderTestState) {
    container.innerHTML = `${html}<p>Counter State: ${state.counter.count}</p>`
  }
}

function chromeRenderFunc (container: Element, state: RenderTestState) {
  container.innerHTML = `<footer>Chrome Counter State: ${state.counter.count}</footer>`
}

describe('Renderer Integration Test', () => {
  let savedPath: string
  let rendererRemove: () => void
  let calledPreload = false
  const routeStack: RouteStack = {rootPath: "", routes: []}
  addRoute(routeStack, "home", "/")
  addRoute(routeStack, "entry", "/entry/:slug/")
  addRoute(routeStack, "about", "/about/")
  addRoute(routeStack, "author", "/author/:id/")

  const homeRender = makeRenderFunc(`<h1>Home</h1>`)
  const errorRender = makeRenderFunc(`<h1>ERROR</h1>`)
  const entryRender = makeRenderFunc(`<h1>Entry</h1>`)
  const aboutRender = makeRenderFunc(`<h1>About</h1>`)
  
  const viewBundles: ViewBundle<any, any, any>[] = [
    { viewId: "__error__", initialize: errorRender, update: errorRender, destroy: () => {}, },
    { viewId: "home", initialize: homeRender, update: homeRender, destroy: () => {}, },
    { viewId: "entry", initialize: entryRender, update: entryRender, destroy: () => {}, },
    { viewId: "about", initialize: aboutRender, update: aboutRender, destroy: () => {}, }
  ]

  const chromeBundles: ChromeBundle<any, any, any>[] = [
    { containerId: 'chrometest', initialize: chromeRenderFunc, update: chromeRenderFunc }
  ]

  const {store, actionsBundle} = createStateStore<RenderTestState, RenderTestActions>([
    RoutingStateBundle,
    CounterStateBundle,
  ])

  let viewElement: HTMLElement
  let chromeElement: HTMLElement

  before(() => {
    viewElement = document.createElement('div')
    chromeElement = document.createElement('div')
    chromeElement.id = 'chrometest'

    document.body.appendChild(viewElement)
    document.body.appendChild(chromeElement)
  })

  it('initializes correctly', () => {
    rendererRemove = initializeRenderer(
      routeStack, chromeBundles, viewBundles,
      viewElement,
      store, actionsBundle, {}
    )
  })

  it('chrome has initialized correctly', () => {
    expect(chromeElement.innerHTML).to.equal(
      '<footer>Chrome Counter State: 0</footer>'
    )
  })

  it('renders view when loaded', () => {
    actionsBundle.routing.changeCurrentPath('/')
    actionsBundle.routing.changeLoadedRoute('home', {})
    expect(viewElement.innerHTML).to.equal(
      '<div data-path="/"><h1>Home</h1><p>Counter State: 0</p></div>'
    )
  })

  it('updates view when state updates', () => {
    actionsBundle.counter.incrementCount()
    expect(viewElement.innerHTML).to.equal(
      '<div data-path="/"><h1>Home</h1><p>Counter State: 1</p></div>'
    )
    actionsBundle.counter.incrementCount()
    actionsBundle.counter.incrementCount()
    actionsBundle.counter.incrementCount()
    actionsBundle.counter.decrementCount()
    expect(viewElement.innerHTML).to.equal(
      '<div data-path="/"><h1>Home</h1><p>Counter State: 3</p></div>'
    )
  })

  it('divs created and transitioned in step with Routing preload', () => {
    actionsBundle.routing.changeCurrentPath('/entry/1234/')
    expect(viewElement.innerHTML).to.equal(
      '<div data-path="/" style="opacity: 0.5;"><h1>Home</h1><p>Counter State: 3</p></div>' +
      '<div data-path="/entry/1234/"></div>'
    )
    actionsBundle.routing.changeLoadedRoute('entry', {slug: '1234'})
    expect(viewElement.innerHTML).to.equal(
      '<div data-path="/entry/1234/"><h1>Entry</h1><p>Counter State: 3</p></div>'
    )
  })

  it('updates chrome when state updates', () => {
    actionsBundle.counter.resetCount()
    expect(chromeElement.innerHTML).to.equal('<footer>Chrome Counter State: 0</footer>')
    actionsBundle.counter.incrementCount()
    actionsBundle.counter.incrementCount()
    actionsBundle.counter.incrementCount()
    expect(chromeElement.innerHTML).to.equal('<footer>Chrome Counter State: 3</footer>')
    actionsBundle.counter.decrementCount()
    expect(chromeElement.innerHTML).to.equal('<footer>Chrome Counter State: 2</footer>')
  })

  it('ensure chrome and view state updates are in sync', () => {
    actionsBundle.counter.resetCount()
    expect(chromeElement.innerHTML).to.equal('<footer>Chrome Counter State: 0</footer>')
    expect(viewElement.innerHTML).to.equal(
      '<div data-path="/entry/1234/"><h1>Entry</h1><p>Counter State: 0</p></div>'
    )
    actionsBundle.counter.incrementCount()
    actionsBundle.counter.incrementCount()
    actionsBundle.counter.incrementCount()
    expect(chromeElement.innerHTML).to.equal('<footer>Chrome Counter State: 3</footer>')
    expect(viewElement.innerHTML).to.equal(
      '<div data-path="/entry/1234/"><h1>Entry</h1><p>Counter State: 3</p></div>'
    )
    actionsBundle.counter.decrementCount()
    expect(chromeElement.innerHTML).to.equal('<footer>Chrome Counter State: 2</footer>')
    expect(viewElement.innerHTML).to.equal(
      '<div data-path="/entry/1234/"><h1>Entry</h1><p>Counter State: 2</p></div>'
    )
  })

  after((done) => {
    rendererRemove()
    document.body.removeChild(viewElement)
    document.body.removeChild(chromeElement)
    done()
  })
})
