import {expect} from 'chai'
import {RouteStack, addRoute, initializeRouter} from './index'
import {matchPathToRoute, getUrl} from './Matching'

import RoutingStateBundle, {RoutingStateShape, RoutingActionsShape} from './state'
import createStateStore from '../State'
import {ViewBundle} from '../Renderer'


describe('Routing', () => {
  describe('RoutingState', () => {
    it('initializes correctly', () => {
      expect(RoutingStateBundle.initial).to.be.deep.equal({
        currentPath: window.location.pathname,
        loadedRouteName: "",
        loadedRouteParams: {},
      })
    })

    it('changeCurrentPath updates correctly', () => {
      const initialState = RoutingStateBundle.initial
      const action = RoutingStateBundle.actions.changeCurrentPath('/author/')
      const state2 = RoutingStateBundle.reducer(initialState, action)
      expect(state2.currentPath).to.equal('/author/')
    })

    it('changeLoadedRoute updates correctly', () => {
      const initialState = RoutingStateBundle.initial
      const action = RoutingStateBundle.actions.changeLoadedRoute('author', {id: '1234'})
      const state2 = RoutingStateBundle.reducer(initialState, action)
      expect(state2.loadedRouteName).to.equal('author')
      expect(state2.loadedRouteParams).to.deep.equal({id: '1234'})
    })
  })

  describe('RouteStack', () => {
    it('can build a routeStack using addRoute', () => {
      const routeStack: RouteStack = {rootPath: "", routes: []}
      addRoute(routeStack, "home", "/")
      addRoute(routeStack, "entry", "/entry/:slug/")
      addRoute(routeStack, "about", "/about/")
      addRoute(routeStack, "author", "/author/:id/")
      const expectedRouteStack = {
        "rootPath":"",
        "routes":[
          {"name":"home","matcher":"/","viewId":"home"},
          {"name":"entry","matcher":"/entry/:slug/","viewId":"entry"},
          {"name":"about","matcher":"/about/","viewId":"about"},
          {"name":"author","matcher":"/author/:id/","viewId":"author"}
        ]
      }
      expect(routeStack).to.be.deep.equal(expectedRouteStack)
    })
  })

  describe('RouteMatcher', () => {
    describe('matchPathToRoute', () => {
      it('match path to route on parameter free routes', () => {
        const params = matchPathToRoute('/about/', '/about/')
        expect(params).to.be.deep.equal({})
        const params2 = matchPathToRoute('/', '/')
        expect(params2).to.be.deep.equal({})
      })

      it('if no match from route to matcher return null', () => {
        const params = matchPathToRoute('/abo', '/about/')
        expect(params).to.be.deep.equal(null)
        const params2 = matchPathToRoute('/entry/', '/entry/:slug/')
        expect(params).to.be.deep.equal(null)
      })

      it('match path to route on parametized routes', () => {
        const params = matchPathToRoute('/entry/this-is-the-article/', '/entry/:slug/')
        expect(params).to.be.deep.equal({slug: 'this-is-the-article'})
        const params2 = matchPathToRoute('/author/1234/', '/author/:id/')
        expect(params2).to.be.deep.equal({id: '1234'})
      })
    })

    describe('getUrl', () => {
      const routeStack: RouteStack = {rootPath: "", routes: []}
      addRoute(routeStack, "home", "/")
      addRoute(routeStack, "entry", "/entry/:slug/")
      addRoute(routeStack, "about", "/about/")
      addRoute(routeStack, "author", "/author/:id/")

      it('renders parameter free routes to string', () => {
        const url = getUrl(routeStack, 'home')
        expect(url).to.be.equal('/')
        const url2 = getUrl(routeStack, 'about')
        expect(url2).to.be.equal('/about/')
      })

      it('renders parametized routes to string', () => {
        const url = getUrl(routeStack, 'entry', {slug: "the-slug"})
        expect(url).to.be.equal('/entry/the-slug/')
        const url2 = getUrl(routeStack, 'author', {id: "123"})
        expect(url2).to.be.equal('/author/123/')
      })

      it('renders 404-route-not-found when invalid route name given', () => {
        const url = getUrl(routeStack, 'ent', {slug: "the-slug"})
        expect(url).to.be.equal('/404-route-not-found')
      })

      it('renders parameter-not-found when a route parameter is missing', () => {
        const url = getUrl(routeStack, 'entry', {slu: "the-slug"})
        expect(url).to.be.equal('/entry/parameter-not-found/')
      })
    })
  })
})

describe('Routing Integration Test', () => {
  let savedPath: string
  let routerRemove: () => void
  let calledPreload = false
  before(() => {
    savedPath = window.location.href
  })

  const routeStack: RouteStack = {rootPath: "", routes: []}
  addRoute(routeStack, "home", "/")
  addRoute(routeStack, "entry", "/entry/:slug/")
  addRoute(routeStack, "about", "/about/")
  addRoute(routeStack, "author", "/author/:id/")
  
  const viewBundles: ViewBundle<any, any, any>[] = [{
    viewId: "__error__", initialize: () => {}, update: () => {}, destroy: () => {},
  }, {
    viewId: "home", initialize: () => {}, update: () => {}, destroy: () => {},
  }, {
    viewId: "entry", initialize: () => {}, update: () => {}, destroy: () => {},
  }, {
    viewId: "about",
    initialize: () => {}, update: () => {}, destroy: () => {},
    preload: () => {
      calledPreload = true
      return new Promise((resolve, reject) =>{ 
        window.setTimeout(() => {
          resolve()
        }, 1000)
      })
    },
  }]

  const {store, actionsBundle} = createStateStore<RoutingStateShape, RoutingActionsShape>([
    RoutingStateBundle
  ])

  it('initializes correctly', () => {
    routerRemove = initializeRouter(routeStack, viewBundles, store, actionsBundle, context)
  })

  it('catches Anchor Tag clicks', () => {
    const anchor = document.createElement('a')
    anchor.href = '/entry/this-slug/'
    document.body.appendChild(anchor)
    anchor.click()
    expect(window.location.pathname).to.equal('/entry/this-slug/')
    document.body.removeChild(anchor)
  })

  it('catches history back events and pushes to store', (done) => {
    const anchor = document.createElement('a')
    anchor.href = '/about/'
    document.body.appendChild(anchor)
    anchor.click()
    expect(window.location.pathname).to.equal('/about/')
    let entered = false
    const unsub = store.subscribe(() => {
      if (entered) { return }
      entered = true
      const state = store.getState()
      expect(state.routing.currentPath).to.equal('/entry/this-slug/')
      unsub()
      window.setTimeout(done, 10) // timeout required for next test to work
                                  // on Firefox
    })
    window.history.back()
  })

  it('correctly updates loaded route details', () => {
    const state = store.getState()
    expect(state.routing.currentPath).to.equal('/entry/this-slug/')
    expect(state.routing.loadedRouteName).to.equal('entry')
    expect(state.routing.loadedRouteParams).to.deep.equal({slug: 'this-slug'})
  })

  it('correctly calls and waits for preload', (done) => {
    calledPreload = false
    const startTime = +new Date()
    window.history.pushState({}, "", "/about/")
    store.dispatch(RoutingStateBundle.actions.changeCurrentPath('/about/'))
    expect(calledPreload).to.equal(true)
    let entered = false
    const unsub = store.subscribe(() => {
      if (entered) { return }
      entered = true
      const state = store.getState()
      const endTime = +new Date()
      expect(state.routing.loadedRouteName).to.equal('about')
      expect(endTime - startTime).to.be.gt(700)
      unsub()
      done()
    })
  })

  after((done) => {
    window.setTimeout(() => {
      routerRemove()
      window.history.replaceState({}, "", savedPath)
      done()
    }, 500)
  })
})
