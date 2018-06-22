// TODO: build WeekendsWebApp
// Platform Layer
// Routing
//   Loading Transitions
//
// Utilities
//   Common DOM Operations
//   Math Operations
//
// Internationalization (i18n) / Localization (l10n)
//   Translation Functions
//   Dates & Times
//   Numeric Formats
//
// Application State
//   In Memory (lost every time there is a refresh)
//   Local Database (IndexedDB)
//   Local Storage (localStorage, sessionStorage)
//
// Notifications
// Location Service
// Sound
//
// API Communication Layer
//   get requests
//   post requests
//   websockets
//   file uploads


import {
  RouteStack, addRoute, getUrl, initializeRouter,
  DataNotFoundError, DataForbiddenError,
} from './platform/Routing'

import RouterStateBundle from './platform/Routing/state'

import createStateStore, {CounterStateBundle} from './platform/State'


const routeStack: RouteStack = {
  routes: [],
  renderError: function(viewElement: HTMLElement, params?: any) {
    if (params.code == "404") {
      viewElement.innerHTML = `
        <h2>404 Error</h2>
        <pre>${ JSON.stringify(params) }</pre>
        <a href="${getUrl(routeStack, 'home')}">Go Back Home</a>
      `
    } else if (params.code == "403") {
      viewElement.innerHTML = `
        <h2>403 Forbidden Error</h2>
        <pre>${ JSON.stringify(params) }</pre>
        <a href="${getUrl(routeStack, 'home')}">Go Back Home</a>
      `
    } else {
      viewElement.innerHTML = `
        <h2>Unspecified Error</h2>
        <pre>${ JSON.stringify(params) }</pre>
        <a href="${getUrl(routeStack, 'home')}">Go Back Home</a>
      `
    }
  },
}

addRoute(
  routeStack,
  "home",
  "/",
  function (params: any) {
    return Promise.resolve(true)
  },
  function (viewElement: HTMLElement, params: any, appState: any) {
    viewElement.innerHTML = `
      <h2>This is the home page</h2>
      <p>The count is ${appState.counter.count}</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam. </p>
      <ul>
        <li><a href="${getUrl(routeStack, 'entry', {slug: "entry-one"})}">Entry One</a></li>
        <li><a href="${getUrl(routeStack, 'entry', {slug: "entry-two"})}">Entry Two</a></li>
        <li><a href="${getUrl(routeStack, 'entry', {slug: "entry-three"})}">Entry Three</a></li>
      </ul>
      <a href="${getUrl(routeStack, 'about')}">About</a>
      <a href="https://www.google.com">Go To Google</a>
    `
  }
)

addRoute(routeStack,
  "about",
  "/about/",
  function (params: any) {
    return new Promise((resolve, reject) => {
      window.setTimeout(resolve, 1000)
    })
  },
  function (viewElement: HTMLElement, params: any, appState: any) {
    viewElement.innerHTML = `
      <h2>This is the about page</h2>
      <p>The count is ${appState.counter.count}</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam. </p>
      <a href="${getUrl(routeStack, 'home')}">Home</a>
    `
  }
)


addRoute(routeStack,
  "entry",
  "/entry/:slug/",
  function (params: any) {
    const validEntries = [
      'entry-one',
      'entry-two',
    ]
    const forbiddenEntries = [
      'entry-three',
      'entry-four',
    ]

    return new Promise((resolve, reject) => {
      // reject(new Error("this is the entry route error"))
      window.setTimeout(function() {
        if (validEntries.indexOf(params.slug) != -1) {
          resolve(true)
        } else if (forbiddenEntries.indexOf(params.slug) != -1) {
          reject(new DataForbiddenError("This entry could not be accessed."))
        } else {
          reject(new DataNotFoundError("This entry could not be found."))
        }
      }, 2000)
    })
  },
  function (viewElement: HTMLElement, params: any, appState: any) {
    const {slug} = params
    viewElement.innerHTML = `
      <h2>This is an entry page - ${slug}</h2>
      <p>The count is ${appState.counter.count}</p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam hendrerit suscipit dui vitae aliquet. Nullam suscipit varius erat eu sagittis. Ut efficitur bibendum nibh, in faucibus urna interdum ut. Duis faucibus tellus id suscipit vulputate. Nunc nunc magna, egestas id gravida eget, scelerisque quis odio. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur vitae massa eu dui bibendum aliquam. </p>
      <a href="${getUrl(routeStack, 'home')}">Home</a>
    `
  }
)


document.addEventListener('DOMContentLoaded', function (event) {
  const viewElement = document.getElementById('view')
  routeStack.viewElement = viewElement
  const {store, actionsBundle} = createStateStore([
    CounterStateBundle,
    RouterStateBundle,
  ])

  const countElement = document.querySelector('.count')
  const incrementButton = document.querySelector('.increment')
  const decrementButton = document.querySelector('.decrement')

  incrementButton.addEventListener('click', actionsBundle.counter.incrementCount)
  decrementButton.addEventListener('click', actionsBundle.counter.decrementCount)

  store.subscribe(() => {
    const state = store.getState()
    countElement.textContent = state.counter.count
  })

  initializeRouter(routeStack, store, actionsBundle)
})









